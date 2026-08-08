import uuid

from django.db import models
from django.utils.text import slugify

GOLD_COLORS = [("yellow", "Yellow"), ("rose", "Rose"), ("white", "White")]
PURITIES = [("14K", "14 KT"), ("18K", "18 KT")]
RING_SIZES = [(s, f"Size {s}") for s in
              ["5", "5.5", "6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10", "11", "12", "13"]]


class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=120, unique=True)
    parent = models.ForeignKey("self", null=True, blank=True,
                               related_name="subcategories", on_delete=models.CASCADE)
    description = models.TextField(blank=True)
    image_url = models.URLField(blank=True)
    ordering = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["ordering", "name"]
        verbose_name_plural = "categories"

    def __str__(self):
        return f"{self.parent.name} › {self.name}" if self.parent else self.name


class Product(models.Model):
    STOCK = [("in_stock", "In stock"), ("low_stock", "Low stock"),
             ("out_of_stock", "Out of stock"), ("made_to_order", "Made to order")]

    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True)
    category = models.ForeignKey(Category, related_name="products", on_delete=models.PROTECT)
    sku = models.CharField(max_length=40, unique=True, blank=True)
    short_description = models.CharField(max_length=300, blank=True)
    description = models.TextField(blank=True)
    diamond_info = models.CharField(max_length=300, blank=True)
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    mrp = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    stock_status = models.CharField(max_length=20, choices=STOCK, default="in_stock")
    is_featured = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        if not self.sku:
            self.sku = f"VR-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)


class ProductVariant(models.Model):
    product = models.ForeignKey(Product, related_name="variants", on_delete=models.CASCADE)
    gold_color = models.CharField(max_length=10, choices=GOLD_COLORS, default="yellow")
    purity = models.CharField(max_length=6, choices=PURITIES, default="18K")
    ring_size = models.CharField(max_length=5, blank=True, null=True, choices=RING_SIZES)
    price_delta = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    stock_quantity = models.PositiveIntegerField(default=10)
    sku = models.CharField(max_length=60, unique=True, blank=True)

    class Meta:
        constraints = [models.UniqueConstraint(
            fields=["product", "gold_color", "purity", "ring_size"], name="uniq_variant")]

    def __str__(self):
        return self.label

    @property
    def price(self):
        return self.product.base_price + self.price_delta

    @property
    def in_stock(self):
        return self.stock_quantity > 0

    @property
    def label(self):
        base = f"{self.get_gold_color_display()} gold · {self.get_purity_display()}"
        return f"{base} · Size {self.ring_size}" if self.ring_size else base

    def save(self, *args, **kwargs):
        if not self.sku:
            size = f"-S{self.ring_size}" if self.ring_size else ""
            self.sku = f"{self.product.sku}-{self.gold_color[:2].upper()}-{self.purity}{size}"
        super().save(*args, **kwargs)


class ProductImage(models.Model):
    product = models.ForeignKey(Product, related_name="images", on_delete=models.CASCADE)
    image = models.ImageField(upload_to="products/", blank=True)
    remote_url = models.URLField(blank=True)   # handy for seeds / CDN images
    alt = models.CharField(max_length=200, blank=True)
    ordering = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["ordering"]


class ProductVideo(models.Model):
    product = models.ForeignKey(Product, related_name="videos", on_delete=models.CASCADE)
    title = models.CharField(max_length=200, blank=True)
    video_url = models.URLField()
    is_primary = models.BooleanField(default=False)
    ordering = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["ordering"]