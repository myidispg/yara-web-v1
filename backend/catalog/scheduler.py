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
            print("[gold-scheduler] skipped: auto-fetch disabled")
            return
        now = timezone.localtime()
        if not (6 <= now.hour < 23):  # market window: 6 AM – 11 PM IST
            print("[gold-scheduler] skipped: outside 6AM-11PM IST")
            return
        if rc.last_auto_run_at and (timezone.now() - rc.last_auto_run_at) < timedelta(minutes=29):
            print("[gold-scheduler] skipped: another process ran recently")
            return
        rc.last_auto_run_at = timezone.now()
        rc.save(update_fields=["last_auto_run_at"])

    print(f"[gold-scheduler] fetching at {timezone.localtime():%Y-%m-%d %H:%M:%S} IST")
    out = StringIO()
    call_command("fetch_gold_rates", stdout=out)
    print(f"[gold-scheduler] result: {out.getvalue().strip()}")


def _loop():
    while True:
        try:
            secs = _seconds_to_next_slot()
            print(f"[gold-scheduler] sleeping {int(secs // 60)}m to next :00/:30 slot")
            time.sleep(secs)
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