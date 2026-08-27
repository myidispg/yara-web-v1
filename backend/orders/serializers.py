import secrets

from django.db import transaction
from django.utils import timezone
from decimal import Decimal

from rest_framework import serializers

from accounts.models import User
from catalog.models import Design, Product, RateCard
from .models import Address, Order, OrderItem, Invoice


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = ["id", "label", "full_name", "phone", "line1", "line2",
                  "city", "state", "pincode", "is_default"]
        extra_kwargs = {
            'full_name': {'required': False, 'allow_blank': True},
            'phone': {'required': False, 'allow_blank': True},
        }

    def create(self, validated_data):
        user = self.context["request"].user
        # Auto-populate name and phone from user profile if not provided
        if not validated_data.get("full_name"):
            full_name = f"{user.first_name} {user.last_name}".strip()
            validated_data["full_name"] = full_name or user.email
        if not validated_data.get("phone"):
            validated_data["phone"] = user.phone or ""
        
        # If this is the user's first address, make it default
        if not Address.objects.filter(user=user).exists():
            validated_data["is_default"] = True
        elif validated_data.get("is_default"):
            # If user explicitly wants this as default, unset others
            Address.objects.filter(user=user, is_default=True).update(is_default=False)
        
        return Address.objects.create(user=user, **validated_data)

class OrderItemSerializer(serializers.ModelSerializer):
    design_slug = serializers.CharField(source='instance.design.slug', read_only=True)
    design_id = serializers.IntegerField(source='instance.design.id', read_only=True)

    class Meta:
        model = OrderItem
        fields = ["id", "product_name", "variant_label", "quantity", "unit_price", "line_total", "design_slug", "design_id", "instance"]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    address = AddressSerializer(read_only=True)
    mto_items = serializers.SerializerMethodField()
    timeline = serializers.SerializerMethodField()
    invoice_number = serializers.SerializerMethodField()
    subtotal_excl_tax = serializers.SerializerMethodField()
    gst_amount = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = ["id", "order_number", "status", "payment_method", "transaction_id",
                  "subtotal", "subtotal_excl_tax", "gst_amount", "shipping_fee", "total", 
                  "created_at", "address", "items", "mto_items", "timeline", 
                  "placed_at", "confirmed_at", "shipped_at", "delivered_at", "cancelled_at",
                  "invoice_number"]

    def get_mto_items(self, obj):
        mto = []
        for item in obj.items.all():
            if item.instance and item.instance.item_code.startswith("MTO-"):
                label = f"{item.product_name} · {item.variant_label}" if item.variant_label else item.product_name
                mto.append(label)
        return mto
    
    def get_timeline(self, obj):
        return obj.get_timeline()
    
    def get_invoice_number(self, obj):
        if hasattr(obj, 'invoice') and obj.invoice:
            return obj.invoice.invoice_number
        return None
    
    def get_subtotal_excl_tax(self, obj):
        """Calculate base amount (excluding 3% GST)."""
        from decimal import Decimal
        return round(obj.subtotal / Decimal('1.03'), 2)

    def get_gst_amount(self, obj):
        """Calculate GST amount (3% inclusive)."""
        from decimal import Decimal
        base = obj.subtotal / Decimal('1.03')
        return round(obj.subtotal - base, 2)


class _ItemInput(serializers.Serializer):
    design = serializers.PrimaryKeyRelatedField(queryset=Design.objects.all())
    karat = serializers.ChoiceField(choices=["14Kt", "18Kt"])
    gold_color = serializers.ChoiceField(choices=["Yellow", "Rose", "White"])
    ring_size = serializers.CharField(max_length=10, required=False, allow_null=True, allow_blank=True)
    quantity = serializers.IntegerField(min_value=1, default=1)


