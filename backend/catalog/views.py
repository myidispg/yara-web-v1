"""
YA-RA® — Catalog views with server-side pagination & filtering.
Endpoints:  /api/categories/  ·  /api/products/  ·  /api/products/<slug>/

Product list supports:
    ?limit=&offset=            pagination (default limit 18, max 100)
    ?category=<slug>           category filter
    ?search=<text>             name search
    ?purity=<label>&purity=…   repeated, e.g. "18Kt Yellow Gold"
    ?price=<label>&price=…     repeated bucket labels (₹ commas are safe)
    ?carat=<label>&carat=…     repeated bucket labels
    ?quality=EF-VVS&quality=…  repeated quality codes
    ?sort=best|price-asc|price-desc|newest|carat-desc
Response shape: { count, next, previous, results }
"""
from django.db.models import Case, IntegerField, Min, Q, Value, When
from rest_framework import viewsets
from rest_framework.pagination import LimitOffsetPagination

from .models import Category, Product
from .serializers import (
    CategorySerializer,
    ProductDetailSerializer,
    ProductListSerializer,
)


class ProductPagination(LimitOffsetPagination):
    default_limit = 18
    max_limit = 100


PRICE_RANGES = {
    "Under ₹25,000": (None, 25000),
    "₹25,000 - ₹50,000": (25000, 50000),
    "₹50,000 - ₹1,00,000": (50000, 100000),
    "Above ₹1,00,000": (100000, None),
}
CARAT_RANGES = {
    "0.10 - 0.30 Ct": (0.1, 0.3),
    "0.30 - 0.50 Ct": (0.3, 0.5),
    "0.50 - 1.00 Ct": (0.5, 1.0),
    "1.00+ Ct": (1.0, None),
}


def _list_param(params, key):
    """Collect repeated query params into a list (axios sends arrays as repeated keys)."""
    return [v for v in params.getlist(key) if v]


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
            .prefetch_related("images", "variants")
            .annotate(min_price=Min("variants__price"))
            .annotate(
                has_badge=Case(
                    When(badge="", then=Value(0)),
                    default=Value(1),
                    output_field=IntegerField(),
                )
            )
        )

        category = params.get("category") or params.get("category_slug")
        if category:
            qs = qs.filter(category__slug=category)

        search = params.get("search")
        if search:
            qs = qs.filter(name__icontains=search)

        # ── Gold purity & tone (e.g. "18Kt Yellow Gold") ──
        purity_values = _list_param(params, "purity")
        if purity_values:
            q = Q()
            for label in purity_values:
                parts = label.split()
                if len(parts) >= 2:
                    q |= Q(variants__purity=parts[0], variants__gold_color=parts[1])
            qs = qs.filter(q)

        # ── Price buckets (on cheapest variant) ──
        price_values = _list_param(params, "price")
        if price_values:
            q = Q()
            for label in price_values:
                lo, hi = PRICE_RANGES.get(label, (None, None))
                if lo is not None and hi is not None:
                    q |= Q(min_price__gte=lo, min_price__lt=hi)
                elif hi is not None:
                    q |= Q(min_price__lt=hi)
                elif lo is not None:
                    q |= Q(min_price__gte=lo)
            qs = qs.filter(q)

        # ── Carat buckets ──
        carat_values = _list_param(params, "carat")
        if carat_values:
            q = Q()
            for label in carat_values:
                lo, hi = CARAT_RANGES.get(label, (None, None))
                if lo is not None and hi is not None:
                    q |= Q(carat__gte=lo, carat__lt=hi)
                elif hi is not None:
                    q |= Q(carat__lt=hi)
                elif lo is not None:
                    q |= Q(carat__gte=lo)
            qs = qs.filter(q)

        # ── Diamond quality codes (EF-VVS / GH-VS) ──
        quality_values = _list_param(params, "quality")
        if quality_values:
            qs = qs.filter(diamond_quality__in=quality_values)

        # ── Sorting ──
        sort = params.get("sort")
        if sort == "price-asc":
            qs = qs.order_by("min_price", "id")
        elif sort == "price-desc":
            qs = qs.order_by("-min_price", "id")
        elif sort == "carat-desc":
            qs = qs.order_by("-carat", "id")
        elif sort == "newest":
            qs = qs.order_by("-created_at", "id")
        elif sort == "best":
            qs = qs.order_by("-has_badge", "-created_at", "id")
        else:
            # No sort param (home page, search tray): newest first
            qs = qs.order_by("-created_at", "id")

        return qs.distinct()

    def get_serializer_class(self):
        return (
            ProductListSerializer if self.action == "list" else ProductDetailSerializer
        )