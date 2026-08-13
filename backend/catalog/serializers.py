"""
YA-RA® — Catalog serializers.
Output shape matches the React storefront exactly:
  product.images[i].url, product.primary_image,
  product.variants[i].{id, purity, gold_color, ring_size, price, ...},
  product.compare_at_price, product.carat, product.diamond_quality,
  product.badge, product.category.{name, slug}
"""
from rest_framework import serializers

from .models import Category, Product, ProductImage, ProductVariant


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "slug", "description"]


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ["id", "url", "alt_text", "sort_order"]


class ProductVariantSerializer(serializers.ModelSerializer):
    label = serializers.SerializerMethodField()

    class Meta:
        model = ProductVariant
        fields = [
            "id",
            "purity",
            "gold_color",
            "ring_size",
            "price",
            "gold_weight_grams",
            # Transparent breakdown (used by frontend utils/pricing.js)
            "gold_value",
            "diamond_value",
            "making_charges",
            "gst_amount",
            "stock",
            "sku",
            "is_active",
            "label",
        ]

    def get_label(self, obj):
        return obj.label


class ProductListSerializer(serializers.ModelSerializer):
    """For category grids & home rails — includes variants (cards need
    purity tags + min price) but not the full image gallery."""
    category = CategorySerializer(read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)
    primary_image = serializers.SerializerMethodField()
    min_price = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "slug",
            "category",
            "carat",
            "diamond_quality",
            "certification",
            "compare_at_price",
            "badge",
            "primary_image",
            "min_price",
            "variants",
            "created_at",
        ]

    def get_primary_image(self, obj):
        return obj.primary_image

    def get_min_price(self, obj):
        return obj.min_price


class ProductDetailSerializer(serializers.ModelSerializer):
    """Full payload for the product page (gallery + all variants)."""
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source="category", write_only=True
    )
    images = ProductImageSerializer(many=True, read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)
    primary_image = serializers.SerializerMethodField()
    min_price = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "slug",
            "description",
            "category",
            "category_id",
            "carat",
            "diamond_quality",
            "certification",
            "compare_at_price",
            "badge",
            "is_active",
            "images",
            "variants",
            "primary_image",
            "min_price",
            "created_at",
            "updated_at",
        ]

    def get_primary_image(self, obj):
        return obj.primary_image

    def get_min_price(self, obj):
        return obj.min_price

# ── Compatibility aliases (older views/admin code may import these names) ──
ProductSerializer = ProductDetailSerializer
VariantSerializer = ProductVariantSerializer
ImageSerializer = ProductImageSerializer