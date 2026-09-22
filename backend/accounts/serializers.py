from django.contrib.auth import get_user_model, password_validation
from django.db.models import Q
from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.validators import UniqueValidator
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    
    # Explicitly add UniqueValidator back since we are overriding the fields
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all(), message="An account with this email already exists.")]
    )
    phone = serializers.CharField(
        required=True, 
        max_length=10,
        validators=[UniqueValidator(queryset=User.objects.all(), message="An account with this phone number already exists.")]
    )

    class Meta:
        model = User
        fields = ["id", "first_name", "last_name", "email", "phone", "password"]

    def validate_password(self, value):
        password_validation.validate_password(value)
        return value

    def validate_email(self, value):
        # Lowercase the email before saving to prevent case-sensitivity issues
        return value.lower()

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)

# ... (Keep UserSerializer and LoginSerializer exactly as they are below this) ...

class UserSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    addresses = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ["id", "first_name", "last_name", "name", "email", "phone", 
                  "gender", "date_of_birth", "date_joined", "is_staff", "is_active", "addresses"]
        # Removed "phone" from read_only_fields so users can update it
        read_only_fields = ["email", "date_joined", "is_staff"]
        extra_kwargs = {
            'date_of_birth': {'required': False, 'allow_null': True},
            'phone': {'required': False, 'allow_null': True},
            'gender': {'required': False, 'allow_blank': True},
        }

    def validate_phone(self, value):
        import re
        if value:
            if not re.fullmatch(r"[6-9]\d{9}", value):
                raise serializers.ValidationError("Enter a valid 10-digit Indian mobile number.")
            # Check if phone is already taken by another user
            if User.objects.filter(phone=value).exclude(id=self.instance.id).exists():
                raise serializers.ValidationError("This phone number is already in use.")
        return value

    def get_name(self, obj):
        return obj.get_full_name() or obj.email
    
    def get_addresses(self, obj):
        from orders.serializers import AddressSerializer
        addresses = obj.addresses.all().order_by('-is_default', '-id')
        return AddressSerializer(addresses, many=True).data

    def update(self, instance, validated_data):
        new_phone = validated_data.get('phone')
        # If they change their phone number, mark it as unverified until they do SMS OTP
        if new_phone and new_phone != instance.phone:
            instance.is_phone_verified = False
            
        return super().update(instance, validated_data)

class LoginSerializer(TokenObtainPairSerializer):
    """Accepts {"login": "<email or phone>", "password": "..."} and issues JWTs."""
    username_field = "login"

    def validate(self, attrs):
        identifier = str(attrs.get("login") or "").strip()
        password = attrs.get("password") or ""
        user = User.objects.filter(Q(email__iexact=identifier) | Q(phone=identifier)).first()
        if not user or not user.check_password(password):
            raise AuthenticationFailed("Incorrect email/phone or password.")
        if not user.is_active:
            raise AuthenticationFailed("This account is disabled.")
        refresh = self.get_token(user)
        return {"refresh": str(refresh), "access": str(refresh.access_token)}