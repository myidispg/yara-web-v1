from django.urls import path
from rest_framework.throttling import AnonRateThrottle

from .serializers import LoginSerializer
from .views import (
    MeView, 
    RegisterView, 
    CookieTokenObtainPairView,
    CookieTokenRefreshView,
    LogoutView
)
from .auth_views import SendOTPView, VerifyOTPView, GoogleAuthView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="auth-register"),
    path("login/", CookieTokenObtainPairView.as_view(
        serializer_class=LoginSerializer, 
        throttle_classes=[AnonRateThrottle]
    ), name="auth-login"),
    path("refresh/", CookieTokenRefreshView.as_view(), name="auth-refresh"),
    path("logout/", LogoutView.as_view(), name="auth-logout"),
    path("me/", MeView.as_view(), name="auth-me"),
    path("send-otp/", SendOTPView.as_view(), name="auth-send-otp"),
    path("verify-otp/", VerifyOTPView.as_view(), name="auth-verify-otp"),
    path("google/", GoogleAuthView.as_view(), name="auth-google"),
]