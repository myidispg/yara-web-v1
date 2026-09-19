from rest_framework_simplejwt.authentication import JWTAuthentication

class CookieJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        is_cpanel = request.path.startswith('/api/control/')
        cookie_name = "cpanel_access" if is_cpanel else "access"
        token = request.COOKIES.get(cookie_name)
        
        if not token:
            return None
            
        try:
            validated_token = self.get_validated_token(token)
            user = self.get_user(validated_token)
            if not user.is_active:
                return None
            return (user, validated_token)
        except Exception:
            return None