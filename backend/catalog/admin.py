"""
YA-RA® — Catalog admin.
Aligned with the new models: Category / Product / ProductImage /
ProductVariant / ProductVideo. Variants own price, SKU & stock;
Product owns 4Cs, badge & compare-at price.
"""
from django.contrib import admin

from .models import (
    Category,
    Product,
    ProductImage,
    ProductVariant,
    ProductVideo,
)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "slug", "sort_order", "is_active"]
    list_editable = ["sort_order", "is_active"]
    search_fields = ["name"]
    prepopulated_fields = {"slug": ("name",)}
    ordering = ["sort_order", "name"]


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    fields = ["url", "alt_text", "sort_order"]
    ordering = ["sort_order"]


class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 1
    fields = [
        "purity", "gold_color", "ring_size", "price", "gold_weight_grams",
        "gold_value", "diamond_value", "making_charges", "gst_amount",
        "stock", "is_active",
    ]


class ProductVideoInline(admin.TabularInline):
    model = ProductVideo
    extra = 0
    fields = ["url", "title", "sort_order"]


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = [
        "name", "category", "carat", "diamond_quality",
        "certification", "badge", "min_price_display", "is_active",
    ]
    list_filter = ["category", "diamond_quality", "certification", "is_active"]
    search_fields = ["name", "slug"]
    prepopulated_fields = {"slug": ("name",)}
    inlines = [ProductImageInline, ProductVariantInline, ProductVideoInline]
    fieldsets = (
        (None, {"fields": ("name", "slug", "category", "description")}),
        ("Diamond Specifications", {
            "fields": ("carat", "diamond_quality", "certification"),
        }),
        ("Merchandising", {
            "fields": ("compare_at_price", "badge", "is_active"),
        }),
    )

    @admin.display(description="From (INR)")
    def min_price_display(self, obj):
        return obj.min_price