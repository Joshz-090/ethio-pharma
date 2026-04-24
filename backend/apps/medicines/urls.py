from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MedicineViewSet, InventoryViewSet, ReviewViewSet, CategoryViewSet, SaleViewSet

router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'catalog', MedicineViewSet, basename='medicine')
router.register(r'inventory', InventoryViewSet, basename='inventory')
router.register(r'reviews', ReviewViewSet, basename='review')
router.register(r'sales', SaleViewSet, basename='sale')

urlpatterns = [
    path('', include(router.urls)),
]
