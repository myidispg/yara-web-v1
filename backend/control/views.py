import secrets
import csv

from django.http import HttpResponse
from django.conf import settings
from django.core.files.storage import default_storage
from django.db.models import Count, Q, Sum
from django.utils import timezone

from rest_framework import viewsets, status, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import User
from accounts.permissions import IsStaff
from catalog.models import Category, Design, Product, ProductMedia, RateCard, GoldRateHistory, Notification
from orders.models import Order

from .analytics import (
    get_revenue_summary, get_sales_by_category, get_top_designs,
    get_stock_aging, get_channel_split, get_revenue_timeseries
)

from .serializers import (
    DesignCreateSerializer, ProductInputSerializer, RateCardSerializer,
    StaffCategorySerializer, StaffDesignSerializer, StaffOrderSerializer,
    StaffProductSerializer, StaffUserSerializer, create_product_for_design, 
    GoldRateHistorySerializer, NotificationSerializer
)

OPEN_STATUSES = ['placed', 'confirmed']


class DashboardView(APIView):
    permission_classes = [IsStaff]

    def get(self, request):
        today = timezone.now().date()
        month_start = today.replace(day=1)

        today_revenue = Order.objects.filter(created_at__date=today).exclude(status='cancelled').aggregate(total=Sum('total'))['total'] or 0
        month_revenue = Order.objects.filter(created_at__date__gte=month_start).exclude(status='cancelled').aggregate(total=Sum('total'))['total'] or 0
        today_orders = Order.objects.filter(created_at__date=today).exclude(status='cancelled').count()
        month_orders = Order.objects.filter(created_at__date__gte=month_start).exclude(status='cancelled').count()
        pending_orders = Order.objects.filter(status__in=OPEN_STATUSES).count()

        inventory_value = Product.objects.filter(status='in_stock').aggregate(total=Sum('price'))['total'] or 0
        low_stock = Design.objects.annotate(
            stock_count=Count('products', filter=Q(products__status='in_stock'))
        ).filter(stock_count__lt=3, is_active=True).count()

        mto_queue = Order.objects.filter(
            status__in=OPEN_STATUSES,
            items__instance__item_code__startswith='MTO-').distinct().count()
        offline_sales = Product.objects.filter(status='sold_offline').count()

        return Response({
            'revenue': {'today': float(today_revenue), 'month': float(month_revenue)},
            'orders': {'today': today_orders, 'month': month_orders, 'pending': pending_orders},
            'inventory': {'value': float(inventory_value), 'low_stock_alerts': low_stock},
            'mto_queue': mto_queue,
            'offline_sales': offline_sales,
        })


class OrderViewSet(viewsets.ModelViewSet):
    permission_classes = [IsStaff]
    serializer_class = StaffOrderSerializer
    queryset = Order.objects.all().order_by('-created_at')

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        order = self.get_object()
        new_status = request.data.get('status')
        valid = {'placed': ['confirmed', 'cancelled'], 'confirmed': ['shipped', 'cancelled'],
                 'shipped': ['delivered'], 'delivered': [], 'cancelled': []}
        if new_status not in valid.get(order.status, []):
            return Response({'error': f'Cannot transition from {order.status} to {new_status}'},
                            status=status.HTTP_400_BAD_REQUEST)
        old = order.status
        order.status = new_status
        order.save()
        if new_status == 'cancelled' and old != 'cancelled':
            self._restock(order)
        return Response({'status': 'success', 'new_status': new_status})

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        order = self.get_object()
        if order.status in ['delivered', 'cancelled']:
            return Response({'error': f'Cannot cancel order with status {order.status}'},
                            status=status.HTTP_400_BAD_REQUEST)
        order.status = 'cancelled'
        order.save()
        self._restock(order)
        return Response({'status': 'cancelled'})

    # Import/Export CSV
    @action(detail=False, methods=['get'], url_path='export-orders')
    def export_orders(self, request):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="orders.csv"'
        w = csv.writer(response)
        w.writerow(['order_number', 'customer_email', 'customer_name', 'customer_phone',
                    'status', 'payment_method', 'subtotal', 'shipping_fee', 'total',
                    'created_at', 'item_codes'])
        for o in self.queryset.select_related('user', 'address'):
            codes = ','.join(i.instance.item_code for i in o.items.all() if i.instance)
            w.writerow([o.order_number, o.user.email,
                        f"{o.user.first_name} {o.user.last_name}".strip() or o.user.email,
                        getattr(o.user, 'phone', ''), o.status, o.payment_method,
                        float(o.subtotal), float(o.shipping_fee), float(o.total),
                        o.created_at.isoformat(), codes])
        return response

    @staticmethod
    def _restock(order):
        for item in order.items.all():
            if item.instance:
                item.instance.status = 'in_stock'
                item.instance.sold_at = None
                item.instance.sold_to_user = None
                item.instance.sold_in_order = None
                item.instance.save()


