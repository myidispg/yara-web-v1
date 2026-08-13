import re
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.core.exceptions import ValidationError
from django.db import models

def validate_indian_phone(value):
    if not re.fullmatch(r"[6-9]\d{9}", value or ""):
        raise ValidationError("Enter a valid 10-digit Indian mobile number.")

class CustomUserManager(BaseUserManager):
    """
    Custom manager for User model where email is the unique identifier.
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

class User(AbstractUser):
    # Remove the default username field
    username = None
    
    # Mandatory fields
    email = models.EmailField("email address", unique=True)
    phone = models.CharField(max_length=10, unique=True, validators=[validate_indian_phone])
    first_name = models.CharField(max_length=150) # Removed blank=True to make it mandatory
    last_name = models.CharField(max_length=150)  # Removed blank=True to make it mandatory

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["phone", "first_name", "last_name"]

    objects = CustomUserManager() 

    def __str__(self):
        return self.get_full_name() or self.email