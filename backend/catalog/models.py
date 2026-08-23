from decimal import Decimal, ROUND_HALF_UP

from django.conf import settings
from django.db import models
from django.utils.text import slugify

RING_SIZES = ["6", "8", "10", "12", "14", "16", "18", "20"]


class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    is_active = models.BooleanField(default=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='subcategories')

    class Meta:
        verbose_name_plural = "categories"

    def __str__(self):
        if self.parent:
            return f"{self.parent.name} > {self.name}"
        return self.name

    RING_FAMILY_SLUGS = ("rings", "solitaires", "color-stone")

    @property
    def is_ring_family(self):
        return self.slug in self.RING_FAMILY_SLUGS or (
            self.parent is not None and self.parent.slug in self.RING_FAMILY_SLUGS
        )

    @property
    def is_subcategory(self):
        return self.parent is not None

    @property
    def full_path(self):
        """Returns 'Parent > Child' or just 'Parent' for top-level."""
        if self.parent:
            return f"{self.parent.name} > {self.name}"
        return self.name

class Design(models.Model):
    """The blueprint. Always sellable — pieces without stock are Made-to-Order."""
    BASE_RING_SIZE = 12
    SIZE_STEP = Decimal("1.03")

    design_code = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(unique=True, blank=True)
    name = models.CharField(max_length=255)
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name="designs")
    description = models.TextField(blank=True)

    # Reference gold weight in 14Kt. For rings: reference @ size 12.
    base_net_weight_14kt = models.DecimalField(max_digits=6, decimal_places=3)

    # Per-size reference weights (14Kt) + how many updates fed each reference.
    size_weight_refs = models.JSONField(default=dict, blank=True)
    size_weight_counts = models.JSONField(default=dict, blank=True)

    diamond_weight_round_melle = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    pointer_solitaire_weight = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    fancy_cut_weight = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    color_stone_weight = models.DecimalField(max_digits=5, decimal_places=2, default=0)

    has_solitaire_pointer = models.BooleanField(default=False)
    has_fancy_cut = models.BooleanField(default=False)
    has_color_stone = models.BooleanField(default=False)

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.design_code} - {self.name}"

    @property
    def is_ring(self):
        return self.category.is_ring_family

    @property
    def total_diamond_weight(self):
        return self.diamond_weight_round_melle + self.pointer_solitaire_weight + self.fancy_cut_weight

    # ── Size-weight reference engine ────────────────────────────────
    def init_size_refs(self, weight, at_size=None):
        """Seed references for all ring sizes from one known weight @ at_size."""
        at = int(at_size or self.BASE_RING_SIZE)
        w = Decimal(str(weight))
        refs, counts = {}, {}
        for s in RING_SIZES:
            factor = self.SIZE_STEP ** ((int(s) - at) // 2)
            refs[s] = float((w * factor).quantize(Decimal("0.001"), rounding=ROUND_HALF_UP))
            counts[s] = 1
        self.size_weight_refs = refs
        self.size_weight_counts = counts
        self.base_net_weight_14kt = refs[str(self.BASE_RING_SIZE)]
        return refs

    def reference_weight_for_size(self, size):
        refs = self.size_weight_refs or {}
        key = str(size)
        if key in refs:
            return Decimal(str(refs[key]))
        return Decimal(str(self.base_net_weight_14kt))

    def record_actual_weight(self, size, weight):
        """Fold a real measured weight @ size into ALL references using a
        running average weighted by per-size update counts."""
        if not size:
            return
        refs = {k: Decimal(str(v)) for k, v in (self.size_weight_refs or {}).items()}
        counts = {k: int(v) for k, v in (self.size_weight_counts or {}).items()}
        s = int(size)
        w = Decimal(str(weight))
        for t in RING_SIZES:
            factor = self.SIZE_STEP ** ((int(t) - s) // 2)
            candidate = (w * factor).quantize(Decimal("0.001"), rounding=ROUND_HALF_UP)
            old = refs.get(t, candidate)
            n = counts.get(t, 0)
            refs[t] = ((old * n) + candidate) / (n + 1)
            counts[t] = n + 1
        self.size_weight_refs = {
            k: float(v.quantize(Decimal("0.001"), rounding=ROUND_HALF_UP)) for k, v in refs.items()
        }
        self.size_weight_counts = counts
        self.base_net_weight_14kt = self.size_weight_refs.get(
            str(self.BASE_RING_SIZE), self.base_net_weight_14kt)
        self.save(update_fields=[
            "size_weight_refs", "size_weight_counts", "base_net_weight_14kt"])

    def init_base_ref(self, weight):
        """Seed a single base reference for non-ring designs."""
        w = float(Decimal(str(weight)).quantize(Decimal("0.001"), rounding=ROUND_HALF_UP))
        self.size_weight_refs = {"base": w}
        self.size_weight_counts = {"base": 1}
        self.base_net_weight_14kt = w
        return self.size_weight_refs

    def record_actual_weight_base(self, weight):
        """Fold a real measured weight into the single base reference (running average)."""
        refs = {k: Decimal(str(v)) for k, v in (self.size_weight_refs or {}).items()}
        counts = {k: int(v) for k, v in (self.size_weight_counts or {}).items()}
        w = Decimal(str(weight))
        if "base" not in refs:
            # Seed with the blueprint base weight so the average includes it
            refs["base"] = Decimal(str(self.base_net_weight_14kt))
            counts["base"] = 1
        old = refs["base"]
        n = counts["base"]
        refs["base"] = ((old * n) + w) / (n + 1)
        counts["base"] = n + 1
        self.size_weight_refs = {"base": float(refs["base"].quantize(Decimal("0.001"), rounding=ROUND_HALF_UP))}
        self.size_weight_counts = counts
        self.base_net_weight_14kt = self.size_weight_refs["base"]
        self.save(update_fields=["size_weight_refs", "size_weight_counts", "base_net_weight_14kt"])

    def calculate_net_weight(self, karat, ring_size=None):
        base = (self.reference_weight_for_size(ring_size)
                if (ring_size and self.is_ring)
                else Decimal(str(self.base_net_weight_14kt)))
        if karat == "18Kt":
            base = base * Decimal("1.20")
        return base.quantize(Decimal("0.001"), rounding=ROUND_HALF_UP)


class Product(models.Model):
    """The physical, sellable piece (one serialized item)."""
    STATUS_CHOICES = [("in_stock", "In Stock"), ("sold", "Sold"),
                      ("sold_offline", "Sold Offline"), ("reserved", "Reserved")]
    KARAT_CHOICES = [("14Kt", "14Kt"), ("18Kt", "18Kt")]
    COLOR_CHOICES = [("Yellow", "Yellow"), ("Rose", "Rose"), ("White", "White")]

    item_code = models.CharField(max_length=100, unique=True)
    design = models.ForeignKey(Design, on_delete=models.PROTECT, related_name="products")
    karat = models.CharField(max_length=10, choices=KARAT_CHOICES)
    gold_color = models.CharField(max_length=10, choices=COLOR_CHOICES)

    RING_SIZE_CHOICES = [(s, s) for s in RING_SIZES]
    ring_size = models.CharField(max_length=10, blank=True, null=True, choices=RING_SIZE_CHOICES)
    
    diamond_grade = models.CharField(max_length=20, default="IJ/SI")
    price = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    actual_net_weight = models.DecimalField(max_digits=6, decimal_places=3)
    actual_diamond_weight = models.DecimalField(max_digits=5, decimal_places=2)
    actual_color_stone_weight = models.DecimalField(max_digits=5, decimal_places=2, default=0)

    report_lab = models.CharField(max_length=50, blank=True)
    report_number = models.CharField(max_length=100, blank=True)
    hallmark_number = models.CharField(max_length=6, blank=True) 

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="in_stock")
    sold_to_user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
                                     null=True, blank=True, related_name="purchased_items")
    sold_in_order = models.ForeignKey("orders.Order", on_delete=models.SET_NULL,
                                      null=True, blank=True, related_name="purchased_items")
    sold_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.item_code

    @property
    def gold_value(self):
        rc = RateCard.get()
        rate = rc.gold_rate_18kt if self.karat == "18Kt" else rc.gold_rate_14kt
        return Decimal(str(self.actual_net_weight)) * rate

    @property
    def diamond_value(self):
        return Decimal(str(self.actual_diamond_weight)) * RateCard.get().rate_for_grade(self.diamond_grade)

    @property
    def color_stone_value(self):
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


