from rest_framework_simplejwt.authentication import JWTAuthentication

class CookieJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        is_cpanel = request.path.startswith('/api/control/')
        is_auth_me = request.path.startswith('/api/auth/me/')
        
        if is_cpanel:
            cookies_to_check = ["cpanel_access"]
        elif is_auth_me:
            cookies_to_check = ["cpanel_access", "access"]
        else:
            cookies_to_check = ["access"]
            
        for cookie_name in cookies_to_check:
            token = request.COOKIES.get(cookie_name)
            if token:
                try:
                    validated_token = self.get_validated_token(token)
                    user = self.get_user(validated_token)
                    # CRITICAL: Block deactivated users
                    if not user.is_active:
                        return None
                    return (user, validated_token)
                except Exception:
                    continue
                    
        return super().authenticate(request)