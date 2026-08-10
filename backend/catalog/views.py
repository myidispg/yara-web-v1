"""
YA-RA® — Catalog views.
Aligned with the new models & serializers.
Endpoints (via router):  /api/categories/  ·  /api/products/  ·  /api/products/<slug>/
Supports the storefront query params:
    ?category=<slug>      (also ?category_slug=)
    ?purity=18Kt
    ?price_min= / ?price_max=
    ?search=
"""
from django.db.models import Min
from rest_framework import viewsets

from .models import Category, Product
from .serializers import (
    CategorySerializer,
    ProductDetailSerializer,
    ProductListSerializer,
)


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """GET /api/categories/ — active categories in sort order."""
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    lookup_field = "slug"


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    """
    GET /api/products/            — list (cards: variants included, no gallery)
    GET /api/products/<slug>/     — detail (full gallery + all variants)
    """
    lookup_field = "slug"

    def get_queryset(self):
        qs = (
            Product.objects.filter(is_active=True)
            .select_related("category")
            .prefetch_related("images", "variants")
        )

        params = self.request.query_params
        category = params.get("category") or params.get("category_slug")
        if category:
            qs = qs.filter(category__slug=category)

        purity = params.get("purity")
        if purity:
            qs = qs.filter(variants__purity=purity)

        price_min = params.get("price_min")
        price_max = params.get("price_max")
        if price_min or price_max:
            qs = qs.annotate(min_price=Min("variants__price"))
            if price_min:
                qs = qs.filter(min_price__gte=price_min)
            if price_max:
                qs = qs.filter(min_price__lte=price_max)

        search = params.get("search")
        if search:
            qs = qs.filter(name__icontains=search)

        return qs.distinct()

    def get_serializer_class(self):
        return (
            ProductListSerializer if self.action == "list" else ProductDetailSerializer
        )