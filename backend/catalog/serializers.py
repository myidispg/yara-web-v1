from rest_framework import serializers
from decimal import Decimal

from .models import Category, Design, ProductMedia, Product, RateCard


class CategorySerializer(serializers.ModelSerializer):
    subcategories = serializers.SerializerMethodField()
    parent_name = serializers.CharField(source='parent.name', read_only=True, default='')

    class Meta:
        model = Category
        fields = ["id", "name", "slug", "is_active", "parent", "parent_name", "subcategories"]

    def get_subcategories(self, obj):
        children = obj.subcategories.filter(is_active=True).order_by('name')
        return CategorySerializer(children, many=True).data

class ProductMediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductMedia
        fields = ["id", "url", "kind", "sort_order"]

class ProductSerializer(serializers.ModelSerializer):
    """The physical, sellable piece."""
    gold_value = serializers.SerializerMethodField()
    diamond_value = serializers.SerializerMethodField()
    making_charges = serializers.SerializerMethodField()
    gst_amount = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ["id", "item_code", "karat", "gold_color", "ring_size", "diamond_grade",
                  "status", "price", "actual_net_weight", "actual_diamond_weight",
                  "actual_color_stone_weight", "report_lab", "report_number",
                  "gold_value", "diamond_value", "making_charges", "gst_amount"]

    def get_gold_value(self, obj):
        return float(obj.gold_value)

    def get_diamond_value(self, obj):
        return float(obj.diamond_value)

    def get_making_charges(self, obj):
        return float(obj.making_charges)

    def get_gst_amount(self, obj):
        return float(obj.gst_amount)


class RateCardSerializer(serializers.ModelSerializer):
    class Meta:
        model = RateCard
        fields = ["gold_rate_14kt", "gold_rate_18kt", "diamond_rates", "default_grade",
                  "making_charges_percentage", "gst_percentage"]


def design_from_price(obj):
    """'From' price: cheapest in-stock piece, else MTO estimate @ default grade (14Kt)."""
    inst = obj.products.filter(status="in_stock").order_by("price").first()
    if inst:
        return float(inst.price)
    rc = RateCard.get()
    net = float(obj.base_net_weight_14kt)
    dia = float(obj.total_diamond_weight)
    gold_value = net * float(rc.gold_rate_14kt)
    dia_value = dia * float(rc.rate_for_grade(rc.default_grade))
    making = (gold_value + dia_value) * (float(rc.making_charges_percentage) / 100)
    gst = (gold_value + dia_value + making) * (float(rc.gst_percentage) / 100)
    return round(gold_value + dia_value + making + gst)


class DesignListSerializer(serializers.ModelSerializer):
    media = ProductMediaSerializer(many=True, read_only=True)
    category_name = serializers.CharField(source="category.full_path", read_only=True)
    category_slug = serializers.CharField(source="category.slug", read_only=True)
    is_ring = serializers.BooleanField(source="category.is_ring_family", read_only=True)
    base_price = serializers.SerializerMethodField()
    in_stock = serializers.SerializerMethodField()

    class Meta:
        model = Design
        fields = ["id", "design_code", "slug", "name", "category", "category_name",
                  "category_slug", "base_net_weight_14kt", "total_diamond_weight",
                  "base_price", "in_stock", "media", "is_ring",]

    def get_base_price(self, obj):
        return design_from_price(obj)

    def get_in_stock(self, obj):
        return obj.products.filter(status="in_stock").exists()


class DesignDetailSerializer(serializers.ModelSerializer):
    media = ProductMediaSerializer(many=True, read_only=True)
    products = ProductSerializer(many=True, read_only=True)
    category_name = serializers.CharField(source="category.name", read_only=True)
    category_slug = serializers.CharField(source="category.slug", read_only=True)
    is_ring = serializers.BooleanField(source="category.is_ring_family", read_only=True)
    base_price = serializers.SerializerMethodField()
    rate_card = serializers.SerializerMethodField()

    class Meta:
        model = Design
        fields = ["id", "design_code", "slug", "name", "category", "category_name",
                  "category_slug", "description", "base_net_weight_14kt",
                  "size_weight_refs", "total_diamond_weight",
                  "diamond_weight_round_melle", "pointer_solitaire_weight",
                  "fancy_cut_weight", "color_stone_weight",
                  "has_solitaire_pointer", "has_fancy_cut", "has_color_stone",
                  "base_price", "media", "products", "rate_card", "is_ring",]

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
            "gst_percentage": float(rc.gst_percentage),
        }