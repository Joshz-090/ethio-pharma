from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from pharmacies.views import PharmacyViewSet
from inventory.views import GlobalMedicineViewSet, InventoryViewSet
from sales.views import SaleViewSet

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

# DRF Router configuration
router = DefaultRouter()
router.register(r'pharmacies', PharmacyViewSet, basename='pharmacy')
router.register(r'global-medicines', GlobalMedicineViewSet, basename='global-medicine')
router.register(r'inventory', InventoryViewSet, basename='inventory')
router.register(r'sales', SaleViewSet, basename='sale')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api-auth/', include('rest_framework.urls')),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
