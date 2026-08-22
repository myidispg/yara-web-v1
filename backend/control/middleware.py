from threading import current_thread


class AuditMiddleware:
    """Store request user and IP in thread-local for audit signals."""
    
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        thread = current_thread()
        thread._audit_user = request.user if request.user.is_authenticated else None
        thread._audit_ip = self.get_client_ip(request)
        
        response = self.get_response(request)
        
        # Cleanup
        if hasattr(thread, '_audit_user'):
            del thread._audit_user
        if hasattr(thread, '_audit_ip'):
            del thread._audit_ip
        
        return response

    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR')