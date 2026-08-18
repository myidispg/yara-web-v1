from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (CategoryListView, CustomerViewSet, DashboardView, DesignViewSet,
                    OrderViewSet, ProductViewSet, RateCardView)

router = DefaultRouter()
router.register(r'orders', OrderViewSet, basename='admin-orders')
router.register(r'products', DesignViewSet, basename='admin-products')
router.register(r'instances', ProductViewSet, basename='admin-instances')
router.register(r'customers', CustomerViewSet, basename='admin-customers')

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/', DashboardView.as_view(), name='admin-dashboard'),
    path('rate-card/', RateCardView.as_view(), name='admin-rate-card'),
    path('categories/', CategoryListView.as_view(), name='admin-categories'),
]