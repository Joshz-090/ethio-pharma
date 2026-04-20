from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MedicineViewSet, InventoryViewSet, ReviewViewSet

router = DefaultRouter()
router.register(r'catalog', MedicineViewSet, basename='medicine')
router.register(r'inventory', InventoryViewSet, basename='inventory')
router.register(r'reviews', ReviewViewSet, basename='review')

urlpatterns = [
    path('', include(router.urls)),
]
