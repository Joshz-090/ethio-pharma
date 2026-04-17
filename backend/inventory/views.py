from rest_framework import viewsets, permissions, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import GlobalMedicine, Inventory
from .serializers import GlobalMedicineSerializer, InventorySerializer
from .services.inventory_service import InventoryService

class GlobalMedicineViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Publicly searchable global medicine catalog.
    """
    queryset = GlobalMedicine.objects.all()
    serializer_class = GlobalMedicineSerializer
    permission_classes = [permissions.AllowAny]

    @action(detail=False, methods=['get'])
    def search(self, request):
        query = request.query_params.get('q', '')
        if len(query) < 2:
            return Response([])
        
        medicines = GlobalMedicine.objects.filter(
            generic_name__icontains=query
        )[:10]
        
        serializer = self.get_serializer(medicines, many=True)
        return Response(serializer.data)

class InventoryViewSet(viewsets.ModelViewSet):
    """
    Pharmacy-specific inventory management.
    """
    serializer_class = InventorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # We manually filter here to be safe and explicit, 
        # but PharmacyManager 'objects' also helps.
        return Inventory.objects.filter(pharmacy=self.request.user.pharmacy)

    def perform_create(self, serializer):
        InventoryService().create_inventory(
            pharmacy=self.request.user.pharmacy,
            medicine=serializer.validated_data['medicine'],
            quantity_on_hand=serializer.validated_data['quantity_on_hand'],
            unit_price=serializer.validated_data['unit_price']
        )