class DesignViewSet(viewsets.ModelViewSet):
    permission_classes = [IsStaff]
    queryset = Design.objects.all().order_by('-id')

    def get_serializer_class(self):
        if self.action == 'create':
            return DesignCreateSerializer
        return StaffDesignSerializer

    @action(detail=True, methods=['post'])
    def add_instance(self, request, pk=None):
        design = self.get_object()
        ser = ProductInputSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        product = create_product_for_design(design, ser.validated_data, RateCard.get())
        return Response({'status': 'success', 'instance_id': product.id,
                         'item_code': product.item_code, 'price': float(product.price)},
                        status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def upload_media(self, request, pk=None):
        design = self.get_object()
        url = request.data.get('url')
        kind = request.data.get('kind', 'image')
        f = request.FILES.get('file')

        if f:
            ext = f.name.rsplit('.', 1)[-1].lower()
            if ext in ('jpg', 'jpeg', 'png', 'webp'):
                kind = 'image'
            elif ext in ('mp4', 'webm', 'mov'):
                kind = 'video'
            else:
                return Response({'error': 'Unsupported file type'}, status=status.HTTP_400_BAD_REQUEST)
            if f.size > 50 * 1024 * 1024:
                return Response({'error': 'File too large (max 50MB)'}, status=status.HTTP_400_BAD_REQUEST)
            name = default_storage.save(f"designs/{design.slug}/{secrets.token_hex(4)}.{ext}", f)
            url = request.build_absolute_uri(settings.MEDIA_URL + name)

        if not url:
            return Response({'error': 'Provide a file or url'}, status=status.HTTP_400_BAD_REQUEST)

        media = ProductMedia.objects.create(design=design, url=url, kind=kind,
                                            sort_order=design.media.count() + 1)
        return Response({'status': 'success', 'media_id': media.id, 'url': media.url},
                        status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['delete'])
    def delete_design(self, request, pk=None):
        design = self.get_object()
        if design.products.exists():
            return Response(
                {'error': f'Cannot delete design with {design.products.count()} existing products. Delete products first.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        design.delete()
        return Response({'status': 'deleted'})

    # Import/Export CSV
    @action(detail=False, methods=['get'], url_path='import-template')
    def import_template(self, request):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="import-template.csv"'
        w = csv.writer(response)
        w.writerow(['design_code', 'design_name', 'item_code', 'karat', 'gold_color', 'ring_size',
                    'diamond_grade', 'actual_net_weight', 'actual_melle', 'actual_pointer',
                    'actual_fancy', 'actual_color_stone', 'cert_lab', 'cert_number', 'hallmark_number'])
        w.writerow(['RG-001', 'Aura Diamond Ring', 'YRA-RG001-001', '18Kt', 'Yellow', '12', 'IJ/SI',
                    '3.500', '0.10', '0.50', '0.00', '0.00', 'IGI', '12345', 'HMK-001'])
        return response
    
    @action(detail=False, methods=['post'], url_path='import-products')
    def import_products(self, request):
        csv_file = request.FILES.get('file')
        if not csv_file:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            decoded = csv_file.read().decode('utf-8-sig')
        except UnicodeDecodeError:
            return Response({'error': 'File must be UTF-8 encoded'}, status=status.HTTP_400_BAD_REQUEST)

        lines = decoded.splitlines()
        if not lines:
            return Response({'error': 'CSV file is empty'}, status=status.HTTP_400_BAD_REQUEST)

        reader = csv.DictReader(lines)
        rc = RateCard.get()
        valid_rows, errors = [], []

        def pf(s, name, max_val=None):
            if s is None or str(s).strip() == '':
                return None
            try:
                v = float(s)
                if v < 0: raise ValueError(f'{name} must be >= 0')
                if max_val and v > max_val: raise ValueError(f'{name} must be <= {max_val}')
                return v
            except ValueError as e:
                if 'numeric' not in str(e): raise
                raise ValueError(f'{name} must be a number')

        for i, row in enumerate(reader, start=2):
            errs = []
            dc = (row.get('design_code') or '').strip()
            ic = (row.get('item_code') or '').strip()
            if not dc: errs.append('design_code is required')
            if not ic: errs.append('item_code is required')
            if errs:
                errors.append({'row': i, 'errors': errs}); continue
            if Product.objects.filter(item_code=ic).exists():
                errs.append(f'item_code "{ic}" already exists')

            try:
                design = Design.objects.get(design_code=dc)
            except Design.DoesNotExist:
                errs.append(f'Design "{dc}" not found'); errors.append({'row': i, 'errors': errs}); continue

            karat = (row.get('karat') or '18Kt').strip()
            if karat not in ('14Kt', '18Kt'): errs.append(f'Invalid karat: {karat}')
            gc = (row.get('gold_color') or 'Yellow').strip()
            if gc not in ('Yellow', 'Rose', 'White'): errs.append(f'Invalid gold_color: {gc}')
            rs = (row.get('ring_size') or '').strip() or None
            if design.is_ring and rs and rs not in RING_SIZES: errs.append(f'Invalid ring_size: {rs}')
            if not design.is_ring: rs = None
            dg = (row.get('diamond_grade') or rc.default_grade).strip()
            if dg not in rc.grade_choices(): errs.append(f'Invalid diamond_grade: {dg}')

            try:
                net = pf(row.get('actual_net_weight'), 'actual_net_weight', 200)
                melle = pf(row.get('actual_melle'), 'actual_melle', 50) or 0
                pointer = pf(row.get('actual_pointer'), 'actual_pointer', 50) or 0
                fancy = pf(row.get('actual_fancy'), 'actual_fancy', 50) or 0
                cstone = pf(row.get('actual_color_stone'), 'actual_color_stone', 50) or 0
            except ValueError as e:
                errs.append(str(e)); errors.append({'row': i, 'errors': errs}); continue
            if melle + pointer + fancy > 50:
                errs.append('Total diamond weight must be <= 50 Ct')

            cl = (row.get('cert_lab') or '').strip()
            cn = (row.get('cert_number') or '').strip()
            if cn and Product.objects.filter(report_lab=cl, report_number=cn).exists():
                errs.append(f'Cert {cl} #{cn} already exists')
            hm = (row.get('hallmark_number') or '').strip()
            if hm and Product.objects.filter(hallmark_number=hm).exists():
                errs.append(f'Hallmark "{hm}" already exists')

            if errs:
                errors.append({'row': i, 'errors': errs}); continue

            final_net = net if net is not None else float(design.calculate_net_weight(karat, rs))
            dia_total = (melle + pointer + fancy) if (melle + pointer + fancy) > 0 else float(design.total_diamond_weight)
            valid_rows.append({
                'design': design, 'item_code': ic, 'karat': karat, 'gold_color': gc,
                'ring_size': rs, 'diamond_grade': dg, 'net': final_net, 'dia_total': dia_total,
                'cstone': cstone, 'cert_lab': cl, 'cert_number': cn, 'hallmark': hm,
            })

        if errors:
            return Response({'status': 'validation_failed', 'errors': errors,
                             'valid_count': len(valid_rows)}, status=status.HTTP_400_BAD_REQUEST)

        from django.db import transaction
        created_codes = []
        with transaction.atomic():
            for r in valid_rows:
                p = Product.objects.create(
                    design=r['design'], item_code=r['item_code'], karat=r['karat'],
                    gold_color=r['gold_color'], ring_size=r['ring_size'],
                    diamond_grade=r['diamond_grade'], status='in_stock',
                    price=price_for(r['net'], r['dia_total'], r['karat'], r['diamond_grade'], rc),
                    actual_net_weight=r['net'], actual_diamond_weight=r['dia_total'],
                    actual_color_stone_weight=r['cstone'],
                    report_lab=r['cert_lab'], report_number=r['cert_number'],
                    hallmark_number=r['hallmark'])
                created_codes.append(p.item_code)
                net_14kt = r['net'] / 1.2 if r['karat'] == '18Kt' else r['net']
                if r['design'].is_ring and r['ring_size']:
                    r['design'].record_actual_weight(r['ring_size'], net_14kt)
                elif not r['design'].is_ring:
                    r['design'].record_actual_weight_base(net_14kt)
        return Response({'status': 'success', 'imported': len(created_codes), 'item_codes': created_codes})

    @action(detail=False, methods=['get'], url_path='export-products')
    def export_products(self, request):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="products.csv"'
        w = csv.writer(response)
        w.writerow(['item_code', 'design_code', 'design_name', 'category', 'karat', 'gold_color',
                    'ring_size', 'diamond_grade', 'actual_net_weight', 'actual_diamond_weight',
                    'cert_lab', 'cert_number', 'hallmark_number', 'price', 'status'])
        for p in Product.objects.select_related('design', 'design__category').all():
            w.writerow([p.item_code, p.design.design_code, p.design.name, p.design.category.name,
                        p.karat, p.gold_color, p.ring_size or '', p.diamond_grade,
                        float(p.actual_net_weight), float(p.actual_diamond_weight),
                        p.report_lab, p.report_number, p.hallmark_number,
                        float(p.price), p.status])
        return response

class ProductViewSet(viewsets.ModelViewSet):
    permission_classes = [IsStaff]
    serializer_class = StaffProductSerializer
    queryset = Product.objects.all()

    @action(detail=True, methods=['post'])
    def mark_sold_offline(self, request, pk=None):
        product = self.get_object()
        if product.status != 'in_stock':
            return Response({'error': 'Product is not in stock'}, status=status.HTTP_400_BAD_REQUEST)
        product.status = 'sold_offline'
        product.sold_at = timezone.now()
        product.sold_to_user = request.user
        product.sold_in_order = None
        product.save()
        return Response({'status': 'sold_offline'})

    @action(detail=True, methods=['post'])
    def return_to_stock(self, request, pk=None):
        product = self.get_object()
        product.status = 'in_stock'
        product.sold_at = None
        product.sold_to_user = None
        product.sold_in_order = None
        product.save()
        return Response({'status': 'in_stock'})

    @action(detail=True, methods=['delete'])
    def delete_product(self, request, pk=None):
        product = self.get_object()
        if product.status != 'in_stock':
            return Response(
                {'error': f'Cannot delete a product with status "{product.status}". Return it to stock first.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        product.delete()
        return Response({'status': 'deleted'})


class RateCardView(APIView):
    permission_classes = [IsStaff]

    def get(self, request):
        return Response(RateCardSerializer(RateCard.get()).data)

    def put(self, request):
        rc = RateCard.get()
        ser = RateCardSerializer(rc, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        rc = ser.save()
        if rc.default_grade not in rc.grade_choices():
            return Response({'error': f'default_grade must be a band with a rate'},
                            status=status.HTTP_400_BAD_REQUEST)
        return Response(RateCardSerializer(rc).data)

class RateCardFetchNowView(APIView):
    permission_classes = [IsStaff]

    def post(self, request):
        from django.core.management import call_command
        from io import StringIO
        out = StringIO()
        try:
            call_command("fetch_gold_rates", "--force", stdout=out)
            return Response({'status': 'ok', 'output': out.getvalue()})
        except Exception as e:
            return Response({'status': 'error', 'error': str(e)},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CategoryListView(APIView):
    permission_classes = [IsStaff]

    def get(self, request):
        return Response(StaffCategorySerializer(Category.objects.all(), many=True).data)


class CustomerViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsStaff]
    serializer_class = StaffUserSerializer
    queryset = User.objects.filter(is_staff=False).order_by('-date_joined')

    # Import/Export customers
    @action(detail=False, methods=['get'], url_path='export-customers')
    def export_customers(self, request):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="customers.csv"'
        w = csv.writer(response)
        w.writerow(['email', 'first_name', 'last_name', 'phone', 'date_joined',
                    'total_orders', 'total_spent'])
        for u in self.queryset:
            agg = u.orders.exclude(status='cancelled').aggregate(
                c=Count('id'), s=Sum('total'))
            w.writerow([u.email, u.first_name, u.last_name, getattr(u, 'phone', ''),
                        u.date_joined.isoformat(), agg['c'] or 0, float(agg['s'] or 0)])
        return response


class GoldRateHistoryView(APIView):
    permission_classes = [IsStaff]

    def get(self, request):
        history = GoldRateHistory.objects.all()[:50]
        return Response(GoldRateHistorySerializer(history, many=True).data)


class NotificationListView(APIView):
    permission_classes = [IsStaff]

    def get(self, request):
        notifications = Notification.objects.all()[:50]
        return Response(NotificationSerializer(notifications, many=True).data)


class NotificationMarkReadView(APIView):
    permission_classes = [IsStaff]

    def post(self, request, pk=None):
        try:
            notification = Notification.objects.get(pk=pk)
            notification.read = True
            notification.save()
            return Response({'status': 'read'})
        except Notification.DoesNotExist:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)


class NotificationMarkAllReadView(APIView):
    permission_classes = [IsStaff]

    def post(self, request):
        Notification.objects.filter(read=False).update(read=True)
        return Response({'status': 'all_read'})

class AnalyticsSummaryView(APIView):
    permission_classes = [IsStaff]

    def get(self, request):
        return Response({
            'revenue': get_revenue_summary(),
            'by_category': get_sales_by_category(),
            'top_designs': get_top_designs(),
            'stock_aging': get_stock_aging(),
            'channel_split': get_channel_split(),
        })


class AnalyticsTimeseriesView(APIView):
    permission_classes = [IsStaff]

    def get(self, request):
        days = int(request.query_params.get('days', 30))
        return Response(get_revenue_timeseries(days))

class CategoryViewSet(viewsets.ModelViewSet):
    permission_classes = [IsStaff]
    serializer_class = StaffCategorySerializer

    def get_queryset(self):
        if self.action == 'list':
            return Category.objects.filter(parent__isnull=True).order_by('name')
        return Category.objects.all()

    class CreateUpdateSerializer(serializers.ModelSerializer):
        slug = serializers.SlugField(required=False, allow_blank=True)

        class Meta:
            model = Category
            fields = ['id', 'name', 'slug', 'is_active', 'parent']

        def validate(self, data):
            from django.utils.text import slugify
            parent = data.get('parent') or getattr(self.instance, 'parent', None)
            if self.instance and parent and parent.pk == self.instance.pk:
                raise serializers.ValidationError({'parent': 'A category cannot be its own parent.'})
            if parent and parent.parent_id:
                raise serializers.ValidationError({'parent': 'Only one level of subcategories is allowed.'})
            name = data.get('name')
            if name:
                slug = (data.get('slug') or '').strip() or slugify(name)
                base, n = slug, 2
                qs = Category.objects.all()
                if self.instance:
                    qs = qs.exclude(pk=self.instance.pk)
                while qs.filter(slug=slug).exists():
                    slug = f"{base}-{n}"
                    n += 1
                data['slug'] = slug
            return data

    def create(self, request, *args, **kwargs):
        serializer = self.CreateUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()
        return Response(StaffCategorySerializer(instance).data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.CreateUpdateSerializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(StaffCategorySerializer(instance).data)

    def partial_update(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)