def mto_price(design, karat, ring_size, grade):
    rc = RateCard.get()
    net = float(design.calculate_net_weight(karat, ring_size))
    dia = float(design.total_diamond_weight)
    gold_value = net * float(rc.gold_rate_18kt if karat == "18Kt" else rc.gold_rate_14kt)
    dia_value = dia * float(rc.rate_for_grade(grade))
    making = (gold_value + dia_value) * (float(rc.making_charges_percentage) / 100)
    gst = (gold_value + dia_value + making) * (float(rc.gst_percentage) / 100)
    return round(gold_value + dia_value + making + gst)

class InvoiceSerializer(serializers.ModelSerializer):
    pdf_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Invoice
        fields = ['id', 'invoice_number', 'generated_at', 'subtotal', 'gst_amount', 
                  'gst_percentage', 'total', 'customer_name', 'customer_email', 
                  'customer_phone', 'billing_address', 'pdf_url']
    
    def get_pdf_url(self, obj):
        if obj.pdf_file:
            return obj.pdf_file.url
        return None

class OrderCreateSerializer(serializers.Serializer):
    address = serializers.PrimaryKeyRelatedField(queryset=Address.objects.all())
    payment_method = serializers.ChoiceField(
        choices=["upi", "card", "netbanking", "emi", "cod"])
    items = _ItemInput(many=True)

    def validate_items(self, items):
        if not items:
            raise serializers.ValidationError("Your bag is empty.")
        for item in items:
            item["ring_size"] = (item.get("ring_size") or "").strip() or None
        return items

    def create(self, validated_data):
        user = self.context["request"].user
        rc = RateCard.get()
        grade = rc.default_grade

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

                qs = Product.objects.select_for_update().filter(
                    design=design, karat=karat, gold_color=gold_color,
                    ring_size=ring_size, status="in_stock")
                allocated = list(qs[:quantity])
                to_fabricate = quantity - len(allocated)

                for instance in allocated:
                    instance.status = "sold"
                    instance.sold_to_user = user
                    instance.sold_in_order = order
                    instance.sold_at = timezone.now()
                    instance.save()

                    unit_price = instance.price or instance.calculated_price
                    subtotal += unit_price
                    # product.price is GST-inclusive, store it as-is
                    # Tax breakdown happens at invoice level
                    OrderItem.objects.create(
                        order=order, instance=instance, product_name=design.name,
                        variant_label=f"{karat} {gold_color} Gold" + (f" | Size {ring_size}" if ring_size else ""),
                        quantity=1, unit_price=unit_price, line_total=unit_price, is_mto_pending=False)

                for _ in range(to_fabricate):
                    net_weight = design.calculate_net_weight(karat, ring_size)
                    mto_code = (f"MTO-{design.design_code}-{karat[:2]}{gold_color[0]}-"
                                f"{ring_size or 'OS'}-{secrets.token_hex(2).upper()}")
                    new_instance = Product.objects.create(
                        item_code=mto_code, design=design, karat=karat,
                        gold_color=gold_color, ring_size=ring_size,
                        diamond_grade=grade,
                        actual_net_weight=net_weight,
                        actual_diamond_weight=design.total_diamond_weight,
                        actual_color_stone_weight=design.color_stone_weight,
                        status="sold", sold_to_user=user, sold_in_order=order,
                        sold_at=timezone.now(),
                    )
                    unit_price = Decimal(str(mto_price(design, karat, ring_size, grade)))
                    new_instance.price = unit_price
                    new_instance.save(update_fields=["price"])
                    subtotal += unit_price
                    # product.price is GST-inclusive, store it as-is
                    # Tax breakdown happens at invoice level
                    OrderItem.objects.create(
                        order=order, instance=new_instance, product_name=design.name,
                        variant_label=(f"{karat} {gold_color} Gold" + (f" | Size {ring_size}" if ring_size else "") + " (Made to Order)"),
                        quantity=1, unit_price=unit_price, line_total=unit_price, is_mto_pending = True)

            order.subtotal = subtotal
            order.shipping_fee = Decimal("0.00")
            order.total = subtotal
            order.save()
        return order