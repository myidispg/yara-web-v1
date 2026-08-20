from django.apps import AppConfig


class CatalogConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "catalog"

    def ready(self):
        import os
        if os.environ.get('RUN_MAIN') == 'true' or 'runserver' not in __import__('sys').argv:
            from .scheduler import start_gold_rate_scheduler
            start_gold_rate_scheduler()
            print("[gold-scheduler] ✓ thread started")