class ProductMedia(models.Model):
    KIND_CHOICES = [("image", "Image"), ("video", "Video")]
    design = models.ForeignKey(Design, on_delete=models.CASCADE, related_name="media")
    url = models.URLField(max_length=500)
    kind = models.CharField(max_length=10, choices=KIND_CHOICES, default="image")
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["sort_order"]

    def __str__(self):
        return f"{self.design_id}#{self.sort_order}"


class RateCard(models.Model):
    """Singleton global pricing rates."""
    DEFAULT_RATES = {"HI/SI": 60000, "IJ/SI": 45000, "JK/SI": 32000}

    gold_rate_14kt = models.DecimalField(max_digits=10, decimal_places=2)
    gold_rate_18kt = models.DecimalField(max_digits=10, decimal_places=2)
    diamond_rates = models.JSONField(default=dict, blank=True)   # {"HI/SI": 60000, ...}
    default_grade = models.CharField(max_length=20, default="IJ/SI")
    making_charges_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=15.00)
    gst_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=3.00)
    updated_at = models.DateTimeField(auto_now=True)
    last_auto_run_at = models.DateTimeField(null=True, blank=True)

    # Auto-fetch settings
    auto_fetch_enabled = models.BooleanField(default=False, help_text="Enable automatic gold rate updates")
    increment_percentage = models.DecimalField(
        max_digits=4, decimal_places=2, default=0.50,
        help_text="Percentage to add after rounding (e.g., 0.50 for 0.5%)"
    )
    change_threshold_type = models.CharField(
        max_length=20,
        choices=[('percentage', 'Percentage'), ('amount', 'Amount')],
        default='percentage',
        help_text="How to measure if rate changed enough to update"
    )
    change_threshold_percentage = models.DecimalField(
        max_digits=4, decimal_places=2, default=0.50,
        help_text="Minimum % change to trigger update (e.g., 0.50 for 0.5%)"
    )
    change_threshold_amount = models.DecimalField(
        max_digits=10, decimal_places=2, default=500,
        help_text="Minimum ₹ change to trigger update (when using amount threshold)"
    )

    auto_fetch_interval_minutes = models.PositiveIntegerField(
        default=30,
        help_text="How often to fetch (in minutes). Set to 1 for testing."
    )

    class Meta:
        verbose_name = "Rate Card"
        verbose_name_plural = "Rate Card"

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def get(cls):
        obj, _ = cls.objects.get_or_create(
            pk=1,
            defaults={
                "gold_rate_14kt": 7000,
                "gold_rate_18kt": 8400,
                "diamond_rates": cls.DEFAULT_RATES,
            },
        )
        if not obj.diamond_rates:
            obj.diamond_rates = dict(cls.DEFAULT_RATES)
            obj.save()
        return obj

    def grade_choices(self):
        """Only bands with a non-empty rate are usable."""
        return {k: v for k, v in (self.diamond_rates or {}).items() if v}

    def rate_for_grade(self, grade):
        rates = self.grade_choices()
        key = grade if grade in rates else self.default_grade
        return Decimal(str(rates.get(key, 0)))

    @property
    def diamond_rate_per_carat(self):  # backward-compat shortcut
        return self.rate_for_grade(self.default_grade)

    def __str__(self):
        return f"Rate Card (updated {self.updated_at:%Y-%m-%d})"

