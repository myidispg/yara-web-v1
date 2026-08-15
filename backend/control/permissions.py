from rest_framework import permissions


class IsAdmin(permissions.BasePermission):
    """Strict gate: authenticated staff/superusers only."""
    message = "Admin privileges required."

    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and (user.is_staff or user.is_superuser))