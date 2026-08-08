from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend
from django.db.models import Q


class EmailOrPhoneBackend(ModelBackend):
    """Allows Django/admin session auth with either email or phone."""

    def authenticate(self, request, username=None, password=None, **kwargs):
        UserModel = get_user_model()
        identifier = username or kwargs.get(UserModel.USERNAME_FIELD)
        if not identifier or not password:
            return None
        user = UserModel.objects.filter(Q(email__iexact=identifier) | Q(phone=identifier)).first()
        if user and user.check_password(password) and self.user_can_authenticate(user):
            return user
        return None