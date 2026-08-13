import re
from django.conf import settings
from decimal import Decimal, ROUND_HALF_UP

from django.db import models
from django.utils.text import slugify

class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    is_active = models.BooleanField(default=True)
    def __str__(self): return self.name

class Product(models.Model):
    """The Blueprint / Design Class"""
    design_code = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(unique=True, blank=True)
    name = models.CharField(max_length=255)
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name='products')
    description = models.TextField(blank=True)
    base_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    # Base weights (Blueprint - Gold up to 3 decimals, Diamonds up to 2)
    base_net_weight_14kt = models.DecimalField(max_digits=6, decimal_places=3, help_text="Net gold in 14kt (grams)")
    
    diamond_weight_round_melle = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    pointer_solitaire_weight = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    fancy_cut_weight = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    color_stone_weight = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    diamond_color = models.CharField(max_length=50)
    diamond_clarity = models.CharField(max_length=50)
    
    has_solitaire_pointer = models.BooleanField(default=False)
    has_fancy_cut = models.BooleanField(default=False)
    has_color_stone = models.BooleanField(default=False)
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    @property
    def total_diamond_weight(self):
        return self.diamond_weight_round_melle + self.pointer_solitaire_weight + self.fancy_cut_weight

    def calculate_net_weight(self, karat: str, ring_size: str = None):
        base_weight = Decimal(str(self.base_net_weight_14kt))
        if ring_size and self.category.slug in ("rings", "solitaires"):
            try:
                steps = (int(ring_size) - self.BASE_RING_SIZE) // 2  # every 2 sizes = one 3% step
                base_weight = base_weight * (Decimal("1.03") ** steps)
            except (ValueError, TypeError):
                pass
        if karat == "18Kt":
            base_weight = base_weight * Decimal("1.20")
        return base_weight.quantize(Decimal("0.001"), rounding=ROUND_HALF_UP)

    def __str__(self): return f"{self.design_code} - {self.name}"

class ProductMedia(models.Model):
    KIND_CHOICES = [('image', 'Image'), ('video', 'Video')]
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='media')
    url = models.URLField(max_length=500)
    kind = models.CharField(max_length=10, choices=KIND_CHOICES, default='image')
    sort_order = models.PositiveIntegerField(default=0)
    class Meta:
        ordering = ['sort_order']

class ProductInstance(models.Model):
    """The Physical Item / SKU"""
    STATUS_CHOICES = [('in_stock', 'In Stock'), ('sold', 'Sold'), ('reserved', 'Reserved')]
    KARAT_CHOICES = [('14Kt', '14Kt'), ('18Kt', '18Kt')]
    COLOR_CHOICES = [('Yellow', 'Yellow'), ('Rose', 'Rose'), ('White', 'White')]

    item_code = models.CharField(max_length=100, unique=True) 
    design = models.ForeignKey(Product, on_delete=models.PROTECT, related_name='instances')
    karat = models.CharField(max_length=10, choices=KARAT_CHOICES)
    gold_color = models.CharField(max_length=10, choices=COLOR_CHOICES)
    ring_size = models.CharField(max_length=10, blank=True, null=True)
    price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    # Actual physical weights
    actual_net_weight = models.DecimalField(max_digits=6, decimal_places=3)
    actual_diamond_weight = models.DecimalField(max_digits=5, decimal_places=2)
    actual_color_stone_weight = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    report_lab = models.CharField(max_length=50, blank=True)
    report_number = models.CharField(max_length=100, blank=True)
    report_color = models.CharField(max_length=50, blank=True)
    report_clarity = models.CharField(max_length=50, blank=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='in_stock')
    sold_to_user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='purchased_items')
    sold_in_order = models.ForeignKey('orders.Order', on_delete=models.SET_NULL, null=True, blank=True, related_name='purchased_items')
    sold_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self): return self.item_code

    @property
    def gold_value(self):
        rate_card = RateCard.get()
        rate = rate_card.gold_rate_18kt if self.karat == '18Kt' else rate_card.gold_rate_14kt
        return Decimal(str(self.actual_net_weight)) * rate

    @property
    def diamond_value(self):
        return self.actual_diamond_weight * RateCard.get().diamond_rate_per_carat

    @property
    def color_stone_value(self):
        # Placeholder — extend RateCard if you sell color stones
        return Decimal("0.00")

    @property
    def making_charges(self):
        base = self.gold_value + self.diamond_value + self.color_stone_value
        return base * (RateCard.get().making_charges_percentage / 100)

    @property
    def gst_amount(self):
        base = self.gold_value + self.diamond_value + self.color_stone_value + self.making_charges
        return base * (RateCard.get().gst_percentage / 100)

    @property
    def calculated_price(self):
        return self.gold_value + self.diamond_value + self.color_stone_value + self.making_charges + self.gst_amount


class RateCard(models.Model):
    """Singleton model for global pricing rates"""
    gold_rate_14kt = models.DecimalField(max_digits=10, decimal_places=2, help_text="INR per gram")
    gold_rate_18kt = models.DecimalField(max_digits=10, decimal_places=2, help_text="INR per gram")
    diamond_rate_per_carat = models.DecimalField(max_digits=10, decimal_places=2, help_text="INR per carat")
    making_charges_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=15.00, help_text="% of gold+diamond value")
    gst_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=3.00, help_text="% of total")
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Rate Card"
        verbose_name_plural = "Rate Card"

    def save(self, *args, **kwargs):
        self.pk = 1  # Enforce singleton
        super().save(*args, **kwargs)

    @classmethod
    def get(cls):
        obj, _ = cls.objects.get_or_create(
            pk=1,
            defaults={
                "gold_rate_14kt": 7000,
                "gold_rate_18kt": 8400,
                "diamond_rate_per_carat": 45000,
            },
        )
        return obj

    def __str__(self):
        return f"Rate Card (updated {self.updated_at:%Y-%m-%d})"