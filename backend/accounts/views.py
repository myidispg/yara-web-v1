from rest_framework.generics import CreateAPIView, RetrieveUpdateAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.throttling import AnonRateThrottle
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from django.conf import settings

from .serializers import RegisterSerializer, UserSerializer

class RegisterView(CreateAPIView):
    serializer_class = RegisterSerializer
    throttle_classes = [AnonRateThrottle]

class MeView(RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    def get_object(self): return self.request.user

class CookieTokenObtainPairView(TokenObtainPairView):
    """Staff Login: Sets cpanel_access and cpanel_refresh cookies"""
    def finalize_response(self, request, response, *args, **kwargs):
        if response.status_code == 200 and "access" in response.data:
            response.set_cookie("cpanel_access", response.data["access"], max_age=int(settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"].total_seconds()), httponly=True, secure=not settings.DEBUG, samesite="Lax", path="/")
            del response.data["access"]
            if "refresh" in response.data:
                response.set_cookie("cpanel_refresh", response.data["refresh"], max_age=int(settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds()), httponly=True, secure=not settings.DEBUG, samesite="Lax", path="/")
                del response.data["refresh"]
        return super().finalize_response(request, response, *args, **kwargs)

class CookieTokenRefreshView(APIView):
    """Storefront Refresh"""
    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get("refresh")
        if not refresh_token: return Response({"detail": "Refresh token not provided"}, status=status.HTTP_401_UNAUTHORIZED)
        try:
            refresh = RefreshToken(refresh_token)
            # Block refresh for deactivated users
            user_id = refresh.payload.get('user_id')
            from accounts.models import User
            user = User.objects.filter(id=user_id, is_active=True).first()
            if not user:
                return Response({"detail": "Account deactivated"}, status=status.HTTP_401_UNAUTHORIZED)
            
            response = Response({"detail": "Token refreshed"}, status=status.HTTP_200_OK)
            response.set_cookie("access", str(refresh.access_token), max_age=int(settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"].total_seconds()), httponly=True, secure=not settings.DEBUG, samesite="Lax", path="/")
            if settings.SIMPLE_JWT.get("ROTATE_REFRESH_TOKENS", False):
                refresh.set_jti(); refresh.set_exp()
                response.set_cookie("refresh", str(refresh), max_age=int(settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds()), httponly=True, secure=not settings.DEBUG, samesite="Lax", path="/")
            return response
        except TokenError: return Response({"detail": "Invalid token"}, status=status.HTTP_401_UNAUTHORIZED)

class CPanelCookieTokenRefreshView(APIView):
    """Staff Refresh"""
    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get("cpanel_refresh")
        if not refresh_token: return Response({"detail": "Refresh token not provided"}, status=status.HTTP_401_UNAUTHORIZED)
        try:
            refresh = RefreshToken(refresh_token)
            # Block refresh for deactivated users
            user_id = refresh.payload.get('user_id')
            from accounts.models import User
            user = User.objects.filter(id=user_id, is_active=True).first()
            if not user:
                return Response({"detail": "Account deactivated"}, status=status.HTTP_401_UNAUTHORIZED)
            
            response = Response({"detail": "Token refreshed"}, status=status.HTTP_200_OK)
            response.set_cookie("cpanel_access", str(refresh.access_token), max_age=int(settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"].total_seconds()), httponly=True, secure=not settings.DEBUG, samesite="Lax", path="/")
            if settings.SIMPLE_JWT.get("ROTATE_REFRESH_TOKENS", False):
                refresh.set_jti(); refresh.set_exp()
                response.set_cookie("cpanel_refresh", str(refresh), max_age=int(settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds()), httponly=True, secure=not settings.DEBUG, samesite="Lax", path="/")
            return response
        except TokenError: return Response({"detail": "Invalid token"}, status=status.HTTP_401_UNAUTHORIZED)

class LogoutView(APIView):
    """Storefront Logout"""
    def post(self, request, *args, **kwargs):
        response = Response({"detail": "Logged out"}, status=status.HTTP_200_OK)
        response.delete_cookie("access", path="/"); response.delete_cookie("refresh", path="/")
        return response

class CPanelLogoutView(APIView):
    """Staff Logout"""
    def post(self, request, *args, **kwargs):
        response = Response({"detail": "Logged out"}, status=status.HTTP_200_OK)
        response.delete_cookie("cpanel_access", path="/"); response.delete_cookie("cpanel_refresh", path="/")
        return response