class GoldRateHistory(models.Model):
    """Log of all gold rate fetches (last 30 days retained)."""
    fetched_at = models.DateTimeField(auto_now_add=True)
    raw_24kt_rate = models.IntegerField(null=True, blank=True, help_text="₹ per 10g of 24Kt from API")
    calculated_rate = models.IntegerField(null=True, blank=True, help_text="After rounding formula")
    previous_rate = models.IntegerField(null=True, blank=True, help_text="What was in DB before")
    rate_applied = models.BooleanField(default=False, help_text="Did we update the rate card?")
    fetch_successful = models.BooleanField(default=True)
    error_message = models.TextField(blank=True)

    class Meta:
        ordering = ['-fetched_at']
        verbose_name_plural = 'gold rate histories'

    def __str__(self):
        status = 'applied' if self.rate_applied else 'skipped'
        return f"{self.fetched_at:%Y-%m-%d %H:%M} - {status}"


class Notification(models.Model):
    """System notifications shown in control panel."""
    MESSAGE_TYPES = [
        ('info', 'Info'),
        ('warning', 'Warning'),
        ('error', 'Error'),
        ('success', 'Success'),
    ]
    
    message = models.TextField()
    message_type = models.CharField(max_length=20, choices=MESSAGE_TYPES, default='info')
    created_at = models.DateTimeField(auto_now_add=True)
    read = models.BooleanField(default=False)
    link = models.CharField(max_length=200, blank=True, help_text="Optional link to related page")

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.get_message_type_display()}] {self.message[:50]}"