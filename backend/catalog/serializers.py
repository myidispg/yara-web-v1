from rest_framework import serializers

from .models import Category, Product, ProductImage, ProductVideo, ProductVariant


def resolve_image_url(request, img: ProductImage):
    if img.remote_url:
        return img.remote_url
    if img.image:
        return request.build_absolute_uri(img.image.url) if request else img.image.url
    return None


class CategorySerializer(serializers.ModelSerializer):
    subcategories = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ["id", "name", "slug", "description", "image_url", "subcategories"]

    def get_subcategories(self, obj):
        subs = getattr(obj, "_prefetched_objects_cache", {}).get("subcategories") \
            or obj.subcategories.filter(is_active=True)
        return [{"id": s.id, "name": s.name, "slug": s.slug} for s in subs]


class VariantSerializer(serializers.ModelSerializer):
    price = serializers.SerializerMethodField()
    in_stock = serializers.BooleanField(read_only=True)
    purity_label = serializers.CharField(source="get_purity_display", read_only=True)

    class Meta:
        model = ProductVariant
        fields = ["id", "sku", "gold_color", "purity", "purity_label",
                  "ring_size", "price", "price_delta", "stock_quantity", "in_stock"]

    def get_price(self, obj):
        return float(obj.price)


class ImageSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = ["id", "url", "alt"]

    def get_url(self, obj):
        return resolve_image_url(self.context.get("request"), obj)


class VideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVideo
        fields = ["id", "title", "video_url", "is_primary"]


class ProductListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    category_slug = serializers.CharField(source="category.slug", read_only=True)
    primary_image = serializers.SerializerMethodField()
    second_image = serializers.SerializerMethodField()
    colors = serializers.SerializerMethodField()
    min_price = serializers.SerializerMethodField()
    discount_percent = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ["id", "name", "slug", "category_name", "category_slug", "base_price",
                  "mrp", "min_price", "discount_percent", "stock_status", "is_featured",
                  "primary_image", "second_image", "colors"]

    def _images(self, obj):
        imgs = sorted(obj.images.all(), key=lambda i: i.ordering)
        return imgs

    def get_primary_image(self, obj):
        imgs = self._images(obj)
        return resolve_image_url(self.context.get("request"), imgs[0]) if imgs else None

    def get_second_image(self, obj):
        imgs = self._images(obj)
        return resolve_image_url(self.context.get("request"), imgs[1]) if len(imgs) > 1 else None

    def get_colors(self, obj):
        return sorted({v.gold_color for v in obj.variants.all()})

    def get_min_price(self, obj):
        prices = [v.price for v in obj.variants.all()]
        return float(min(prices)) if prices else float(obj.base_price)

    def get_discount_percent(self, obj):
        if obj.mrp and obj.mrp > obj.base_price:
            return round((1 - obj.base_price / obj.mrp) * 100)
        return 0


class ProductDetailSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    category_slug = serializers.CharField(source="category.slug", read_only=True)
    category_parent = serializers.SerializerMethodField()
    images = ImageSerializer(many=True, read_only=True)
    videos = VideoSerializer(many=True, read_only=True)
    variants = VariantSerializer(many=True, read_only=True)
    discount_percent = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ["id", "name", "slug", "sku", "category_name", "category_slug",
                  "category_parent", "short_description", "description", "diamond_info",
                  "base_price", "mrp", "discount_percent", "stock_status", "is_featured",
                  "images", "videos", "variants", "created_at"]

    def get_category_parent(self, obj):
        return {"name": obj.category.parent.name, "slug": obj.category.parent.slug} \
            if obj.category.parent else None

    def get_discount_percent(self, obj):
        if obj.mrp and obj.mrp > obj.base_price:
            return round((1 - obj.base_price / obj.mrp) * 100)
        return 0