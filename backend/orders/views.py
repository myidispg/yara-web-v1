from rest_framework.decorators import action
from rest_framework import permissions, status, viewsets
from rest_framework.response import Response

from django.utils import timezone

from catalog.models import Product
from .models import Address, Order, OrderItem
from .serializers import AddressSerializer, OrderCreateSerializer, OrderSerializer, InvoiceSerializer


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

    @action(detail=True, methods=['get'])
    def invoice(self, request, pk=None):
        """Get invoice metadata for this order."""
        order = self.get_object()
        if not hasattr(order, 'invoice') or not order.invoice:
            return Response({'error': 'No invoice for this order'}, status=404)
        serializer = InvoiceSerializer(order.invoice)
        return Response(serializer.data)

    @action(detail=True, methods=['get'], url_path='invoice/pdf')
    def invoice_pdf(self, request, pk=None):
        """Serve the invoice PDF for this order."""
        from django.http import FileResponse
        order = self.get_object()
        if not hasattr(order, 'invoice') or not order.invoice.pdf_file:
            return Response({'error': 'No invoice PDF available'}, status=404)
        
        try:
            return FileResponse(
                order.invoice.pdf_file.open('rb'),
                content_type='application/pdf',
                as_attachment=True,
                filename=f"{order.invoice.invoice_number}.pdf"
            )
        except Exception as e:
            return Response({'error': f'Failed to serve PDF: {str(e)}'}, status=500)

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

@action(detail=True, methods=['post'], url_path='map_product/(?P<item_id>[0-9]+)')
def map_product(self, request, pk=None, item_id=None):
    """Map a real product to an MTO OrderItem."""
    from .models import OrderItem, Invoice
    from orders.utils import generate_invoice_for_order
    
    order = self.get_object()
    product_id = request.data.get('product_id')
    
    if not product_id:
        return Response({'error': 'product_id is required'}, status=400)
    
    try:
        # Get the OrderItem
        item = OrderItem.objects.get(id=item_id, order=order)
        
        if not item.is_mto_pending:
            return Response({'error': 'This item is not pending MTO fulfillment'}, status=400)
        
        # Get the real product
        product = Product.objects.get(id=product_id)
        
        # Verify it matches the order requirements
        original_product = item.instance
        if (product.design != original_product.design or 
            product.karat != original_product.karat or 
            product.gold_color != original_product.gold_color):
            return Response({'error': 'Product does not match order specifications'}, status=400)
        
        # Mark the old MTO placeholder as no longer needed
        original_product.status = 'cancelled'  # or delete it
        original_product.save()
        
        # Update the OrderItem to point to the real product
        item.instance = product
        item.is_mto_pending = False
        item.save()
        
        # Mark the real product as sold
        product.status = 'sold'
        product.sold_to_user = order.user
        product.sold_in_order = order
        product.sold_at = timezone.now()
        product.save()
        
        # If order has an invoice, regenerate it with the new product details
        try:
            old_invoice = order.invoice
            old_invoice.pdf_file.delete()  # Delete old PDF
            old_invoice.delete()  # Delete old invoice record
        except:
            pass  # No invoice yet
        
        # Generate new invoice
        new_invoice = generate_invoice_for_order(order)
        
        return Response({
            'success': True,
            'message': f'Product {product.item_code} mapped to order',
            'invoice_number': new_invoice.invoice_number
        })
        
    except OrderItem.DoesNotExist:
        return Response({'error': 'Order item not found'}, status=404)
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)