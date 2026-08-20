from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (CategoryListView, CustomerViewSet, DashboardView, DesignViewSet,
                    OrderViewSet, ProductViewSet, RateCardView, GoldRateHistoryView, NotificationListView,
                    NotificationMarkAllReadView, NotificationMarkReadView, RateCardFetchNowView, 
                    AnalyticsSummaryView, AnalyticsTimeseriesView, CategoryViewSet)

router = DefaultRouter()
router.register(r'orders', OrderViewSet, basename='admin-orders')
router.register(r'products', DesignViewSet, basename='admin-products')
router.register(r'instances', ProductViewSet, basename='admin-instances')
router.register(r'customers', CustomerViewSet, basename='admin-customers')
router.register(r'categories', CategoryViewSet, basename='admin-categories')

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/', DashboardView.as_view(), name='admin-dashboard'),
    path('rate-card/', RateCardView.as_view(), name='admin-rate-card'),
    path('rate-card/fetch-now/', RateCardFetchNowView.as_view(), name='admin-rate-fetch-now'),
    path('categories/', CategoryListView.as_view(), name='admin-categories'),
    path('rate-history/', GoldRateHistoryView.as_view(), name='admin-rate-history'),
    path('notifications/', NotificationListView.as_view(), name='admin-notifications'),
    path('notifications/<int:pk>/read/', NotificationMarkReadView.as_view(), name='admin-notification-read'),
    path('notifications/mark-all-read/', NotificationMarkAllReadView.as_view(), name='admin-notifications-all-read'),
    path('analytics/summary/', AnalyticsSummaryView.as_view(), name='admin-analytics-summary'),
    path('analytics/timeseries/', AnalyticsTimeseriesView.as_view(), name='admin-analytics-timeseries'),
] + router.urls