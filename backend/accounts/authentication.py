from rest_framework_simplejwt.authentication import JWTAuthentication

class CookieJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        is_cpanel = request.path.startswith('/api/control/')
        cookie_name = "cpanel_access" if is_cpanel else "access"
        token = request.COOKIES.get(cookie_name)
        
        if token is None: return super().authenticate(request)
        try:
            validated_token = self.get_validated_token(token)
            user = self.get_user(validated_token)
            return (user, validated_token)
        except Exception: return super().authenticate(request)