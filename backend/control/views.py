import secrets

from django.conf import settings
from django.core.files.storage import default_storage
from django.db.models import Count, Q, Sum
from django.utils import timezone

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import User
from accounts.permissions import IsStaff
from catalog.models import Category, Design, Product, ProductMedia, RateCard
from orders.models import Order

from .serializers import (
    DesignCreateSerializer, ProductInputSerializer, RateCardSerializer,
    StaffCategorySerializer, StaffDesignSerializer, StaffOrderSerializer,
    StaffProductSerializer, StaffUserSerializer, create_product_for_design,
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


class CategoryListView(APIView):
    permission_classes = [IsStaff]

    def get(self, request):
        return Response(StaffCategorySerializer(Category.objects.all(), many=True).data)


class CustomerViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsStaff]
    serializer_class = StaffUserSerializer
    queryset = User.objects.filter(is_staff=False).order_by('-date_joined')