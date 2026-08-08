from rest_framework.routers import DefaultRouter

from .views import AddressViewSet, OrderViewSet

router = DefaultRouter()
router.register("addresses", AddressViewSet, basename="address")
router.register("orders", OrderViewSet, basename="order")

urlpatterns = router.urls