import threading
from django.db import transaction
from .models import Product, RateCard
from control.models import AuditLog


def recalculate_all_prices(rate_card=None, user=None, reason="rate_card_update"):
    """
    Recalculate prices for all in-stock products that aren't locked into orders.
    Returns count of updated products.
    """
    rc = rate_card or RateCard.get()
    
    # Only update: in_stock AND not locked into an order
    products = Product.objects.filter(
        status='in_stock',
        sold_in_order__isnull=True
    ).select_related('design')
    
    updated = []
    for p in products:
        old_price = p.price
        new_price = Product.calculate_price(
            net_weight=p.actual_net_weight,
            diamond_weight=p.actual_diamond_weight,
            karat=p.karat,
            diamond_grade=p.diamond_grade,
            rate_card=rc,
        )
        if new_price != old_price:
            p.price = new_price
            updated.append(p)
    
    if updated:
        with transaction.atomic():
            Product.objects.bulk_update(updated, ['price'])
        
        # Single audit log entry
        AuditLog.objects.create(
            user=user,
            action='updated',
            model_name='Product',
            object_id='bulk',
            object_repr=f"Bulk price recalculation ({reason}): {len(updated)} products",
        )
    
    return len(updated)


def recalculate_prices_async(rate_card=None, user=None, reason="rate_card_update"):
    """Spawn a daemon thread to recalculate prices in the background."""
    def _worker():
        try:
            count = recalculate_all_prices(rate_card, user, reason)
            print(f"[price-recalc] Completed: {count} products updated")
        except Exception as e:
            print(f"[price-recalc] Failed: {e}")
    
    thread = threading.Thread(target=_worker, daemon=True)
    thread.start()
    return thread