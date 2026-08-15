from rest_framework import serializers
from catalog.models import Product, ProductInstance, Category, ProductMedia, RateCard
from orders.models import Order, OrderItem
from accounts.models import User

class StaffUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'phone', 'is_staff', 'date_joined']

class StaffOrderItemSerializer(serializers.ModelSerializer):
    # Use the denormalized product_name field directly
    total_price = serializers.SerializerMethodField()
    
    class Meta:
        model = OrderItem
        fields = ['id', 'product_name', 'variant_label', 'quantity', 'unit_price', 'total_price', 'instance']
    
    def get_total_price(self, obj):
        # Use line_total if available, otherwise calculate
        if hasattr(obj, 'line_total') and obj.line_total:
            return float(obj.line_total)
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
        # 1) Account name → 2) Recipient name from checkout → 3) Email
        full = f"{obj.user.first_name} {obj.user.last_name}".strip()
        if full:
            return full
        if obj.address and getattr(obj.address, "full_name", ""):
            return obj.address.full_name
        return obj.user.email
    
    def get_customer_phone(self, obj):
        # Get phone from user model
        phone = getattr(obj.user, 'phone', '')
        return phone if phone else "Not provided"
    
    def get_address(self, obj):
        a = obj.address
        if not a:
            return None
        return {
            "full_name": a.full_name,
            "phone": a.phone,
            "line1": a.line1,
            "line2": a.line2 or "",
            "city": a.city,
            "state": a.state,
            "pincode": a.pincode,
        }

class StaffProductInstanceSerializer(serializers.ModelSerializer):
    sold_in_order_number = serializers.SerializerMethodField()

    class Meta:
        model = ProductInstance
        fields = ['id', 'item_code', 'karat', 'gold_color', 'ring_size', 'status', 'price',
                  'actual_net_weight', 'actual_diamond_weight', 'actual_color_stone_weight',
                  'report_lab', 'report_number', 'sold_at', 'sold_in_order_number']

    def get_sold_in_order_number(self, obj):
        return obj.sold_in_order.order_number if obj.sold_in_order else None
    
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