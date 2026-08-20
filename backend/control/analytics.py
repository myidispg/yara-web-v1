from datetime import timedelta
from decimal import Decimal

from django.db.models import Count, Sum, Q, F, Min
from django.utils import timezone

from catalog.models import Design, Product
from orders.models import Order


def get_revenue_summary():
    """Revenue totals for different time periods."""
    now = timezone.now()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = today_start - timedelta(days=now.weekday())
    month_start = today_start.replace(day=1)
    year_start = today_start.replace(month=1, day=1)

    def calc(start, end):
        orders = Order.objects.filter(
            created_at__gte=start,
            created_at__lt=end
        ).exclude(status='cancelled')
        return {
            'count': orders.count(),
            'revenue': float(orders.aggregate(total=Sum('total'))['total'] or 0),
        }

    return {
        'today': calc(today_start, now),
        'this_week': calc(week_start, now),
        'this_month': calc(month_start, now),
        'this_year': calc(year_start, now),
        'previous_month': calc(
            (month_start - timedelta(days=1)).replace(day=1),
            month_start
        ),
    }


def get_sales_by_category():
    """Revenue breakdown by category."""
    month_start = timezone.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    results = []
    from catalog.models import Category
    for cat in Category.objects.all():
        revenue = Order.objects.filter(
            created_at__gte=month_start,
            items__instance__design__category=cat
        ).exclude(status='cancelled').aggregate(
            total=Sum('items__unit_price')
        )['total'] or 0
        
        quantity = Order.objects.filter(
            created_at__gte=month_start,
            items__instance__design__category=cat
        ).exclude(status='cancelled').aggregate(
            total=Sum('items__quantity')
        )['total'] or 0

        results.append({
            'category': cat.name,
            'revenue': float(revenue),
            'quantity': int(quantity),
        })
    
    results.sort(key=lambda x: x['revenue'], reverse=True)
    return results


def get_top_designs(limit=10):
    """Best-selling designs by quantity and revenue."""
    month_start = timezone.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    designs = []
    for d in Design.objects.all():
        quantity = Order.objects.filter(
            created_at__gte=month_start,
            items__instance__design=d
        ).exclude(status='cancelled').aggregate(
            total=Sum('items__quantity')
        )['total'] or 0

        revenue = Order.objects.filter(
            created_at__gte=month_start,
            items__instance__design=d
        ).exclude(status='cancelled').aggregate(
            total=Sum('items__unit_price')
        )['total'] or 0

        if quantity > 0:
            designs.append({
                'id': d.id,
                'design_code': d.design_code,
                'name': d.name,
                'category': d.category.name,
                'quantity': int(quantity),
                'revenue': float(revenue),
            })
    
    designs.sort(key=lambda x: x['revenue'], reverse=True)
    return designs[:limit]


def get_stock_aging():
    """How long in-stock items have been sitting."""
    now = timezone.now()
    products = Product.objects.filter(status='in_stock').select_related('design')
    
    buckets = {
        '0-30 days': [],
        '31-60 days': [],
        '61-90 days': [],
        '90+ days': [],
    }
    
    for p in products:
        days = (now - p.design.created_at).days
        if days <= 30:
            buckets['0-30 days'].append(p)
        elif days <= 60:
            buckets['31-60 days'].append(p)
        elif days <= 90:
            buckets['61-90 days'].append(p)
        else:
            buckets['90+ days'].append(p)
    
    return {
        bucket: {
            'count': len(items),
            'value': float(sum(float(i.price) for i in items)),
        }
        for bucket, items in buckets.items()
    }


def get_channel_split():
    """Online vs offline sales breakdown."""
    now = timezone.now()
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    online = Product.objects.filter(
        status='sold',
        sold_at__gte=month_start
    ).aggregate(
        count=Count('id'),
        revenue=Sum('price')
    )
    
    offline = Product.objects.filter(
        status='sold_offline',
        sold_at__gte=month_start
    ).aggregate(
        count=Count('id'),
        revenue=Sum('price')
    )
    
    return {
        'online': {
            'count': online['count'] or 0,
            'revenue': float(online['revenue'] or 0),
        },
        'offline': {
            'count': offline['count'] or 0,
            'revenue': float(offline['revenue'] or 0),
        },
    }


def get_revenue_timeseries(days=30):
    """Daily revenue for the last N days."""
    now = timezone.now()
    start = now - timedelta(days=days)
    
    daily = {}
    orders = Order.objects.filter(
        created_at__gte=start
    ).exclude(status='cancelled').values('created_at__date').annotate(
        total=Sum('total')
    ).order_by('created_at__date')
    
    for o in orders:
        date_str = o['created_at__date'].isoformat()
        daily[date_str] = float(o['total'])
    
    # Fill in missing days with 0
    result = []
    current = start.date()
    while current <= now.date():
        date_str = current.isoformat()
        result.append({
            'date': date_str,
            'revenue': daily.get(date_str, 0),
        })
        current += timedelta(days=1)
    
    return result