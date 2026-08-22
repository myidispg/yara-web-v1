from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.contrib.auth import get_user_model

from catalog.models import Design, Product, RateCard, Category
from orders.models import Order
from .models import AuditLog

User = get_user_model()

TRACKED_MODELS = [Design, Product, RateCard, Category, Order]


def get_request_user():
    """Try to get current user from thread-local storage."""
    try:
        from threading import current_thread
        thread = current_thread()
        return getattr(thread, '_audit_user', None)
    except:
        return None


def get_request_ip():
    """Try to get current IP from thread-local storage."""
    try:
        from threading import current_thread
        thread = current_thread()
        return getattr(thread, '_audit_ip', None)
    except:
        return None


@receiver(post_save)
def log_save(sender, instance, created, **kwargs):
    """Log create/update events for tracked models."""
    if sender not in TRACKED_MODELS:
        return
    
    user = get_request_user()
    ip = get_request_ip()
    action = 'created' if created else 'updated'
    
    AuditLog.objects.create(
        user=user,
        action=action,
        model_name=sender.__name__,
        object_id=str(instance.pk),
        object_repr=str(instance)[:255],
        ip_address=ip,
    )


@receiver(post_delete)
def log_delete(sender, instance, **kwargs):
    """Log delete events for tracked models."""
    if sender not in TRACKED_MODELS:
        return
    
    user = get_request_user()
    ip = get_request_ip()
    
    AuditLog.objects.create(
        user=user,
        action='deleted',
        model_name=sender.__name__,
        object_id=str(instance.pk),
        object_repr=str(instance)[:255],
        ip_address=ip,
    )