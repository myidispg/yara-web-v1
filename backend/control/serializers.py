import secrets

from rest_framework import serializers

from accounts.models import User
from catalog.models import Category, Design, ProductMedia, Product, RateCard, RING_SIZES, GoldRateHistory, Notification
from orders.models import Order, OrderItem
from catalog.serializers import ProductMediaSerializer

from .models import AuditLog


# ── Staff read serializers ────────────────────────────────────────────

class StaffUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'phone', 'is_staff', 'date_joined']


class StaffProductSerializer(serializers.ModelSerializer):
    """The physical piece."""
    sold_in_order_number = serializers.SerializerMethodField()
    sold_in_order_id = serializers.SerializerMethodField()
    sold_to_email = serializers.SerializerMethodField()
    design_id = serializers.IntegerField(source='design.id', read_only=True)
    design_code = serializers.CharField(source='design.design_code', read_only=True)
    design_name = serializers.CharField(source='design.name', read_only=True)
    category_name = serializers.CharField(source='design.category.name', read_only=True)
    gold_value = serializers.SerializerMethodField()
    diamond_value = serializers.SerializerMethodField()
    making_charges = serializers.SerializerMethodField()
    gst_amount = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ['id', 'item_code', 'karat', 'gold_color', 'ring_size', 'diamond_grade',
                  'status', 'price', 'actual_net_weight', 'actual_diamond_weight',
                  'actual_color_stone_weight', 'report_lab', 'report_number', 'hallmark_number',
                  'sold_at', 'sold_in_order_number', 'sold_in_order_id', 'sold_to_email',
                  'created_at', 'design_id', 'design_code', 'design_name', 'category_name',
                  'gold_value', 'diamond_value', 'making_charges', 'gst_amount']
        
        read_only_fields = ['item_code', 'status', 'actual_net_weight',
                            'actual_diamond_weight', 'actual_color_stone_weight']
        
    def get_sold_in_order_number(self, obj):
        return obj.sold_in_order.order_number if obj.sold_in_order else None

    def get_sold_in_order_id(self, obj):
        return obj.sold_in_order.id if obj.sold_in_order else None

    def get_sold_to_email(self, obj):
        return obj.sold_to_user.email if obj.sold_to_user else None

    def get_gold_value(self, obj):
        return float(obj.gold_value)

    def get_diamond_value(self, obj):
        return float(obj.diamond_value)

    def get_making_charges(self, obj):
        return float(obj.making_charges)

    def get_gst_amount(self, obj):
        return float(obj.gst_amount)


class StaffDesignSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name')
    category_slug = serializers.CharField(source='category.slug', read_only=True)
    is_ring = serializers.BooleanField(source='category.is_ring_family', read_only=True)
    products = StaffProductSerializer(many=True, read_only=True)
    media = ProductMediaSerializer(many=True, read_only=True)
    instance_count = serializers.SerializerMethodField()
    in_stock_count = serializers.SerializerMethodField()
    base_price = serializers.SerializerMethodField()

    class Meta:
        model = Design
        fields = ['id', 'design_code', 'slug', 'name', 'description', 'category',
                  'category_name', 'category_slug', 'is_ring', 'is_active',
                  'base_net_weight_14kt', 'size_weight_refs', 'size_weight_counts',
                  'total_diamond_weight', 'diamond_weight_round_melle',
                  'pointer_solitaire_weight', 'fancy_cut_weight', 'color_stone_weight',
                  'products', 'instance_count', 'in_stock_count', 'base_price',
                  'created_at', 'media']

    def get_base_price(self, obj):
        inst = obj.products.filter(status='in_stock').order_by('price').first()
        if inst:
            return float(inst.price)
        rc = RateCard.get()
        net = float(obj.base_net_weight_14kt)
        dia = float(obj.total_diamond_weight)
        gv = net * float(rc.gold_rate_14kt)
        dv = dia * float(rc.rate_for_grade(rc.default_grade))
        making = (gv + dv) * (float(rc.making_charges_percentage) / 100)
        gst = (gv + dv + making) * (float(rc.gst_percentage) / 100)
        return round(gv + dv + making + gst)

    def get_instance_count(self, obj):
        return obj.products.count()

    def get_in_stock_count(self, obj):
        return obj.products.filter(status='in_stock').count()

class DesignUpdateSerializer(serializers.ModelSerializer):
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all())

    class Meta:
        model = Design
        fields = ['name', 'design_code', 'description', 'category', 'is_active',
                  'diamond_weight_round_melle', 'pointer_solitaire_weight',
                  'fancy_cut_weight', 'color_stone_weight']


class StaffCategorySerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()
    parent_name = serializers.CharField(source='parent.name', read_only=True, default='')
    subcategories = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'is_active', 'parent', 'parent_name', 'product_count', 'subcategories']

    def get_product_count(self, obj):
        return obj.designs.count()

    def get_subcategories(self, obj):
        children = obj.subcategories.all().order_by('name')
        return StaffCategorySerializer(children, many=True).data


