import secrets
from decimal import Decimal

from django.db import transaction
from django.utils import timezone
from rest_framework import serializers

from catalog.models import Product, ProductInstance, RateCard

from .models import Address, Order, OrderItem


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = ["id", "label", "full_name", "phone", "line1", "line2",
                  "city", "state", "pincode", "is_default"]


class OrderItemSerializer(serializers.ModelSerializer):
    item_code = serializers.CharField(source="instance.item_code", read_only=True)
    is_mto = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = ["product_name", "item_code", "variant_label", "is_mto",
                  "quantity", "unit_price", "line_total"]

    def get_is_mto(self, obj):
        return obj.instance.item_code.startswith("MTO-") if obj.instance else False


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
    design = serializers.IntegerField()
    karat = serializers.ChoiceField(choices=[("14Kt", "14Kt"), ("18Kt", "18Kt")])
    gold_color = serializers.ChoiceField(choices=[("Yellow", "Yellow"), ("Rose", "Rose"), ("White", "White")])
    ring_size = serializers.CharField(required=False, allow_blank=True, allow_null=True)
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
                design = Product.objects.get(pk=item["design"])
            except Product.DoesNotExist:
                raise serializers.ValidationError("A selected design is no longer available.")
            
            karat = item["karat"]
            gold_color = item["gold_color"]
            ring_size = item.get("ring_size") or None
            quantity = item["quantity"]

            resolved.append({
                "design": design,
                "karat": karat,
                "gold_color": gold_color,
                "ring_size": ring_size,
                "quantity": quantity,
            })
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
                design = item["design"]
                karat = item["karat"]
                gold_color = item["gold_color"]
                ring_size = item["ring_size"]
                quantity = item["quantity"]

                # 1. Try to allocate existing in-stock instances
                qs = ProductInstance.objects.select_for_update().filter(
                    design=design, karat=karat, gold_color=gold_color,
                    ring_size=ring_size, status='in_stock'
                )
                allocated = list(qs[:quantity])
                to_fabricate = quantity - len(allocated)

                # Process allocated instances
                for instance in allocated:
                    instance.status = 'sold'
                    instance.sold_to_user = user
                    instance.sold_in_order = order
                    instance.sold_at = timezone.now()
                    instance.save()

                    unit_price = instance.price or instance.calculated_price
                    subtotal += unit_price
                    OrderItem.objects.create(
                        order=order,
                        instance=instance,
                        product_name=design.name,
                        variant_label=f"{karat} {gold_color} Gold" + (f" | Size {ring_size}" if ring_size else ""),
                        quantity=1,
                        unit_price=unit_price,
                        line_total=unit_price,
                    )

                # 2. Fabricate MTO (Made-to-Order) instances for the rest
                for _ in range(to_fabricate):
                    net_weight = design.calculate_net_weight(karat, ring_size)
                    dia_weight = design.total_diamond_weight
                    mto_code = f"MTO-{design.design_code}-{karat[:2]}{gold_color[0]}-{ring_size or 'OS'}-{secrets.token_hex(2).upper()}"
                    
                    new_instance = ProductInstance.objects.create(
                        item_code=mto_code,
                        design=design,
                        karat=karat,
                        gold_color=gold_color,
                        ring_size=ring_size,
                        actual_net_weight=net_weight,
                        actual_diamond_weight=dia_weight,
                        actual_color_stone_weight=design.color_stone_weight,
                        status='sold',
                        sold_to_user=user,
                        sold_in_order=order,
                        sold_at=timezone.now(),
                    )
                    unit_price = new_instance.calculated_price
                    new_instance.price = unit_price
                    new_instance.save(update_fields=["price"])
                    subtotal += unit_price
                    OrderItem.objects.create(
                        order=order,
                        instance=new_instance,
                        product_name=design.name,
                        variant_label=f"{karat} {gold_color} Gold" + (f" | Size {ring_size}" if ring_size else "") + " (Made to Order)",
                        quantity=1,
                        unit_price=unit_price,
                        line_total=unit_price,
                    )

            order.subtotal = subtotal
            order.shipping_fee = Decimal("0.00")
            order.total = subtotal
            order.save()
        return order

    def to_representation(self, instance):
        return OrderSerializer(instance, context=self.context).data