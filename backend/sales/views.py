from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Sale, SaleItem
from .serializers import SaleSerializer, SaleItemSerializer
from .services.sales_service import SalesService
from common.utils import api_response

class SaleViewSet(viewsets.ModelViewSet):
    serializer_class = SaleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Sale.objects.filter(pharmacy=self.request.user.pharmacy)

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return api_response(success=True, data=serializer.data)

    def perform_create(self, serializer):
        serializer.save(pharmacy=self.request.user.pharmacy)

    @action(detail=False, methods=['post'])
    def pos_sale(self, request):
        """
        Endpoint for processing POS sales.
        Uses SalesService to handle atomic multi-item transactions.
        """
        items = request.data.get('items', [])
        if not items:
            return api_response(success=False, error="No items provided", status=status.HTTP_400_BAD_REQUEST)
        
        try:
            result = SalesService().process_pos_sale(
                pharmacy=request.user.pharmacy,
                items_data=items,
                payment_method=request.data.get('payment_method', 'Cash'),
                cashier_name=request.data.get('cashier_name', request.user.username)
            )
            return api_response(success=True, data=result, status=status.HTTP_201_CREATED)
        except Exception as e:
            return api_response(success=False, error=str(e), status=status.HTTP_400_BAD_REQUEST)
