from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import GlobalMedicine, Inventory
from .serializers import GlobalMedicineSerializer, InventorySerializer
from .services.inventory_service import InventoryService
from .selectors import inventory_selectors
from common.utils import api_response

class GlobalMedicineViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Public ViewSet for searching the Global Registry.
    """
    serializer_class = GlobalMedicineSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        query = self.request.query_params.get('q', '')
        return inventory_selectors.global_medicine_search_selector(query)

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return api_response(success=True, data=serializer.data)

class InventoryViewSet(viewsets.ModelViewSet):
    """
    Verified ViewSet for Pharmacy-specific stock.
    Enforces strict logical isolation.
    """
    serializer_class = InventorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Strict isolation via Selector
        return inventory_selectors.inventory_list_selector(self.request.user.pharmacy)

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return api_response(success=True, data=serializer.data)

    def retrieve(self, request, *args, **kwargs):
        try:
            instance = inventory_selectors.inventory_get_selector(request.user.pharmacy, kwargs.get('pk'))
            serializer = self.get_serializer(instance)
            return api_response(success=True, data=serializer.data)
        except Inventory.DoesNotExist:
            return api_response(success=False, error="Inventory item not found", status=status.HTTP_404_NOT_FOUND)

    def perform_create(self, serializer):
        InventoryService().create_inventory(
            pharmacy=self.request.user.pharmacy,
            medicine=serializer.validated_data['medicine'],
            quantity_on_hand=serializer.validated_data['quantity_on_hand'],
            unit_price=serializer.validated_data['unit_price']
        )
