from rest_framework_simplejwt.authentication import JWTAuthentication

class CookieJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        is_cpanel = request.path.startswith('/api/control/')
        is_auth_me = request.path.startswith('/api/auth/me/')
        
        # Determine which cookies to check based on the endpoint
        if is_cpanel:
            cookies_to_check = ["cpanel_access"]
        elif is_auth_me:
            # For the /me/ endpoint, try cpanel first (if user is on cpanel), then storefront
            cookies_to_check = ["cpanel_access", "access"]
        else:
            cookies_to_check = ["access"]
            
        for cookie_name in cookies_to_check:
            token = request.COOKIES.get(cookie_name)
            if token:
                try:
                    validated_token = self.get_validated_token(token)
                    user = self.get_user(validated_token)
                    return (user, validated_token)
                except Exception:
                    continue # Try next cookie or fall back
                    
        return super().authenticate(request)