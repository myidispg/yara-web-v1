import threading
import time
import traceback
from datetime import timedelta
from io import StringIO

from django.core.management import call_command
from django.db import connections, transaction
from django.utils import timezone


def _seconds_until_next_run():
    """How many seconds until the next scheduled run."""
    from catalog.models import RateCard
    try:
        rc = RateCard.get()
        if not rc.last_auto_run_at:
            return 5  # first run in 5 seconds
        interval = rc.auto_fetch_interval_minutes
        next_run = rc.last_auto_run_at + timedelta(minutes=interval)
        delta = (next_run - timezone.now()).total_seconds()
        return max(delta, 1)
    except Exception:
        return 60


def _try_run():
    """Attempt a single fetch cycle. Returns True if fetch actually executed."""
    from catalog.models import RateCard

    with transaction.atomic():
        rc = RateCard.objects.select_for_update().get(pk=1)

        if not rc.auto_fetch_enabled:
            print("[gold-scheduler] skip: auto-fetch disabled")
            return False

        now = timezone.localtime()
        if not (6 <= now.hour < 23):
            print(f"[gold-scheduler] skip: outside 6AM-11PM IST (hour={now.hour})")
            return False

    # Outside the lock: do the actual fetch
    print(f"[gold-scheduler] ▶ fetching at {timezone.localtime():%Y-%m-%d %H:%M:%S} IST")
    out = StringIO()
    try:
        call_command("fetch_gold_rates", stdout=out)
        print(f"[gold-scheduler] ✓ {out.getvalue().strip() or 'ok'}")
    except Exception as e:
        print(f"[gold-scheduler] ✗ error: {e}")
        traceback.print_exc()

    # Stamp the run regardless of outcome so we don't spam retries
    with transaction.atomic():
        rc = RateCard.objects.select_for_update().get(pk=1)
        rc.last_auto_run_at = timezone.now()
        rc.save(update_fields=["last_auto_run_at"])
    return True


def _loop():
    print("[gold-scheduler] loop started")
    while True:
        try:
            secs = _seconds_until_next_run()
            print(f"[gold-scheduler] sleeping {int(secs)}s")
            time.sleep(secs)
            _try_run()
        except Exception as e:
            print(f"[gold-scheduler] loop error: {e}")
            traceback.print_exc()
            time.sleep(30)
        finally:
            try:
                connections.close_all()
            except Exception:
                pass


def start_gold_rate_scheduler():
    if getattr(start_gold_rate_scheduler, "_started", False):
        return
    start_gold_rate_scheduler._started = True
    threading.Thread(target=_loop, name="gold-rate-scheduler", daemon=True).start()