from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.pagination import LimitOffsetPagination
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.db.models import F, Min, Q

from .models import Category, Design
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

        qs = qs.annotate(
            min_price=Min("products__price", filter=Q(products__status="in_stock")))
        sort = p.get("sort", "newest")
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