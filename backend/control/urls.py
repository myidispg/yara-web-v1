from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DashboardView, OrderViewSet, ProductViewSet,
    InstanceViewSet, RateCardView, CustomerViewSet
)

router = DefaultRouter()
router.register(r'orders', OrderViewSet, basename='admin-orders')
router.register(r'products', ProductViewSet, basename='admin-products')
router.register(r'instances', InstanceViewSet, basename='admin-instances')
router.register(r'customers', CustomerViewSet, basename='admin-customers')

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/', DashboardView.as_view(), name='admin-dashboard'),
    path('rate-card/', RateCardView.as_view(), name='admin-rate-card'),
]