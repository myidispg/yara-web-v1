import secrets

from django.conf import settings
from django.core.validators import RegexValidator
from django.db import models
from django.utils import timezone

from accounts.models import validate_indian_phone
from catalog.models import Product


class Address(models.Model):
    LABELS = [("home", "Home"), ("office", "Office"), ("other", "Other")]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="addresses", on_delete=models.CASCADE)
    label = models.CharField(max_length=10, choices=LABELS, default="home")
    full_name = models.CharField(max_length=120)
    phone = models.CharField(max_length=10, validators=[validate_indian_phone])
    line1 = models.CharField(max_length=255)
    line2 = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=80)
    state = models.CharField(max_length=80)
    pincode = models.CharField(max_length=6, validators=[RegexValidator(r"^\d{6}$", "Enter a 6-digit PIN code.")])
    is_default = models.BooleanField(default=False)

    class Meta:
        verbose_name_plural = "addresses"

    def __str__(self):
        return f"{self.get_label_display()} · {self.city}"


class Order(models.Model):
    STATUS = [("placed", "Placed"), ("confirmed", "Confirmed"), ("shipped", "Shipped"),
              ("delivered", "Delivered"), ("cancelled", "Cancelled")]
    PAYMENT = [("upi", "UPI"), ("card", "Card"), ("netbanking", "Net Banking"),
               ("emi", "EMI"), ("cod", "Cash on Delivery")]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="orders", on_delete=models.PROTECT)
    order_number = models.CharField(max_length=20, unique=True, blank=True)
    status = models.CharField(max_length=12, choices=STATUS, default="placed")
    payment_method = models.CharField(max_length=12, choices=PAYMENT, default="upi")
    transaction_id = models.CharField(max_length=64, blank=True)  # Add this line
    address = models.ForeignKey(Address, null=True, blank=True, related_name="+", on_delete=models.SET_NULL)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    shipping_fee = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    # Timeline timestamps
    placed_at = models.DateTimeField(auto_now_add=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)
    shipped_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.order_number or "draft"

    def save(self, *args, **kwargs):
        if not self.order_number:
            self.order_number = f"VR-{timezone.now():%y%m%d}-{secrets.token_hex(2).upper()}"
        if not self.transaction_id:
            self.transaction_id = f"TXN-{secrets.token_hex(12).upper()}"
        super().save(*args, **kwargs)

    def get_timeline(self):
        """Return a list of {status, timestamp} for the order's progression."""
        timeline = [{"status": "placed", "timestamp": self.placed_at}]
        if self.confirmed_at:
            timeline.append({"status": "confirmed", "timestamp": self.confirmed_at})
        if self.shipped_at:
            timeline.append({"status": "shipped", "timestamp": self.shipped_at})
        if self.delivered_at:
            timeline.append({"status": "delivered", "timestamp": self.delivered_at})
        if self.cancelled_at:
            timeline.append({"status": "cancelled", "timestamp": self.cancelled_at})
        return timeline


class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name="items", on_delete=models.CASCADE)
    instance = models.OneToOneField(Product, on_delete=models.PROTECT, related_name="order_item")
    product_name = models.CharField(max_length=220)
    variant_label = models.CharField(max_length=120, blank=True)
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    line_total = models.DecimalField(max_digits=12, decimal_places=2)

    def __str__(self):
        return f"{self.quantity} × {self.product_name}"