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

urlpatterns = [
    path("register/", RegisterView.as_view(), name="auth-register"),
    path("login/", CookieTokenObtainPairView.as_view(
        serializer_class=LoginSerializer, 
        throttle_classes=[AnonRateThrottle]
    ), name="auth-login"),
    path("refresh/", CookieTokenRefreshView.as_view(), name="auth-refresh"),
    path("logout/", LogoutView.as_view(), name="auth-logout"),
    path("me/", MeView.as_view(), name="auth-me"),
]