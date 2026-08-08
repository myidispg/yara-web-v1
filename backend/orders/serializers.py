from decimal import Decimal

from django.db import transaction
from rest_framework import serializers

from catalog.models import ProductVariant

from .models import Address, Order, OrderItem


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = ["id", "label", "full_name", "phone", "line1", "line2",
                  "city", "state", "pincode", "is_default"]


class OrderItemSerializer(serializers.ModelSerializer):
    product_slug = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = ["product_name", "product_slug", "variant_label",
                  "quantity", "unit_price", "line_total"]

    def get_product_slug(self, obj):
        return obj.product.slug if obj.product else None


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    address = AddressSerializer(read_only=True)
    status_label = serializers.CharField(source="get_status_display", read_only=True)
    payment_label = serializers.CharField(source="get_payment_method_display", read_only=True)

    class Meta:
        model = Order
        fields = ["order_number", "status", "status_label", "payment_method", "payment_label",
                  "subtotal", "shipping_fee", "total", "created_at", "address", "items"]


class _ItemInput(serializers.Serializer):
    variant = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1, max_value=10)


class OrderCreateSerializer(serializers.Serializer):
    address = serializers.IntegerField()
    payment_method = serializers.ChoiceField(choices=Order.PAYMENT)
    items = _ItemInput(many=True, allow_empty=False)

    def validate_address(self, pk):
        try:
            return Address.objects.get(pk=pk, user=self.context["request"].user)
        except Address.DoesNotExist:
            raise serializers.ValidationError("Address not found.")

    def validate_items(self, items):
        resolved = []
        for item in items:
            try:
                variant = ProductVariant.objects.select_related("product").get(pk=item["variant"])
            except ProductVariant.DoesNotExist:
                raise serializers.ValidationError("A selected item is no longer available.")
            if variant.stock_quantity < item["quantity"]:
                raise serializers.ValidationError(f"Insufficient stock for {variant.product.name}.")
            resolved.append({"variant": variant, "quantity": item["quantity"]})
        return resolved

    def create(self, validated_data):
        user = self.context["request"].user
        with transaction.atomic():
            order = Order.objects.create(
                user=user,
                address=validated_data["address"],
                payment_method=validated_data["payment_method"],
            )
            subtotal = Decimal("0")
            for item in validated_data["items"]:
                variant = ProductVariant.objects.select_for_update().get(pk=item["variant"].pk)
                variant.stock_quantity = max(0, variant.stock_quantity - item["quantity"])
                variant.save(update_fields=["stock_quantity"])
                line_total = variant.price * item["quantity"]
                subtotal += line_total
                OrderItem.objects.create(
                    order=order, product=variant.product, variant=variant,
                    product_name=variant.product.name, variant_label=variant.label,
                    quantity=item["quantity"], unit_price=variant.price, line_total=line_total,
                )
            order.subtotal = subtotal
            order.shipping_fee = Decimal("0.00")   # free insured shipping starter policy
            order.total = subtotal
            order.save()
        return order