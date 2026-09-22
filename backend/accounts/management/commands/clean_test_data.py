from django.core.management.base import BaseCommand
from accounts.models import User
from orders.models import Order, Invoice
from catalog.models import Product

class Command(BaseCommand):
    help = 'Delete all non-admin users, orders, and reset product stock for clean testing'

    def handle(self, *args, **options):
        # Confirm before proceeding
        confirm = input('⚠️  This will delete all non-admin users, orders, and reset product stock. Continue? (yes/no): ')
        if confirm.lower() != 'yes':
            self.stdout.write(self.style.WARNING('Aborted.'))
            return

        # Delete orders
        order_count = Order.objects.count()
        Order.objects.all().delete()
        self.stdout.write(self.style.SUCCESS(f'✅ Deleted {order_count} orders'))

        # Delete invoices
        invoice_count = Invoice.objects.count()
        Invoice.objects.all().delete()
        self.stdout.write(self.style.SUCCESS(f'✅ Deleted {invoice_count} invoices'))

        # Delete non-admin users
        non_admins = User.objects.filter(is_superuser=False)
        user_count = non_admins.count()
        non_admins.delete()
        self.stdout.write(self.style.SUCCESS(f'✅ Deleted {user_count} non-admin users'))

        # Reset product stock
        Product.objects.filter(status='sold').update(
            status='in_stock', 
            sold_at=None, 
            sold_to_user=None, 
            sold_in_order=None
        )
        self.stdout.write(self.style.SUCCESS(f'✅ Reset all sold products to in_stock'))

        self.stdout.write(self.style.SUCCESS(f'\n🎉 Database cleaned! Ready for fresh testing.'))