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

    def get_object(self):
        return self.request.user


class CookieTokenObtainPairView(TokenObtainPairView):
    """Login view that sets httpOnly cookies instead of returning tokens"""
    
    def finalize_response(self, request, response, *args, **kwargs):
        if response.status_code == 200 and "access" in response.data:
            # Set access token cookie
            response.set_cookie(
                "access",
                response.data["access"],
                max_age=int(settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"].total_seconds()),
                httponly=True,
                secure=not settings.DEBUG,
                samesite="Lax",
                path="/",
            )
            del response.data["access"]
            
            # Set refresh token cookie
            if "refresh" in response.data:
                response.set_cookie(
                    "refresh",
                    response.data["refresh"],
                    max_age=int(settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds()),
                    httponly=True,
                    secure=not settings.DEBUG,
                    samesite="Lax",
                    path="/",
                )
                del response.data["refresh"]
        
        return super().finalize_response(request, response, *args, **kwargs)


class CookieTokenRefreshView(APIView):
    """Refresh view that reads refresh token from cookie"""
    
    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get("refresh")
        if not refresh_token:
            return Response(
                {"detail": "Refresh token not provided"}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        try:
            refresh = RefreshToken(refresh_token)
            
            response = Response({"detail": "Token refreshed"}, status=status.HTTP_200_OK)
            
            # Set new access token
            response.set_cookie(
                "access",
                str(refresh.access_token),
                max_age=int(settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"].total_seconds()),
                httponly=True,
                secure=not settings.DEBUG,
                samesite="Lax",
                path="/",
            )
            
            # Optionally rotate refresh token
            if settings.SIMPLE_JWT.get("ROTATE_REFRESH_TOKENS", False):
                refresh.set_jti()
                refresh.set_exp()
                response.set_cookie(
                    "refresh",
                    str(refresh),
                    max_age=int(settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds()),
                    httponly=True,
                    secure=not settings.DEBUG,
                    samesite="Lax",
                    path="/",
                )
            
            return response
            
        except TokenError:
            return Response(
                {"detail": "Invalid token"}, 
                status=status.HTTP_401_UNAUTHORIZED
            )


class LogoutView(APIView):
    """Clear auth cookies"""
    
    def post(self, request, *args, **kwargs):
        response = Response({"detail": "Logged out"}, status=status.HTTP_200_OK)
        response.delete_cookie("access", path="/")
        response.delete_cookie("refresh", path="/")
        return response