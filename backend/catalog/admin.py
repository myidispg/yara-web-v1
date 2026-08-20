from django.contrib import admin
from .models import Category, Design, ProductMedia, Product, RateCard, GoldRateHistory, Notification


class ProductMediaInline(admin.TabularInline):
    model = ProductMedia
    extra = 0


class ProductInline(admin.TabularInline):
    model = Product
    extra = 0
    fields = ["item_code", "karat", "gold_color", "ring_size", "diamond_grade", "status", "price"]


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "slug", "is_active"]
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Design)
class DesignAdmin(admin.ModelAdmin):
    list_display = ["design_code", "name", "category", "base_net_weight_14kt", "is_active"]
    list_filter = ["category", "is_active"]
    search_fields = ["design_code", "name"]
    inlines = [ProductMediaInline, ProductInline]


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ["item_code", "design", "karat", "gold_color", "ring_size", "diamond_grade", "status", "price"]
    list_filter = ["status", "karat", "gold_color", "diamond_grade"]
    search_fields = ["item_code", "design__name", "design__design_code"]


@admin.register(RateCard)
class RateCardAdmin(admin.ModelAdmin):
    list_display = ["gold_rate_14kt", "gold_rate_18kt", "default_grade", 
                    "auto_fetch_enabled", "updated_at"]
    fieldsets = (
        (None, {
            'fields': ('gold_rate_14kt', 'gold_rate_18kt', 'diamond_rates', 'default_grade',
                      'making_charges_percentage', 'gst_percentage')
        }),
        ('Auto-Fetch Settings', {
            'fields': ('auto_fetch_enabled', 'increment_percentage', 
                      'change_threshold_type', 'change_threshold_percentage', 
                      'change_threshold_amount')
        }),
    )


@admin.register(GoldRateHistory)
class GoldRateHistoryAdmin(admin.ModelAdmin):
    list_display = ['fetched_at', 'raw_24kt_rate', 'calculated_rate', 
                   'previous_rate', 'rate_applied', 'fetch_successful']
    list_filter = ['rate_applied', 'fetch_successful', 'fetched_at']
    readonly_fields = ['fetched_at', 'raw_24kt_rate', 'calculated_rate', 
                      'previous_rate', 'rate_applied', 'fetch_successful', 'error_message']


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['created_at', 'message_type', 'message', 'read']
    list_filter = ['message_type', 'read', 'created_at']