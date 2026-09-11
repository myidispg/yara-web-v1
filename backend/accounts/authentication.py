from rest_framework_simplejwt.authentication import JWTAuthentication
from django.conf import settings


class CookieJWTAuthentication(JWTAuthentication):
    """
    Custom JWT authentication that reads access token from httpOnly cookie
    instead of Authorization header.
    """
    
    def authenticate(self, request):
        # Try to get token from cookie first
        token = request.COOKIES.get("access")
        
        if token is None:
            # Fall back to Authorization header (for backwards compatibility)
            return super().authenticate(request)
        
        try:
            # Validate the token
            validated_token = self.get_validated_token(token)
            user = self.get_user(validated_token)
            return (user, validated_token)
        except Exception:
            # Token invalid, fall back to header auth
            return super().authenticate(request)