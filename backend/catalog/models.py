"""
YA-RA® — Catalog models (default-safe: migrations never prompt).
"""
from django.db import models
from django.utils.text import slugify


# ────────────────────────────────────────────────────────────
# Choices
# ────────────────────────────────────────────────────────────
PURITY_CHOICES = [("18Kt", "18Kt"), ("14Kt", "14Kt")]
GOLD_COLOR_CHOICES = [("Yellow", "Yellow"), ("White", "White"), ("Rose", "Rose")]
CERTIFICATION_CHOICES = [("IGI", "IGI"), ("GIA", "GIA")]
QUALITY_CHOICES = [
    ("EF-VVS", "EF - VVS (Premium Clarity)"),
    ("GH-VS", "GH - VS (Fine Quality)"),
]


class Category(models.Model):
    name = models.CharField(max_length=80, unique=True)
    slug = models.SlugField(max_length=100, unique=True, blank=True)
    description = models.TextField(blank=True, default="")
    sort_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)

    class Meta:
        ordering = ["sort_order", "name"]
        verbose_name_plural = "categories"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Product(models.Model):
    name = models.CharField(max_length=200, default="")
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    description = models.TextField(blank=True, default="")
    category = models.ForeignKey(
        Category, on_delete=models.PROTECT, related_name="products",
        null=True, blank=True,
    )

    carat = models.DecimalField(
        "Total diamond weight (ct)",
        max_digits=5, decimal_places=2, null=True, blank=True,
    )
    diamond_quality = models.CharField(
        max_length=20, choices=QUALITY_CHOICES, default="GH-VS", blank=True
    )
    certification = models.CharField(
        max_length=10, choices=CERTIFICATION_CHOICES, default="IGI"
    )

    compare_at_price = models.DecimalField(
        "Strikethrough price (INR)",
        max_digits=12, decimal_places=2, null=True, blank=True,
    )
    badge = models.CharField("Badge e.g. BESTSELLER", max_length=30, blank=True, default="")
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    @property
    def primary_image(self):
        first = self.images.first()
        return first.url if first else None

    # @property
    # def min_price(self):
    #     prices = [v.price for v in self.variants.filter(is_active=True)]
    #     return min(prices) if prices else None

    def __str__(self):
        return self.name


class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="images")
    url = models.URLField(max_length=500, blank=True, default="")
    alt_text = models.CharField(max_length=200, blank=True, default="")
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["sort_order", "id"]

    def __str__(self):
        return f"{self.product.name} · image {self.id}"


class ProductVideo(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="videos")
    url = models.URLField(max_length=500, blank=True, default="")
    title = models.CharField(max_length=200, blank=True, default="")
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["sort_order", "id"]

    def __str__(self):
        return f"{self.product.name} · video {self.id}"


class ProductVariant(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="variants")
    purity = models.CharField(max_length=10, choices=PURITY_CHOICES, default="18Kt")
    gold_color = models.CharField(max_length=10, choices=GOLD_COLOR_CHOICES, default="Yellow")
    ring_size = models.CharField(max_length=10, null=True, blank=True)

    price = models.DecimalField(
        "Selling price (INR)", max_digits=12, decimal_places=2, default=0
    )
    gold_weight_grams = models.DecimalField(
        max_digits=6, decimal_places=2, null=True, blank=True
    )

    gold_value = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    diamond_value = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    making_charges = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    gst_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)

    stock = models.PositiveIntegerField(default=0)
    sku = models.CharField(max_length=60, unique=True, null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["product", "purity", "gold_color"]

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if not self.sku:
            self.sku = (
                f"YRA-{self.product_id:05d}-"
                f"{self.purity}{self.gold_color[:1].upper()}{self.ring_size or 'OS'}"
            )
            super().save(update_fields=["sku"])

    @property
    def label(self):
        base = f"{self.purity} {self.gold_color} Gold"
        return f"{base} | Size {self.ring_size}" if self.ring_size else base

    def __str__(self):
        return f"{self.product.name} · {self.label}"