python manage.py shell -c "
from accounts.models import User, OTP
from orders.models import Order, Invoice, Address
from django.db.models import Q

# 1. Delete all OTP records
otp_count = OTP.objects.count()
OTP.objects.all().delete()
print(f'🗑️ Deleted {otp_count} OTP records')

# 2. Delete all invoices
inv_count = Invoice.objects.count()
Invoice.objects.all().delete()
print(f'🗑️ Deleted {inv_count} invoices')

# 3. Delete all orders
order_count = Order.objects.count()
Order.objects.all().delete()
print(f'🗑️ Deleted {order_count} orders')

# 4. Delete all addresses
addr_count = Address.objects.count()
Address.objects.all().delete()
print(f'🗑️ Deleted {addr_count} addresses')

# 5. Delete all non-staff users
user_count = User.objects.filter(is_staff=False).count()
User.objects.filter(is_staff=False).delete()
print(f'🗑️ Deleted {user_count} non-staff users')

# 6. Show what remains
staff_count = User.objects.filter(is_staff=True).count()
print(f'')
print(f'✅ Clean wipe complete!')
print(f'📊 Remaining staff accounts: {staff_count}')
print(f'📊 Total users remaining: {User.objects.count()}')
"