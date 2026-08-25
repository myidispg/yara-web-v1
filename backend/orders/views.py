from rest_framework.decorators import action
from rest_framework import permissions, status, viewsets
from rest_framework.response import Response

from django.utils import timezone

from catalog.models import Product
from .models import Address, Order, OrderItem
from .serializers import AddressSerializer, OrderCreateSerializer, OrderSerializer


class AddressViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = AddressSerializer

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)

    @action(detail=True, methods=['post'], url_path='set_default')
    def set_default(self, request, pk=None):
        """Set this address as the user's default."""
        address = self.get_object()
        Address.objects.filter(user=request.user, is_default=True).update(is_default=False)
        address.is_default = True
        address.save()
        return Response({'status': 'ok'})


class OrderViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user) \
            .select_related("address").prefetch_related("items__instance")

    def get_serializer_class(self):
        if self.action == "create":
            return OrderCreateSerializer
        return OrderSerializer

    @action(detail=False, methods=["post"], url_path="preview")
    def preview(self, request):
        """Pre-check which lines will need Made-to-Order fabrication."""
        child_class = type(OrderCreateSerializer._declared_fields["items"].child)
        serializer = child_class(data=request.data.get("items", []), many=True)
        serializer.is_valid(raise_exception=True)

        mto_items, in_stock_items = [], []
        for item in serializer.validated_data:
            design = item["design"]
            karat = item["karat"]
            gold_color = item["gold_color"]
            ring_size = (item.get("ring_size") or "").strip() or None
            quantity = item["quantity"]
            
            available = Product.objects.filter(
                design=design, karat=karat, gold_color=gold_color,
                ring_size=ring_size, status="in_stock").count()

            # Match the exact format used in OrderCreateSerializer.create
            variant_label = f"{karat} {gold_color} Gold"
            if ring_size:
                variant_label += f" | Size {ring_size}"
            
            label = f"{design.name} · {variant_label}"

            if available >= quantity:
                in_stock_items.append(f"{label} (In Stock)")
            elif available > 0:
                in_stock_items.append(f"{label} ({available} In Stock)")
                mto_items.append(f"{label} ({quantity - available} Made to Order)")
            else:
                mto_items.append(f"{label} (Made to Order)")

        return Response({"mto_items": mto_items, "in_stock_items": in_stock_items})

    def create(self, request, *args, **kwargs):
        """Override create to return the order serialized with OrderSerializer."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        
        response_serializer = OrderSerializer(order)
        headers = self.get_success_headers(response_serializer.data)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    @action(detail=True, methods=["post"], url_path="update_status")
    def update_status(self, request, pk=None):
        """Update order status and set the corresponding timestamp."""
        order = self.get_object()
        new_status = request.data.get("status")
        
        valid_statuses = ["confirmed", "shipped", "delivered", "cancelled"]
        if new_status not in valid_statuses:
            return Response(
                {"error": f"Invalid status. Must be one of: {', '.join(valid_statuses)}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        order.status = new_status
        # Set the corresponding timestamp
        if new_status == "confirmed":
            order.confirmed_at = timezone.now()
        elif new_status == "shipped":
            order.shipped_at = timezone.now()
        elif new_status == "delivered":
            order.delivered_at = timezone.now()
        elif new_status == "cancelled":
            order.cancelled_at = timezone.now()
        
        order.save()
        
        response_serializer = OrderSerializer(order)
        return Response(response_serializer.data)