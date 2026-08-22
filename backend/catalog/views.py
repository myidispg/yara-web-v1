from rest_framework import viewsets
from rest_framework.pagination import LimitOffsetPagination
from django.db.models import F, Min, Q

from .models import Category, Design
from .serializers import CategorySerializer, DesignDetailSerializer, DesignListSerializer


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer


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
            qs = qs.filter(Q(name__icontains=search) | Q(design_code__icontains=search))

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