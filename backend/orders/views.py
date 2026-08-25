from rest_framework.decorators import action
from rest_framework import permissions, status, viewsets
from rest_framework.response import Response

from catalog.models import Product
from .models import Address, Order
from .serializers import AddressSerializer, OrderCreateSerializer, OrderSerializer

from decimal import Decimal
from django.utils import timezone

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
        # Get the child serializer class (not instance)
        child_class = type(OrderCreateSerializer._declared_fields["items"].child)
        serializer = child_class(data=request.data.get("items", []), many=True)
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

    def create(self, request, *args, **kwargs):
        """Override create to return the order serialized with OrderSerializer."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = self.perform_create(serializer)
        
        # Return the order serialized with OrderSerializer (not OrderCreateSerializer)
        response_serializer = OrderSerializer(order)
        headers = self.get_success_headers(response_serializer.data)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        """Create the order and return it."""
        user = self.request.user
        address = serializer.validated_data['address']
        payment_method = serializer.validated_data['payment_method']
        items_data = serializer.validated_data['items']
        
        # Calculate subtotal
        subtotal = Decimal('0')
        for item in items_data:
            design = item['design']
            karat = item['karat']
            gold_color = item['gold_color']
            ring_size = (item.get('ring_size') or '').strip() or None
            quantity = item['quantity']
            
            # Find matching product
            product = Product.objects.filter(
                design=design, karat=karat, gold_color=gold_color,
                ring_size=ring_size, status='in_stock'
            ).first()
            
            if not product:
                # Mark as MTO if not available
                pass
            
            if product:
                subtotal += product.price * quantity
        
        # Create order
        order = Order.objects.create(
            user=user,
            address=address,
            payment_method=payment_method,
            subtotal=subtotal,
            shipping_fee=Decimal('0'),
            total=subtotal,
        )
        
        # Create order items
        for item in items_data:
            design = item['design']
            karat = item['karat']
            gold_color = item['gold_color']
            ring_size = (item.get('ring_size') or '').strip() or None
            quantity = item['quantity']
            
            # Find matching product
            product = Product.objects.filter(
                design=design, karat=karat, gold_color=gold_color,
                ring_size=ring_size, status='in_stock'
            ).first()
            
            if product:
                variant_label = f"{karat} {gold_color}"
                if ring_size:
                    variant_label += f" · Size {ring_size}"
                
                OrderItem.objects.create(
                    order=order,
                    instance=product,
                    product_name=design.name,
                    variant_label=variant_label,
                    quantity=quantity,
                    unit_price=product.price,
                    line_total=product.price * quantity,
                )
                # Mark product as sold
                product.status = 'sold'
                product.sold_at = timezone.now()
                product.sold_in_order = order
                product.sold_to_user = user
                product.save()
        
        return order