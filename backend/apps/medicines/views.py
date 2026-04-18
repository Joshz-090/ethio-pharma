from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import Medicine, Inventory
from .serializers import MedicineSerializer, InventorySerializer
from core.common.permissions import IsPharmacist, IsAdminUser

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
            
        # Patients: only see stock from approved pharmacies with available items
        return qs.filter(pharmacy__is_active=True, pharmacy__status='approved', quantity__gt=0)

    @action(detail=False, methods=['get'], url_path='alerts')
    def alerts(self, request):
        """
        GET /api/inventory/alerts/
        Returns inventory items running low (quantity < 10).
        Pharmacists only see their own pharmacy's alerts.
        Superusers/admins see all pharmacies.
        """
        LOW_STOCK_THRESHOLD = 10
        user = request.user

        # Django superuser has no profile — show everything
        is_superuser = user.is_staff or user.is_superuser
        is_admin_role = hasattr(user, 'profile') and user.profile.role == 'admin'

        if is_superuser or is_admin_role:
            qs = Inventory.objects.filter(
                quantity__lt=LOW_STOCK_THRESHOLD
            ).select_related('medicine', 'pharmacy')
        elif hasattr(user, 'profile') and user.profile.role == 'pharmacist':
            if not user.profile.pharmacy:
                return Response({"error": "No pharmacy assigned to your account."}, status=400)
            qs = Inventory.objects.filter(
                quantity__lt=LOW_STOCK_THRESHOLD,
                pharmacy=user.profile.pharmacy
            ).select_related('medicine', 'pharmacy')
        else:
            return Response({"error": "Only pharmacists and admins can view alerts."}, status=403)

        serializer = self.get_serializer(qs, many=True)
        return Response({
            "threshold": LOW_STOCK_THRESHOLD,
            "low_stock_count": qs.count(),
            "items": serializer.data
        })
