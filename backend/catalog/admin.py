from django.contrib import admin

from .models import Category, Product, ProductMedia, ProductInstance


class ProductMediaInline(admin.TabularInline):
    model = ProductMedia
    extra = 1
    ordering = ["sort_order"]


class ProductInstanceInline(admin.TabularInline):
    model = ProductInstance
    extra = 0
    fields = ["item_code", "karat", "gold_color", "ring_size",
              "actual_net_weight", "actual_diamond_weight", "status"]


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "slug", "is_active"]
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ["design_code", "name", "category",
                    "base_net_weight_14kt", "total_diamond_weight", "is_active"]
    search_fields = ["design_code", "name"]
    list_filter = ["category", "is_active"]
    inlines = [ProductMediaInline, ProductInstanceInline]


@admin.register(ProductInstance)
class ProductInstanceAdmin(admin.ModelAdmin):
    list_display = ["item_code", "design", "karat", "gold_color",
                    "ring_size", "status", "sold_at"]
    list_filter = ["status", "karat", "gold_color"]
    search_fields = ["item_code", "design__name", "report_number"]