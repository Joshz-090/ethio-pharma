from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Medicine, Inventory
from .serializers import MedicineSerializer, InventorySerializer
from .selectors import search_medicines_by_sector
from analytics.services import log_search
from core.common.permissions import IsAdmin, IsPharmacist, IsPatient

class MedicineViewSet(viewsets.ModelViewSet):
    queryset = Medicine.objects.all()
    serializer_class = MedicineSerializer
    permission_classes = [permissions.IsAuthenticated]

class InventoryViewSet(viewsets.ModelViewSet):
    serializer_class = InventorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Inventory.objects.all()
        
        # Admin can see all inventory
        if IsAdmin().has_permission(self.request, self):
            return qs
            
        # Pharmacists only see their pharmacy's inventory
        if IsPharmacist().has_permission(self.request, self):
            if user.profile.pharmacy:
                return qs.filter(pharmacy=user.profile.pharmacy)
            return qs.none()
            
        # Patients see all inventory from active/approved pharmacies
        return qs.filter(pharmacy__is_active=True, quantity__gt=0)

    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def search(self, request):
        """
        Localized search for Arba Minch sectors (Sikela/Secha).
        Logs search for AI demand prediction.
        """
        query = request.query_params.get('q', '')
        sector = request.query_params.get('sector', 'All')
        
        # Log for AI analytics
        log_search(query=query, sector=sector)
        
        # Execute localized search logic
        results = search_medicines_by_sector(query=query, sector=sector)
        
        serializer = self.get_serializer(results, many=True)
        return Response(serializer.data)
