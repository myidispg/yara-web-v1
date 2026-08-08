import re

from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
from django.db import models


def validate_indian_phone(value):
    if not re.fullmatch(r"[6-9]\d{9}", value or ""):
        raise ValidationError("Enter a valid 10-digit Indian mobile number.")


class User(AbstractUser):
    """Login is possible with email OR phone; phone is mandatory."""

    username = None
    email = models.EmailField("email address", unique=True)
    phone = models.CharField(max_length=10, unique=True, validators=[validate_indian_phone])

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["phone"]

    def __str__(self):
        return self.get_full_name() or self.email