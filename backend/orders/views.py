from rest_framework import permissions, viewsets
from rest_framework.decorators import action

from .models import Address, Order
from .serializers import AddressSerializer, OrderCreateSerializer, OrderSerializer


class AddressViewSet(viewsets.ModelViewSet):
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class OrderViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ["get", "post", "head", "options"]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related("items__instance")

    def get_serializer_class(self):
        return OrderCreateSerializer if self.action == "create" else OrderSerializer

    @action(detail=False, methods=["post"], url_path="preview")
    def preview(self, request):
        """Pre-check which cart lines will need Made-to-Order fabrication."""
        from rest_framework.response import Response
        from catalog.models import Product, ProductInstance
        from .serializers import _ItemInput

        serializer = _ItemInput(data=request.data.get("items", []), many=True)
        serializer.is_valid(raise_exception=True)

        mto_items, in_stock_items = [], []
        for item in serializer.validated_data:
            design = Product.objects.filter(pk=item["design"]).first()
            if not design:
                continue
            available = ProductInstance.objects.filter(
                design=design,
                karat=item["karat"],
                gold_color=item["gold_color"],
                ring_size=item.get("ring_size"),
                status="in_stock",
            ).count()

            label = f"{design.name} · {item['karat']} {item['gold_color']}"
            if item.get("ring_size"):
                label += f" | Size {item['ring_size']}"

            qty = item["quantity"]
            if available >= qty:
                in_stock_items.append(f"{label} (In Stock)")
            elif available > 0:
                in_stock_items.append(f"{label} ({available} In Stock)")
                mto_items.append(f"{label} ({qty - available} Made to Order)")
            else:
                mto_items.append(f"{label} (Made to Order)")

        return Response({"mto_items": mto_items, "in_stock_items": in_stock_items})