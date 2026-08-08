from django.db.models import Prefetch, Q
from rest_framework.viewsets import ReadOnlyModelViewSet

from .models import Category, Product, ProductImage, ProductVariant
from .serializers import CategorySerializer, ProductDetailSerializer, ProductListSerializer


class CategoryViewSet(ReadOnlyModelViewSet):
    serializer_class = CategorySerializer
    lookup_field = "slug"

    def get_queryset(self):
        return (Category.objects.filter(parent__isnull=True, is_active=True)
                .prefetch_related(Prefetch("subcategories",
                                           queryset=Category.objects.filter(is_active=True))))


class ProductViewSet(ReadOnlyModelViewSet):
    lookup_field = "slug"

    def get_serializer_class(self):
        return ProductDetailSerializer if self.action == "retrieve" else ProductListSerializer

    def get_queryset(self):
        p = self.request.query_params
        qs = (Product.objects.filter(is_active=True)
              .select_related("category", "category__parent")
              .prefetch_related("variants", "images"))

        cat_slug = p.get("category")
        if cat_slug:
            try:
                cat = Category.objects.get(slug=cat_slug)
            except Category.DoesNotExist:
                return qs.none()
            pks = [cat.pk] + list(cat.subcategories.values_list("pk", flat=True))
            qs = qs.filter(category__in=pks)

        if p.get("subcategory"):
            qs = qs.filter(category__slug=p["subcategory"])
        if p.get("color"):
            qs = qs.filter(variants__gold_color=p["color"]).distinct()
        if p.get("purity"):
            qs = qs.filter(variants__purity=p["purity"]).distinct()
        if p.get("featured") in ("1", "true"):
            qs = qs.filter(is_featured=True)
        if p.get("in_stock") in ("1", "true"):
            qs = qs.exclude(stock_status="out_of_stock")
        if p.get("q"):
            qs = qs.filter(Q(name__icontains=p["q"]) | Q(description__icontains=p["q"]))
        try:
            if p.get("min_price"):
                qs = qs.filter(base_price__gte=p["min_price"])
            if p.get("max_price"):
                qs = qs.filter(base_price__lte=p["max_price"])
        except ValueError:
            pass

        sort = p.get("sort", "featured")
        return qs.order_by(**{
            "price_asc": "base_price",
            "price_desc": "-base_price",
            "new": "-created_at",
        }.get(sort, "-is_featured"))