from rest_framework_simplejwt.authentication import JWTAuthentication

class CookieJWTAuthentication(JWTAuthentication):
    """
    Custom JWT authentication that reads access token from httpOnly cookie.
    Dynamically selects 'cpanel_access' for cPanel routes and 'access' for storefront.
    """
    
    def authenticate(self, request):
        # Determine which cookie to read based on the endpoint
        is_cpanel = request.path.startswith('/api/control/')
        cookie_name = "cpanel_access" if is_cpanel else "access"
        
        token = request.COOKIES.get(cookie_name)
        
        if token is None:
            # Fall back to Authorization header (for backwards compatibility)
            return super().authenticate(request)
        
        try:
            validated_token = self.get_validated_token(token)
            user = self.get_user(validated_token)
            return (user, validated_token)
        except Exception:
            return super().authenticate(request)