from rest_framework.routers import DefaultRouter

from .views import CategoryViewSet, ProductViewSet, TagViewSet

router = DefaultRouter()
router.register("categories", CategoryViewSet, basename="category")  # <-- ADDED basename
router.register(r"tags", TagViewSet)
router.register("products", ProductViewSet, basename="product")       # <-- ADDED basename


urlpatterns = router.urls