from django.contrib import admin

from .models import Category, Product, ProductImage, ProductVariant, ProductVideo


class VariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 0


class ImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1


class VideoInline(admin.TabularInline):
    model = ProductVideo
    extra = 0


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "slug", "parent", "ordering", "is_active"]
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ["name", "sku", "category", "base_price", "stock_status", "is_featured"]
    list_filter = ["category", "stock_status", "is_featured"]
    search_fields = ["name", "sku"]
    prepopulated_fields = {"slug": ("name",)}
    inlines = [VariantInline, ImageInline, VideoInline]