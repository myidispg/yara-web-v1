from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import Address, Order
from .serializers import AddressSerializer, OrderSerializer, OrderCreateSerializer

class AddressViewSet(viewsets.ModelViewSet):
    """
    GET  /api/addresses/  -> List current user's addresses
    POST /api/addresses/  -> Create a new address for current user
    """
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Automatically attach the logged-in user to the address
        serializer.save(user=self.request.user)

class OrderViewSet(viewsets.ModelViewSet):
    """
    GET  /api/orders/     -> List current user's past orders
    POST /api/orders/     -> Create a new order (Checkout)
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # CRITICAL: Only return orders belonging to the logged-in user
        return Order.objects.filter(user=self.request.user).prefetch_related('items')

    def get_serializer_class(self):
        if self.action == 'create':
            return OrderCreateSerializer
        return OrderSerializer