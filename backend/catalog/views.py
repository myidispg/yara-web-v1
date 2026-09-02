from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.pagination import LimitOffsetPagination
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.db.models import F, Min, Q, DecimalField
from django.db.models.functions import Coalesce
from django.db.models.expressions import ExpressionWrapper

from .models import Category, Design, RateCard
from .serializers import CategorySerializer, DesignDetailSerializer, DesignListSerializer


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [AllowAny]
    serializer_class = CategorySerializer
    queryset = Category.objects.filter(is_active=True).order_by('name')

    def get_queryset(self):
        qs = super().get_queryset()
        
        # Filter by parent_slug to show only subcategories of a specific parent
        parent_slug = self.request.query_params.get('parent_slug')
        if parent_slug:
            try:
                parent = Category.objects.get(slug=parent_slug)
                qs = qs.filter(parent=parent)
            except Category.DoesNotExist:
                qs = qs.none()
        
        # Filter by parent ID
        parent_id = self.request.query_params.get('parent')
        if parent_id:
            qs = qs.filter(parent_id=parent_id)
        
        # If no parent filter, return only top-level categories
        if not parent_slug and not parent_id:
            qs = qs.filter(parent__isnull=True)
        
        return qs

class DesignPagination(LimitOffsetPagination):
    default_limit = 18


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    """Storefront catalog — serves DESIGNS (URL stays /api/products/)."""
    pagination_class = DesignPagination
    lookup_field = "slug"

    def get_serializer_class(self):
        if self.action == "retrieve":
            return DesignDetailSerializer
        return DesignListSerializer

    def get_queryset(self):
        qs = Design.objects.filter(is_active=True) \
            .select_related("category", "category__parent") \
            .prefetch_related("media", "products")
        p = self.request.query_params

        # Subcategory filter takes priority
        sub = p.get("sub")
        cat = p.get("category")
        if sub:
            qs = qs.filter(category__slug=sub)
        elif cat:
            # Include parent + all its subcategories
            qs = qs.filter(Q(category__slug=cat) | Q(category__parent__slug=cat))

        search = p.get("search")
        if search:
            qs = qs.filter(
                Q(name__icontains=search) |
                Q(design_code__icontains=search) |
                Q(description__icontains=search) |
                Q(category__name__icontains=search) |
                Q(category__slug__icontains=search)
            )

        purity = p.getlist("purity")
        color = p.getlist("color")
        if purity:
            qs = qs.filter(products__karat__in=purity)
        if color:
            qs = qs.filter(products__gold_color__in=color)
        if p.get("in_stock") in ("1", "true", "True"):
            qs = qs.filter(products__status="in_stock")
        if purity or color or p.get("in_stock"):
            qs = qs.distinct()

                # Effective "from" price: cheapest in-stock piece, else MTO estimate @ 14Kt.
        # Mirrors design_from_price() so filtering matches what the card displays.
        rc = RateCard.get()
        gold_rate = float(rc.gold_rate_14kt)
        dia_rate = float(rc.rate_for_grade(rc.default_grade))
        making_pct = float(rc.making_charges_percentage) / 100.0
        gst_pct = float(rc.gst_percentage) / 100.0

        diamond_w = ExpressionWrapper(
            F("diamond_weight_round_melle")
            + F("pointer_solitaire_weight")
            + F("fancy_cut_weight"),
            output_field=DecimalField()
        )
        pre_making = ExpressionWrapper(
            (F("base_net_weight_14kt") * gold_rate) + (diamond_w * dia_rate),
            output_field=DecimalField()
        )
        est_price = ExpressionWrapper(
            (pre_making + (pre_making * making_pct)) * (1 + gst_pct),
            output_field=DecimalField()
        )

        # Annotate with effective "from" price
        # Coalesce ensures every design gets a min_price value
        qs = qs.annotate(
            min_price=Coalesce(
                Min("products__price", filter=Q(products__status="in_stock")),
                est_price,
                output_field=DecimalField()
            )
        )

        # Price range filter - only apply if parameter exists AND is valid
        price_min = p.get("price_min")
        price_max = p.get("price_max")
        
        if price_min and price_min.replace('.', '', 1).isdigit():
            qs = qs.filter(min_price__gte=float(price_min))
        if price_max and price_max.replace('.', '', 1).isdigit():
            # Only filter if it's less than our "no limit" threshold
            if float(price_max) < 200000:
                qs = qs.filter(min_price__lte=float(price_max))

        sort = (p.get("sort", "newest") or "newest").replace("_", "-")
        if sort == "price-asc":
            qs = qs.order_by(F("min_price").asc(nulls_last=True), "-created_at")
        elif sort == "price-desc":
            qs = qs.order_by(F("min_price").desc(nulls_last=True), "-created_at")
        else:
            qs = qs.order_by("-created_at")
        return qs

    @action(detail=False, methods=['get'])
    def suggest(self, request):
        """Lightweight autocomplete suggestions for the header search bar."""
        q = (request.query_params.get('q') or '').strip()
        if len(q) < 2:
            return Response([])
        qs = Design.objects.filter(is_active=True).filter(
            Q(name__icontains=q) |
            Q(design_code__icontains=q) |
            Q(category__name__icontains=q)
        ).select_related('category')[:8]
        return Response([{
            'slug': d.slug,
            'name': d.name,
            'design_code': d.design_code,
            'category': d.category.name,
        } for d in qs])