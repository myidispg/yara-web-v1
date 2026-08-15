from rest_framework.permissions import BasePermission

class IsStaff(BasePermission):
    """Only allows staff users to access the view."""
    def has_permission(self, request, view):
        return request.user and request.user.is_staff

class IsStaffOrReadOnly(BasePermission):
    """Staff can write, others can only read."""
    def has_permission(self, request, view):
        if request.method in ('GET', 'HEAD', 'OPTIONS'):
            return True
        return request.user and request.user.is_staff