import re
import random
import string
from datetime import timedelta

from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone

def validate_indian_phone(value):
    if value and not re.fullmatch(r"[6-9]\d{9}", value):
        raise ValidationError("Enter a valid 10-digit Indian mobile number.")

class CustomUserManager(BaseUserManager):
    def create_user(self, email=None, password=None, **extra_fields):
        """
        Create and save a regular user. 
        Email is no longer strictly required here (serializers enforce at least one identifier).
        """
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        else:
            # Passwordless users get an unusable password hash
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email=None, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        if not email:
            raise ValueError("Superuser must have an email address.")
        return self.create_user(email=email, password=password, **extra_fields)

class User(AbstractUser):
    username = None
    
    # --- IDENTIFIERS ---
    # At least one must be present (enforced by API serializers)
    email = models.EmailField("email address", unique=True, null=True, blank=True)
    phone = models.CharField(max_length=10, unique=True, null=True, blank=True, validators=[validate_indian_phone])
    google_id = models.CharField(max_length=100, unique=True, null=True, blank=True, help_text="Google OAuth Subject ID")
    
    # --- VERIFICATION FLAGS ---
    is_email_verified = models.BooleanField(default=False)
    is_phone_verified = models.BooleanField(default=False)
    
    # --- PROFILE INFO ---
    is_staff = models.BooleanField(default=False)
    gender = models.CharField(max_length=20, blank=True, choices=[
        ('male', 'Male'), ('female', 'Female'), ('other', 'Other'), ('prefer_not_to_say', 'Prefer not to say')
    ])
    date_of_birth = models.DateField(null=True, blank=True)

    # We keep 'email' as USERNAME_FIELD to avoid Django migration hell with existing data, 
    # but we allow it to be null. Our custom authentication backend handles the actual login logic.
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = [] # Handled entirely by our API serializers

    objects = CustomUserManager()

    def __str__(self):
        return self.get_full_name() or self.email or self.phone or f"User {self.id}"


class OTP(models.Model):
    """Stores temporary OTP codes for email and phone verification."""
    TARGET_CHOICES = [('email', 'Email'), ('phone', 'Phone')]
    
    target_type = models.CharField(max_length=10, choices=TARGET_CHOICES)
    target_value = models.CharField(max_length=100, help_text="The email address or phone number")
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    attempts = models.IntegerField(default=0)
    is_verified = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['target_type', 'target_value', '-created_at']),
        ]

    def __str__(self):
        return f"OTP for {self.target_type}:{self.target_value}"

    def save(self, *args, **kwargs):
        # Auto-generate 6-digit code and 5-minute expiry if not provided
        if not self.code:
            self.code = ''.join(random.choices(string.digits, k=6))
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(minutes=5)
        super().save(*args, **kwargs)

    @property
    def is_valid(self):
        """Check if OTP is still valid (not expired, not used, and under attempt limit)."""
        return not self.is_verified and self.expires_at > timezone.now() and self.attempts < 5