class RateCardSerializer(serializers.ModelSerializer):
    class Meta:
        model = RateCard
        fields = ['id', 'gold_rate_14kt', 'gold_rate_18kt', 'diamond_rates', 'default_grade',
                  'making_charges_percentage', 'gst_percentage', 'updated_at',
                  'auto_fetch_enabled', 'increment_percentage', 'change_threshold_type',
                  'change_threshold_percentage', 'change_threshold_amount', 'last_auto_run_at', 
                  'auto_fetch_interval_minutes']


class GoldRateHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = GoldRateHistory
        fields = ['id', 'fetched_at', 'raw_24kt_rate', 'calculated_rate', 'previous_rate',
                  'rate_applied', 'fetch_successful', 'error_message']


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'message', 'message_type', 'created_at', 'read', 'link']

class StaffOrderItemSerializer(serializers.ModelSerializer):
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = ['id', 'product_name', 'variant_label', 'quantity', 'unit_price', 'total_price', 'instance']

    def get_total_price(self, obj):
        return float(obj.line_total) if obj.line_total else float(obj.unit_price) * int(obj.quantity)


class StaffOrderSerializer(serializers.ModelSerializer):
    items = StaffOrderItemSerializer(many=True, read_only=True)
    customer_email = serializers.CharField(source="user.email")
    customer_id = serializers.IntegerField(source="user.id", read_only=True)
    customer_name = serializers.SerializerMethodField()
    customer_phone = serializers.SerializerMethodField()
    address = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = ['id', 'order_number', 'customer_email', 'customer_name', 'customer_phone',
                  'customer_id', 'status', 'payment_method', 'subtotal', 'shipping_fee', 
                  'total', 'created_at', 'items', 'address']

    def get_customer_name(self, obj):
        full = f"{obj.user.first_name} {obj.user.last_name}".strip()
        if full:
            return full
        if obj.address and getattr(obj.address, "full_name", ""):
            return obj.address.full_name
        return obj.user.email

    def get_customer_phone(self, obj):
        return getattr(obj.user, "phone", "") or "—"

    def get_address(self, obj):
        a = obj.address
        if not a:
            return None
        return {"full_name": a.full_name, "phone": a.phone, "line1": a.line1,
                "line2": a.line2 or "", "city": a.city, "state": a.state, "pincode": a.pincode}


# ── Creation (wizard / add product) ───────────────────────────────────

def price_for(net_g, dia_ct, karat, grade, rc):
    gold_rate = float(rc.gold_rate_18kt if karat == '18Kt' else rc.gold_rate_14kt)
    gv = net_g * gold_rate
    dv = dia_ct * float(rc.rate_for_grade(grade))
    making = (gv + dv) * (float(rc.making_charges_percentage) / 100)
    gst = (gv + dv + making) * (float(rc.gst_percentage) / 100)
    return round(gv + dv + making + gst)


def create_product_for_design(design, inst, rc):
    """Create one physical product; folds its measured weight into the design refs."""
    karat = inst['karat']
    size = (inst.get('ring_size') or '').strip() or None
    net = float(inst.get('actual_net_weight') or design.calculate_net_weight(karat, size))
    dia = float(inst.get('actual_diamond_weight') or design.total_diamond_weight)
    grade = (inst.get('diamond_grade') or '').strip() or rc.default_grade
    if grade not in rc.grade_choices():
        grade = rc.default_grade

    # Use user-provided item_code or auto-generate
    user_item_code = (inst.get('item_code') or '').strip()
    if user_item_code:
        item_code = user_item_code
    else:
        item_code = (f"{design.design_code}-{karat[:2]}{inst['gold_color'][0]}-"
                     f"{size or 'OS'}-{secrets.token_hex(2).upper()}")
        
    product = Product.objects.create(
        design=design, item_code=item_code, karat=karat, gold_color=inst['gold_color'],
        ring_size=size, diamond_grade=grade, status='in_stock',
        price=price_for(net, dia, karat, grade, rc),
        actual_net_weight=net, actual_diamond_weight=dia,
        actual_color_stone_weight=float(inst.get('actual_color_stone_weight') or 0),
        report_lab=inst.get('report_lab', ''), 
        report_number=inst.get('report_number', ''),
        hallmark_number=inst.get('hallmark_number', '')
        )

    net_14kt = net / 1.2 if karat == "18Kt" else net
    if design.is_ring and size:
        design.record_actual_weight(size, net_14kt)
    elif not design.is_ring:
        design.record_actual_weight_base(net_14kt)
    return product


class MediaInputSerializer(serializers.Serializer):
    url = serializers.URLField()
    kind = serializers.ChoiceField(choices=['image', 'video'], default='image')


