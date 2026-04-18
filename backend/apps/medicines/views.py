from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import Medicine, Inventory
from .serializers import MedicineSerializer, InventorySerializer

class MedicineViewSet(viewsets.ModelViewSet):
    queryset = Medicine.objects.all()
    serializer_class = MedicineSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'category']

class InventoryViewSet(viewsets.ModelViewSet):
    serializer_class = InventorySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['medicine__name', 'medicine__category', 'pharmacy__name']
    ordering_fields = ['price', 'pharmacy__name']

    def get_queryset(self):
        user = self.request.user
        qs = Inventory.objects.all().select_related('medicine', 'pharmacy')
        
        # Admin can see all inventory
        if hasattr(user, 'profile') and user.profile.role == 'admin':
            return qs
            
        # Pharmacists only see their pharmacy's inventory
        if hasattr(user, 'profile') and user.profile.role == 'pharmacist':
            if user.profile.pharmacy:
                return qs.filter(pharmacy=user.profile.pharmacy)
            return qs.none()
            
        # Patients: only see stock from approved pharmacies
        return qs.filter(pharmacy__is_active=True, pharmacy__status='approved', quantity__gt=0)
