from rest_framework import viewsets
from rest_framework.pagination import LimitOffsetPagination

from .models import Category, Product
from .serializers import CategorySerializer, ProductDetailSerializer, ProductListSerializer


class ProductPagination(LimitOffsetPagination):
    default_limit = 18
    max_limit = 100


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    lookup_field = "slug"


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    lookup_field = "slug"
    pagination_class = ProductPagination

    def get_queryset(self):
        params = self.request.query_params
        qs = (
            Product.objects.filter(is_active=True)
            .select_related("category")
            .prefetch_related("media", "instances")
        )
        category = params.get("category") or params.get("category_slug")
        if category:
            qs = qs.filter(category__slug=category)
        search = params.get("search")
        if search:
            qs = qs.filter(name__icontains=search)
        purity = params.getlist("purity")
        if purity:
            qs = qs.filter(instances__karat__in=purity).distinct()
        color = params.getlist("color")
        if color:
            qs = qs.filter(instances__gold_color__in=color).distinct()
        if params.get("in_stock") in ("1", "true", "True"):
            qs = qs.filter(instances__status="in_stock").distinct()

        sort = params.get("sort")
        if sort == "price-asc":
            qs = qs.order_by("base_price", "id")
        elif sort == "price-desc":
            qs = qs.order_by("-base_price", "id")
        else:
            qs = qs.order_by("-created_at", "id")
        return qs

    def get_serializer_class(self):
        return ProductListSerializer if self.action == "list" else ProductDetailSerializer