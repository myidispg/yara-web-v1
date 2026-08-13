from rest_framework import serializers

from .models import Category, Product, ProductMedia, ProductInstance


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "slug"]


class ProductMediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductMedia
        fields = ["url", "kind", "sort_order"]


class ProductInstanceSerializer(serializers.ModelSerializer):
    gold_value = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    diamond_value = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    making_charges = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    gst_amount = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    calculated_price = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = ProductInstance
        fields = ["id", "item_code", "karat", "gold_color", "ring_size", "status",
                  "actual_net_weight", "actual_diamond_weight", "actual_color_stone_weight",
                  "report_lab", "report_number", "price",
                  "gold_value", "diamond_value", "making_charges", "gst_amount", "calculated_price"]


class ProductListSerializer(serializers.ModelSerializer):
    media = ProductMediaSerializer(many=True, read_only=True)
    category_name = serializers.CharField(source="category.name", read_only=True)
    in_stock = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ["id", "design_code", "slug", "name", "category", "category_name",
                  "base_price", "total_diamond_weight", "media", "in_stock"]

    def get_in_stock(self, obj):
        return any(i.status == "in_stock" for i in obj.instances.all())


class ProductDetailSerializer(serializers.ModelSerializer):
    media = ProductMediaSerializer(many=True, read_only=True)
    instances = ProductInstanceSerializer(many=True, read_only=True)
    category_name = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = Product
        fields = ["id", "design_code", "slug", "name", "category", "category_name", "description",
                  "base_net_weight_14kt", "base_price", "total_diamond_weight",
                  "diamond_weight_round_melle", "pointer_solitaire_weight", "fancy_cut_weight",
                  "color_stone_weight", "diamond_color", "diamond_clarity",
                  "has_solitaire_pointer", "has_fancy_cut", "has_color_stone",
                  "media", "instances"]