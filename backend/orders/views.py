from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from catalog.models import Product
from .models import Address, Order
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
        # Unset all other defaults
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
        serializer = OrderCreateSerializer._declared_fields["items"].child(
            data=request.data.get("items", []), many=True)
        serializer.is_valid(raise_exception=True)

        mto_items, in_stock_items = [], []
        for item in serializer.validated_data:
            design = item["design"]
            ring_size = (item.get("ring_size") or "").strip() or None
            available = Product.objects.filter(
                design=design, karat=item["karat"], gold_color=item["gold_color"],
                ring_size=ring_size, status="in_stock").count()

            label = f"{design.name} · {item['karat']} {item['gold_color']}"
            if ring_size:
                label += f" | Size {ring_size}"

            qty = item["quantity"]
            if available >= qty:
                in_stock_items.append(f"{label} (In Stock)")
            elif available > 0:
                in_stock_items.append(f"{label} ({available} In Stock)")
                mto_items.append(f"{label} ({qty - available} Made to Order)")
            else:
                mto_items.append(f"{label} (Made to Order)")

        return Response({"mto_items": mto_items, "in_stock_items": in_stock_items})

    def perform_create(self, serializer):
        """Create order and auto-save address to user profile if it's their first order."""
        user = self.request.user
        address = serializer.validated_data['address']
        
        # Create the order
        order = serializer.save(user=user)
        
        # If user has no default address yet, make this one default
        if not user.addresses.filter(is_default=True).exists():
            address.is_default = True
            address.save()
        
        # Auto-update user's phone if missing and address has one
        if not user.phone and address.phone:
            user.phone = address.phone
            user.save(update_fields=['phone'])
        
        return order