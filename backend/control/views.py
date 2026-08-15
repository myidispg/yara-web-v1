from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Sum, Count, Q
from django.utils import timezone

from accounts.permissions import IsStaff
from catalog.models import Product, ProductInstance, Category, ProductMedia, RateCard
from orders.models import Order, OrderItem
from accounts.models import User
from .serializers import (
    StaffUserSerializer, StaffOrderSerializer, StaffProductSerializer,
    StaffCategorySerializer, RateCardSerializer, ProductCreateSerializer,
    InstanceCreateSerializer, ProductMediaUploadSerializer
)

ACTIVE_STATUSES = ['placed', 'confirmed', 'shipped', 'delivered']
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

        # Open orders = placed + confirmed (your real status names)
        pending_orders = Order.objects.filter(status__in=OPEN_STATUSES).count()

        inventory_value = ProductInstance.objects.filter(status='in_stock').aggregate(total=Sum('price'))['total'] or 0
        low_stock = Product.objects.annotate(
            stock_count=Count('instances', filter=Q(instances__status='in_stock'))
        ).filter(stock_count__lt=3, is_active=True).count()

        # MTO queue = open orders that contain fabricated MTO pieces
        mto_queue = Order.objects.filter(
            status__in=OPEN_STATUSES,
            items__instance__item_code__startswith='MTO-'
        ).distinct().count()

        offline_sales = ProductInstance.objects.filter(status='sold_offline').count()

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

        valid_transitions = {
            'placed': ['confirmed', 'cancelled'],
            'confirmed': ['shipped', 'cancelled'],
            'shipped': ['delivered'],
            'delivered': [],
            'cancelled': [],
        }

        if new_status not in valid_transitions.get(order.status, []):
            return Response(
                {'error': f'Cannot transition from {order.status} to {new_status}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        old_status = order.status
        order.status = new_status
        order.save()

        if new_status == 'cancelled' and old_status != 'cancelled':
            for item in order.items.all():
                if item.instance:
                    item.instance.status = 'in_stock'
                    item.instance.sold_at = None
                    item.instance.sold_to_user = None
                    item.instance.sold_in_order = None
                    item.instance.save()

        return Response({'status': 'success', 'new_status': new_status})

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        order = self.get_object()

        if order.status in ['delivered', 'cancelled']:
            return Response(
                {'error': f'Cannot cancel order with status {order.status}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        order.status = 'cancelled'
        order.save()

        for item in order.items.all():
            if item.instance:
                item.instance.status = 'in_stock'
                item.instance.sold_at = None
                item.instance.sold_to_user = None
                item.instance.sold_in_order = None
                item.instance.save()

        return Response({'status': 'cancelled'})


class ProductViewSet(viewsets.ModelViewSet):
    permission_classes = [IsStaff]
    serializer_class = StaffProductSerializer
    queryset = Product.objects.all().order_by('-id')

    def create(self, request):
        serializer = ProductCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product = serializer.save()
        return Response(StaffProductSerializer(product).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def add_instance(self, request, pk=None):
        product = self.get_object()
        serializer = InstanceCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        existing_count = product.instances.count()
        item_code = f"{product.design_code}-{existing_count + 1:03d}"

        rc = RateCard.get()
        base_weight = float(serializer.validated_data.get('actual_net_weight') or product.base_net_weight_14kt)
        karat = serializer.validated_data['karat']
        gold_rate = float(rc.gold_rate_18kt if karat == '18Kt' else rc.gold_rate_14kt)
        gold_value = base_weight * gold_rate

        diamond_weight = float(serializer.validated_data.get('actual_diamond_weight') or product.total_diamond_weight)
        diamond_value = diamond_weight * float(rc.diamond_rate_per_carat)

        making = (gold_value + diamond_value) * (float(rc.making_charges_percentage) / 100)
        gst = (gold_value + diamond_value + making) * (float(rc.gst_percentage) / 100)
        price = gold_value + diamond_value + making + gst

        instance = ProductInstance.objects.create(
            design=product,
            item_code=item_code,
            karat=karat,
            gold_color=serializer.validated_data['gold_color'],
            ring_size=serializer.validated_data.get('ring_size'),
            status='in_stock',
            price=price,
            actual_net_weight=base_weight,
            actual_diamond_weight=diamond_weight,
            actual_color_stone_weight=serializer.validated_data.get('actual_color_stone_weight', 0),
            report_lab=serializer.validated_data.get('report_lab', ''),
            report_number=serializer.validated_data.get('report_number', ''),
        )

        return Response({
            'status': 'success',
            'instance_id': instance.id,
            'item_code': item_code,
            'price': float(price),
        }, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def upload_media(self, request, pk=None):
        product = self.get_object()
        serializer = ProductMediaUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        media = ProductMedia.objects.create(
            product=product,
            url=serializer.validated_data['url'],
            kind=serializer.validated_data.get('kind', 'image'),
            sort_order=serializer.validated_data.get('position', product.media.count()),
        )

        return Response({'status': 'success', 'media_id': media.id}, status=status.HTTP_201_CREATED)


class InstanceViewSet(viewsets.ModelViewSet):
    permission_classes = [IsStaff]
    queryset = ProductInstance.objects.all()

    @action(detail=True, methods=['post'])
    def mark_sold_offline(self, request, pk=None):
        instance = self.get_object()

        if instance.status != 'in_stock':
            return Response(
                {'error': 'Instance is not in stock'},
                status=status.HTTP_400_BAD_REQUEST
            )

        instance.status = 'sold_offline'
        instance.sold_at = timezone.now()
        instance.sold_to_user = request.user
        instance.sold_in_order = None
        instance.save()

        return Response({'status': 'sold_offline'})

    @action(detail=True, methods=['post'])
    def return_to_stock(self, request, pk=None):
        instance = self.get_object()
        instance.status = 'in_stock'
        instance.sold_at = None
        instance.sold_to_user = None
        instance.sold_in_order = None
        instance.save()

        return Response({'status': 'in_stock'})


class RateCardView(APIView):
    permission_classes = [IsStaff]

    def get(self, request):
        rc = RateCard.get()
        return Response(RateCardSerializer(rc).data)

    def put(self, request):
        rc = RateCard.get()
        serializer = RateCardSerializer(rc, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class CustomerViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsStaff]
    serializer_class = StaffUserSerializer
    queryset = User.objects.filter(is_staff=False).order_by('-date_joined')