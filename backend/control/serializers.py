from rest_framework import serializers
from catalog.models import Product, ProductInstance, Category, ProductMedia, RateCard
from orders.models import Order, OrderItem
from accounts.models import User

class StaffUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'phone', 'is_staff', 'date_joined']

class StaffOrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.SerializerMethodField()
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = ['id', 'product_name', 'variant_label', 'quantity', 'unit_price', 'total_price', 'instance']

    def get_product_name(self, obj):
        # Try every possible source: denormalized field, FKs, then via the instance
        if getattr(obj, "product_name", None):
            return obj.product_name
        related = getattr(obj, "product", None) or getattr(obj, "design", None)
        if related is not None:
            return related.name
        inst = getattr(obj, "instance", None)
        if inst is not None and getattr(inst, "design", None) is not None:
            return inst.design.name
        return "Unknown"

    def get_total_price(self, obj):
        return float(obj.unit_price) * int(obj.quantity)


class StaffOrderSerializer(serializers.ModelSerializer):
    items = StaffOrderItemSerializer(many=True, read_only=True)
    customer_email = serializers.CharField(source="user.email")
    customer_name = serializers.SerializerMethodField()
    customer_phone = serializers.SerializerMethodField()
    address = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = ['id', 'order_number', 'customer_email', 'customer_name', 'customer_phone',
                  'status', 'payment_method', 'subtotal', 'shipping_fee', 'total',
                  'created_at', 'items', 'address']

    def get_customer_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}".strip() or obj.user.email

    def get_customer_phone(self, obj):
        return getattr(obj.user, "phone", "") or "—"

    def get_address(self, obj):
        a = obj.address
        if not a:
            return None
        return {
            "full_name": getattr(a, "full_name", ""),
            "phone": getattr(a, "phone", ""),
            "line1": getattr(a, "line1", ""),
            "line2": getattr(a, "line2", ""),
            "city": getattr(a, "city", ""),
            "state": getattr(a, "state", ""),
            "pincode": getattr(a, "pincode", ""),
        }

class StaffProductInstanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductInstance
        fields = ['id', 'item_code', 'karat', 'gold_color', 'ring_size', 'status', 'price',
                  'actual_net_weight', 'actual_diamond_weight', 'actual_color_stone_weight',
                  'report_lab', 'report_number']

class StaffProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name')
    instances = StaffProductInstanceSerializer(many=True, read_only=True)
    instance_count = serializers.SerializerMethodField()
    in_stock_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = ['id', 'design_code', 'slug', 'name', 'category_name', 'base_price',
                  'base_net_weight_14kt', 'total_diamond_weight', 'instances',
                  'instance_count', 'in_stock_count']
    
    def get_instance_count(self, obj):
        return obj.instances.count()
    
    def get_in_stock_count(self, obj):
        return obj.instances.filter(status='in_stock').count()

class StaffCategorySerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'product_count']
    
    def get_product_count(self, obj):
        return obj.products.count()

class RateCardSerializer(serializers.ModelSerializer):
    class Meta:
        model = RateCard
        fields = ['id', 'gold_rate_14kt', 'gold_rate_18kt', 'diamond_rate_per_carat',
                  'making_charges_percentage', 'gst_percentage', 'updated_at']

class ProductCreateSerializer(serializers.ModelSerializer):
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all())
    
    class Meta:
        model = Product
        fields = ['name', 'design_code', 'category', 'base_net_weight_14kt', 'base_price',
                  'total_diamond_weight', 'diamond_weight_round_melle', 'pointer_solitaire_weight',
                  'fancy_cut_weight', 'color_stone_weight', 'diamond_color', 'diamond_clarity',
                  'has_solitaire_pointer', 'has_fancy_cut', 'has_color_stone', 'description']

class InstanceCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductInstance
        fields = ['karat', 'gold_color', 'ring_size', 'actual_net_weight', 'actual_diamond_weight',
                  'actual_color_stone_weight', 'report_lab', 'report_number']

class ProductMediaUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductMedia
        fields = ['url', 'kind', 'position']