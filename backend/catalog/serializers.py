from rest_framework import serializers
from decimal import Decimal

from .models import Category, Design, ProductMedia, Product, RateCard, Tag


class CategorySerializer(serializers.ModelSerializer):
    subcategories = serializers.SerializerMethodField()
    parent_name = serializers.CharField(source='parent.name', read_only=True, default='')

    class Meta:
        model = Category
        fields = ["id", "name", "slug", "is_active", "parent", "parent_name", "subcategories"]

    def get_subcategories(self, obj):
        children = obj.subcategories.filter(is_active=True).order_by('name')
        return CategorySerializer(children, many=True).data

class TagSerializer(serializers.ModelSerializer):
    group_display = serializers.CharField(source='get_group_display', read_only=True)
    design_count = serializers.SerializerMethodField()

    class Meta:
        model = Tag
        fields = ['id', 'name', 'slug', 'group', 'group_display', 'is_active', 'design_count']
        read_only_fields = ['slug']  # Auto-generated, not user-provided

    def get_design_count(self, obj):
        return obj.designs.filter(is_active=True).count()

    def create(self, validated_data):
        from django.utils.text import slugify
        name = validated_data.get('name', '')
        base_slug = slugify(name)
        slug = base_slug
        n = 2
        while Tag.objects.filter(slug=slug).exists():
            slug = f"{base_slug}-{n}"
            n += 1
        validated_data['slug'] = slug
        return super().create(validated_data)

class ProductMediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductMedia
        fields = ["id", "url", "kind", "sort_order"]

class ProductSerializer(serializers.ModelSerializer):
    """The physical, sellable piece."""
    gold_value = serializers.SerializerMethodField()
    diamond_value = serializers.SerializerMethodField()
    color_stone_value = serializers.SerializerMethodField()
    making_charges = serializers.SerializerMethodField()
    gst_amount = serializers.SerializerMethodField()
    hallmark_numbers = serializers.JSONField(read_only=True)

    class Meta:
        model = Product
        fields = ["id", "item_code", "karat", "gold_color", "ring_size", "diamond_grade",
                  "status", "price", "actual_net_weight", "actual_diamond_weight",
                  "actual_color_stone_weight", "report_lab", "report_number",
                  "hallmark_numbers",
                  "gold_value", "diamond_value", "color_stone_value", "making_charges", "gst_amount"]

    def get_gold_value(self, obj):
        return float(obj.gold_value)

    def get_diamond_value(self, obj):
        return float(obj.diamond_value)

    def get_color_stone_value(self, obj):
        return float(obj.color_stone_value)

    def get_making_charges(self, obj):
        return float(obj.making_charges)

    def get_gst_amount(self, obj):
        return float(obj.gst_amount)


class RateCardSerializer(serializers.ModelSerializer):
    class Meta:
        model = RateCard
        fields = ["gold_rate_14kt", "gold_rate_18kt", "diamond_rates", "default_grade",
                  "making_charges_percentage", "gst_percentage", "color_stone_rate_per_carat"]


def design_from_price(obj):
    """'From' price: cheapest in-stock piece, else MTO estimate @ default grade (14Kt)."""
    inst = obj.products.filter(status="in_stock").order_by("price").first()
    if inst:
        return float(inst.price)
    rc = RateCard.get()
    net = float(obj.base_net_weight_14kt)
    dia = float(obj.total_diamond_weight)
    color_stone = float(obj.color_stone_weight)
    
    gold_value = net * float(rc.gold_rate_14kt)
    dia_value = dia * float(rc.rate_for_grade(rc.default_grade))
    color_stone_value = color_stone * float(rc.color_stone_rate_per_carat or 0)
    
    gold_rate_24kt = float(rc.gold_rate_18kt) * (24.0 / 18.0)
    making_per_gram = float(rc.making_fixed_per_gram) + (float(rc.making_pct_24kt) / 100.0) * gold_rate_24kt
    making = making_per_gram * net
    
    subtotal = gold_value + dia_value + color_stone_value + making
    gst = subtotal * (float(rc.gst_percentage) / 100)
    return round(subtotal + gst)


class DesignListSerializer(serializers.ModelSerializer):
    media = ProductMediaSerializer(many=True, read_only=True)
    category_name = serializers.CharField(source="category.full_path", read_only=True)
    category_slug = serializers.CharField(source="category.slug", read_only=True)
    is_ring = serializers.BooleanField(source="category.is_ring_family", read_only=True)
    base_price = serializers.SerializerMethodField()
    in_stock = serializers.SerializerMethodField()
    tags = TagSerializer(many=True, read_only=True)
    total_diamond_weight = serializers.SerializerMethodField()  # ADD THIS

    class Meta:
        model = Design
        fields = ["id", "design_code", "slug", "name", "category", "category_name",
                  "category_slug", "base_net_weight_14kt", "total_diamond_weight",
                  "base_price", "in_stock", "media", "is_ring", "tags"]

    def get_total_diamond_weight(self, obj):
        return obj.total_diamond_weight

    def get_base_price(self, obj):
        return design_from_price(obj)

    def get_in_stock(self, obj):
        return obj.products.filter(status="in_stock").exists()


class DesignDetailSerializer(serializers.ModelSerializer):
    media = ProductMediaSerializer(many=True, read_only=True)
    products = ProductSerializer(many=True, read_only=True)
    category_name = serializers.CharField(source="category.name", read_only=True)
    category_slug = serializers.CharField(source="category.slug", read_only=True)
    parent_category_slug = serializers.SerializerMethodField()
    is_ring = serializers.BooleanField(source="category.is_ring_family", read_only=True)
    base_price = serializers.SerializerMethodField()
    rate_card = serializers.SerializerMethodField()
    tags = TagSerializer(many=True, read_only=True)
    pointer_weights = serializers.JSONField(read_only=True)
    fancy_weights = serializers.JSONField(read_only=True)
    color_stone_weights = serializers.JSONField(read_only=True)
    total_diamond_weight = serializers.SerializerMethodField()
    color_stone_weight = serializers.SerializerMethodField()

    class Meta:
        model = Design
        fields = ["id", "design_code", "slug", "name", "category", "category_name",
                  "category_slug", "parent_category_slug", "base_net_weight_14kt",
                  "size_weight_refs", "diamond_weight_round_melle",
                  "pointer_weights", "fancy_weights", "color_stone_weights",
                  "total_diamond_weight", "color_stone_weight",
                  "base_price", "media", "products", "rate_card", "is_ring", "tags"]

    def get_parent_category_slug(self, obj):
        return obj.category.parent.slug if obj.category.parent else None

    def get_total_diamond_weight(self, obj):
        return obj.total_diamond_weight

    def get_color_stone_weight(self, obj):
        return obj.color_stone_weight

    def get_base_price(self, obj):
        return design_from_price(obj)

    def get_rate_card(self, obj):
        rc = RateCard.get()
        return {
            "gold_rate_14kt": float(rc.gold_rate_14kt),
            "gold_rate_18kt": float(rc.gold_rate_18kt),
            "diamond_rates": {k: float(v) for k, v in rc.grade_choices().items()},
            "default_grade": rc.default_grade,
            "making_charges_percentage": float(rc.making_charges_percentage),
            "making_fixed_per_gram": float(rc.making_fixed_per_gram or 0),
            "making_pct_24kt": float(rc.making_pct_24kt or 0),
            "gst_percentage": float(rc.gst_percentage),
            "color_stone_rate_per_carat": float(rc.color_stone_rate_per_carat or 0),
        }