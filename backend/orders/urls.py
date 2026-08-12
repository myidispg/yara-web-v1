from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'orders', views.OrderViewSet, basename='order')
router.register(r'addresses', views.AddressViewSet, basename='address')

urlpatterns = [
    path('', include(router.urls)),
]