import re

from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
from django.db import models

from django.contrib.auth.models import BaseUserManager

class CustomUserManager(BaseUserManager):
    """
    Custom manager for User model where email is the unique identifier
    instead of username.
    """
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)


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

    objects = CustomUserManager() 

    def __str__(self):
        return self.get_full_name() or self.email