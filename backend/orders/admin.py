from django.contrib import admin

from .models import Address, Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ["full_name", "city", "state", "pincode", "label", "user"]
    search_fields = ["full_name", "phone"]


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ["order_number", "user", "status", "payment_method", "total", "created_at"]
    list_filter = ["status", "payment_method"]
    search_fields = ["order_number", "user__email"]
    inlines = [OrderItemInline]