class ProductInputSerializer(serializers.Serializer):
    item_code = serializers.CharField(max_length=100, required=False, allow_blank=True)
    karat = serializers.ChoiceField(choices=['14Kt', '18Kt'])
    gold_color = serializers.ChoiceField(choices=['Yellow', 'Rose', 'White'])
    ring_size = serializers.CharField(max_length=10, required=False, allow_null=True, allow_blank=True)
    diamond_grade = serializers.CharField(max_length=20, required=False, allow_blank=True)
    actual_net_weight = serializers.DecimalField(max_digits=6, decimal_places=3, required=False, allow_null=True)
    actual_diamond_weight = serializers.DecimalField(max_digits=5, decimal_places=2, required=False, allow_null=True)
    actual_color_stone_weight = serializers.DecimalField(max_digits=5, decimal_places=2, required=False, allow_null=True)
    report_lab = serializers.CharField(max_length=50, required=False, allow_blank=True, default="")
    report_number = serializers.CharField(max_length=100, required=False, allow_blank=True, default="")
    hallmark_number = serializers.CharField(max_length=100, required=False, allow_blank=True, default="")

    def validate_item_code(self, value):
        if value and Product.objects.filter(item_code=value).exists():
            raise serializers.ValidationError("This product code already exists in the database.")
        return value

    def validate_ring_size(self, value):
        if value in (None, ""):
            return value
        if str(value) not in RING_SIZES:
            raise serializers.ValidationError(f"Ring size must be one of: {', '.join(RING_SIZES)}.")
        return value

    def validate_hallmark_number(self, value):
        if value and Product.objects.filter(hallmark_number=value).exists():
            raise serializers.ValidationError("This hallmark number already exists on another product.")
        return value

    def validate(self, data):
        lab = (data.get('report_lab') or '').strip()
        num = (data.get('report_number') or '').strip()
        if num and Product.objects.filter(report_lab=lab, report_number=num).exists():
            raise serializers.ValidationError(
                {"report_number": f"A product with cert {lab} #{num} already exists."})
        return data

DESIGN_PREFIXES = {
    'rings': 'RG', 'earrings': 'ER', 'necklaces': 'NK',
    'bracelets': 'BR', 'solitaires': 'SO', 'color-stone': 'CS',
}


class DesignCreateSerializer(serializers.ModelSerializer):
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all())
    media = MediaInputSerializer(many=True, required=False, default=list)
    products = ProductInputSerializer(many=True, required=False, default=list)
    reference_weight = serializers.DecimalField(max_digits=6, decimal_places=3, required=False, allow_null=True)
    reference_size = serializers.IntegerField(required=False, default=12)

    class Meta:
        model = Design
        fields = ['id', 'name', 'design_code', 'category', 'description',
                  'base_net_weight_14kt', 'reference_weight', 'reference_size',
                  'diamond_weight_round_melle', 'pointer_solitaire_weight',
                  'fancy_cut_weight', 'color_stone_weight', 'media', 'products']

    def create(self, validated_data):
        from django.db import transaction
        
        # Pop nested fields BEFORE creating the Design
        media_list = validated_data.pop('media', [])
        products_list = validated_data.pop('products', [])
        ref_w = validated_data.pop('reference_weight', None)
        ref_s = validated_data.pop('reference_size', 12) or 12
        category = validated_data['category']

        with transaction.atomic():
            # Auto-set material flags from weights
            validated_data['has_solitaire_pointer'] = float(validated_data.get('pointer_solitaire_weight') or 0) > 0
            validated_data['has_fancy_cut'] = float(validated_data.get('fancy_cut_weight') or 0) > 0
            validated_data['has_color_stone'] = float(validated_data.get('color_stone_weight') or 0) > 0

            # Create the design
            design = Design.objects.create(**validated_data)

            # Initialize weight references (per-size for rings, single base for others)
            if design.is_ring:
                design.init_size_refs(float(ref_w or design.base_net_weight_14kt), at_size=ref_s)
            else:
                design.init_base_ref(float(ref_w or design.base_net_weight_14kt))
            design.save()

            # Create media
            rc = RateCard.get()
            for order, m in enumerate(media_list, start=1):
                ProductMedia.objects.create(
                    design=design, 
                    url=m['url'], 
                    kind=m['kind'], 
                    sort_order=order
                )

            # Create physical products
            for inst in products_list:
                create_product_for_design(design, inst, rc)

        return design

class AuditLogSerializer(serializers.ModelSerializer):
    user_email = serializers.SerializerMethodField()
    user_name = serializers.SerializerMethodField()
    description = serializers.SerializerMethodField()

    class Meta:
        model = AuditLog
        fields = ['id', 'user', 'user_email', 'user_name', 'action', 'model_name',
                  'object_id', 'object_repr', 'changes', 'timestamp', 'ip_address',
                  'description']

    def get_user_email(self, obj):
        return obj.user.email if obj.user else "System"

    def get_user_name(self, obj):
        if not obj.user:
            return "System"
        full = f"{obj.user.first_name} {obj.user.last_name}".strip()
        return full or obj.user.email

    def get_description(self, obj):
        actor = self.get_user_name(obj)
        verb = {
            'created': 'created',
            'updated': 'updated',
            'deleted': 'deleted',
        }.get(obj.action, obj.action)
        return f"{actor} {verb} {obj.model_name} '{obj.object_repr}'"