"""
Wipe all data from the database.
Usage: python manage.py wipe_all --confirm
"""
from django.core.management.base import BaseCommand
from django.db import connection


class Command(BaseCommand):
    help = 'Delete all designs, products, orders, categories, tags, and related data'

    def add_arguments(self, parser):
        parser.add_argument(
            '--confirm',
            action='store_true',
            help='Required flag to confirm deletion',
        )

    def handle(self, *args, **options):
        if not options['confirm']:
            self.stdout.write(
                self.style.ERROR(
                    'This will DELETE ALL DATA. Run with --confirm flag to proceed.'
                )
            )
            return

        from catalog.models import Design, Product, ProductMedia, Category, Tag, GoldRateHistory, Notification
        from orders.models import Order, OrderItem, Address, Invoice
        from accounts.models import User
        from control.models import AuditLog

        self.stdout.write('Starting data wipe...')

        # Delete in order to respect foreign key constraints
        self.stdout.write('Deleting invoices...')
        Invoice.objects.all().delete()

        self.stdout.write('Deleting order items...')
        OrderItem.objects.all().delete()

        self.stdout.write('Deleting orders...')
        Order.objects.all().delete()

        self.stdout.write('Deleting addresses...')
        Address.objects.all().delete()

        self.stdout.write('Deleting product media...')
        ProductMedia.objects.all().delete()

        self.stdout.write('Deleting products...')
        Product.objects.all().delete()

        self.stdout.write('Deleting designs...')
        Design.objects.all().delete()

        self.stdout.write('Deleting categories...')
        Category.objects.all().delete()

        self.stdout.write('Deleting tags...')
        Tag.objects.all().delete()

        self.stdout.write('Deleting gold rate history...')
        GoldRateHistory.objects.all().delete()

        self.stdout.write('Deleting notifications...')
        Notification.objects.all().delete()

        self.stdout.write('Deleting audit logs...')
        AuditLog.objects.all().delete()

        self.stdout.write('Deleting non-staff users...')
        User.objects.filter(is_staff=False, is_superuser=False).delete()

        # FIXED: Simpler sequence reset for PostgreSQL
        if connection.vendor == 'postgresql':
            self.stdout.write('Resetting ID sequences...')
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT 'SELECT SETVAL(' || quote_literal(quote_ident(nspname) || '.' || quote_ident(relname)) || ', 1, FALSE);'
                    FROM pg_class
                    JOIN pg_namespace ON pg_class.relnamespace = pg_namespace.oid
                    WHERE relkind = 'S' AND nspname = 'public';
                """)
                for row in cursor.fetchall():
                    cursor.execute(row[0])

        self.stdout.write(self.style.SUCCESS('All data wiped successfully!'))