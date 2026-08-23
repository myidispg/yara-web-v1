import math
import time
from datetime import datetime, timedelta
from decimal import Decimal

import requests
from django.core.management.base import BaseCommand
from django.utils import timezone

from catalog.models import GoldRateHistory, Notification, RateCard


class Command(BaseCommand):
    help = "Fetch live gold rates and update if threshold exceeded"

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force fetch even outside time window or if auto-fetch disabled',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Fetch and calculate but do not update rates',
        )

    def handle(self, *args, **options):
        rc = RateCard.get()
        force = options['force']
        dry_run = options['dry_run']

        # Check if auto-fetch is enabled (unless forced)
        if not rc.auto_fetch_enabled and not force:
            self.stdout.write(self.style.WARNING('Auto-fetch is disabled. Use --force to override.'))
            return

        # Check time window (6 AM - 11 PM IST) unless forced
        now = timezone.localtime()
        if not force and not (6 <= now.hour < 23):
            self.stdout.write(self.style.WARNING(
                f'Outside time window (6 AM - 11 PM IST). Current time: {now.strftime("%H:%M")}'
            ))
            return

        # Fetch with retry logic
        raw_rate, error_msg = self._fetch_with_retry()
        
        if raw_rate is None:
            # All retries failed
            GoldRateHistory.objects.create(
                fetch_successful=False,
                rate_applied=False,
                error_message=error_msg
            )
            Notification.objects.create(
                message=f"Gold rate fetch failed after 5 retries: {error_msg}",
                message_type='error'
            )
            self.stderr.write(self.style.ERROR(f'Fetch failed: {error_msg}'))
            return

        # Apply calculation formula
        calculated = self._apply_formula(raw_rate, float(rc.increment_percentage))
        
        # Derive current 24Kt rate from 18Kt (reverse calculation)
        # 18Kt per gram = (24Kt per 10g / 10) * (18/24)
        # So 24Kt per 10g = 18Kt per gram * 10 * (24/18)
        current_24kt = int(float(rc.gold_rate_18kt) * 10 * (24/18))

        # Check threshold
        should_update = self._check_threshold(
            calculated, 
            current_24kt,
            rc.change_threshold_type,
            float(rc.change_threshold_percentage),
            float(rc.change_threshold_amount)
        )

        # Update rates if threshold exceeded
                # Update rates if threshold exceeded
        if should_update and not dry_run:
            # Calculate and round to integers (perfect round numbers, no decimals)
            new_18kt = round(calculated * 18 / 24 / 10)
            new_14kt = round(calculated * 14 / 24 / 10)
            
            rc.gold_rate_18kt = Decimal(str(new_18kt))
            rc.gold_rate_14kt = Decimal(str(new_14kt))
            rc.save()
            
            self.stdout.write(self.style.SUCCESS(
                f'Rates updated: 14Kt=₹{new_14kt}/g, 18Kt=₹{new_18kt}/g'
            ))
            
            # Async recalculate all product prices
            from catalog.utils import recalculate_prices_async
            recalculate_prices_async(rate_card=rc, user=None, reason="auto_fetch_gold_rate")
            self.stdout.write(self.style.SUCCESS('Price recalculation started in background'))
        else:
            self.stdout.write(self.style.WARNING(
                f'No update needed. Calculated: {calculated}, Current: {current_24kt}'
            ))

        # Log to history
        GoldRateHistory.objects.create(
            raw_24kt_rate=raw_rate,
            calculated_rate=calculated,
            previous_rate=current_24kt,
            rate_applied=should_update and not dry_run,
            fetch_successful=True
        )

        # Cleanup old history (>30 days)
        cutoff = timezone.now() - timedelta(days=30)
        deleted, _ = GoldRateHistory.objects.filter(fetched_at__lt=cutoff).delete()
        if deleted:
            self.stdout.write(f'Cleaned up {deleted} old history entries')

    def _fetch_with_retry(self):
        """Fetch gold rate with retry logic (max 5 attempts, 30s intervals)."""
        timestamp = int(time.time() * 1000)
        url = f"http://bcast.jmdpatil.com:7767/VOTSBroadcastStreaming/Services/xml/GetLiveRateByTemplateID/jmd?_={timestamp}"
        
        for attempt in range(5):
            try:
                response = requests.get(url, timeout=10)
                response.raise_for_status()
                
                # Parse tab-separated response
                lines = response.text.strip().split('\n')
                for line in lines:
                    if line.strip().startswith('5404'):  # 99.50 GOLD (RTGS)
                        parts = line.split('\t')
                        if len(parts) >= 5:
                            # Column 4 (index 4) is the "Ask" price
                            rate = int(float(parts[4]))
                            return rate, None
                
                return None, "Row 5404 not found in response"
                
            except requests.RequestException as e:
                if attempt < 4:
                    self.stdout.write(self.style.WARNING(
                        f'Attempt {attempt + 1} failed: {e}. Retrying in 30s...'
                    ))
                    time.sleep(30)
                else:
                    return None, str(e)
        
        return None, "Unknown error"

    def _apply_formula(self, raw_rate, increment_pct):
        """Apply the rounding formula."""
        # Step 1: Round up to nearest 100
        step1 = math.ceil(raw_rate / 100) * 100
        
        # Step 2: Add increment percentage
        step2 = step1 * (1 + increment_pct / 100)
        
        # Step 3: Round up to nearest 100 again
        final = math.ceil(step2 / 100) * 100
        
        return int(final)

    def _check_threshold(self, calculated, current, threshold_type, threshold_pct, threshold_amt):
        """Check if change exceeds threshold."""
        if threshold_type == 'percentage':
            if current == 0:
                return True  # Always update if no current rate
            diff_pct = abs(calculated - current) / current * 100
            return diff_pct >= threshold_pct
        else:  # amount
            diff_amt = abs(calculated - current)
            return diff_amt >= threshold_amt    