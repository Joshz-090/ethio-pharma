import sys
import os
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

# Initialize DRF Router
router = DefaultRouter()

# Registering ViewSets
from users.views import UserProfileViewSet, AuthViewSet
from pharmacies.views import PharmacyViewSet
from medicines.views import MedicineViewSet, InventoryViewSet
from reservations.views import ReservationViewSet
from prescriptions.views import PrescriptionViewSet
from sales.views import SaleViewSet

router.register(r'auth', AuthViewSet, basename='auth')
router.register(r'pharmacies', PharmacyViewSet, basename='pharmacy')
router.register(r'users/profiles', UserProfileViewSet, basename='user-profile')
router.register(r'medicines', MedicineViewSet, basename='medicine')
router.register(r'inventory', InventoryViewSet, basename='inventory')
router.register(r'reservations', ReservationViewSet, basename='reservation')
router.register(r'prescriptions', PrescriptionViewSet, basename='prescription')
router.register(r'sales', SaleViewSet, basename='sale')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/analytics/', include('analytics.urls')),
    path('api-auth/', include('rest_framework.urls')),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
