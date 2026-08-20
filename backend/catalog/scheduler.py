import threading
import time
from datetime import timedelta
from io import StringIO

from django.core.management import call_command
from django.db import connections, transaction
from django.utils import timezone


def _seconds_to_next_slot():
    """Seconds until the next :00 or :30 boundary (+1s buffer)."""
    now = timezone.localtime()
    target = now.replace(minute=0 if now.minute < 30 else 30, second=0, microsecond=0)
    if target <= now:
        target += timedelta(minutes=30)
    return (target - now).total_seconds() + 1


def _run_if_due():
    from catalog.models import RateCard

    # DB-level single-flight lock: only ONE process per 29 minutes may run
    with transaction.atomic():
        rc = RateCard.objects.select_for_update().get(pk=1)
        if not rc.auto_fetch_enabled:
            return
        now = timezone.localtime()
        if not (6 <= now.hour < 23):  # market window: 6 AM – 11 PM IST
            return
        if rc.last_auto_run_at and (timezone.now() - rc.last_auto_run_at) < timedelta(minutes=29):
            return
        rc.last_auto_run_at = timezone.now()
        rc.save(update_fields=["last_auto_run_at"])

    out = StringIO()
    call_command("fetch_gold_rates", stdout=out)


def _loop():
    while True:
        try:
            time.sleep(_seconds_to_next_slot())
            _run_if_due()
        except Exception:
            pass  # scheduler thread must never die
        finally:
            connections.close_all()


def start_gold_rate_scheduler():
    if getattr(start_gold_rate_scheduler, "_started", False):
        return
    start_gold_rate_scheduler._started = True
    threading.Thread(target=_loop, name="gold-rate-scheduler", daemon=True).start()