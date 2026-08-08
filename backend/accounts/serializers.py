from django.contrib.auth import get_user_model, password_validation
from django.db.models import Q
from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ["id", "first_name", "last_name", "email", "phone", "password"]

    def validate_password(self, value):
        password_validation.validate_password(value)
        return value

    def create(self, validated_data):
        validated_data["email"] = validated_data["email"].lower()
        return User.objects.create_user(**validated_data)


class UserSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "first_name", "last_name", "name", "email", "phone", "date_joined"]
        read_only_fields = ["email", "phone"]

    def get_name(self, obj):
        return obj.get_full_name() or obj.email


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