from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Sale, SaleItem
from .serializers import SaleSerializer, SaleItemSerializer
from .services.sales_service import SalesService

class SaleViewSet(viewsets.ModelViewSet):
    serializer_class = SaleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Sale.objects.filter(pharmacy=self.request.user.pharmacy)

    def perform_create(self, serializer):
        serializer.save(pharmacy=self.request.user.pharmacy)

    def pos_sale(self, request):
        """
        Endpoint for processing POS sales.
        Uses SalesService to handle atomic multi-item transactions.
        """
        items = request.data.get('items', [])
        if not items:
            return Response({"error": "No items provided"}, status=status.HTTP_400_BAD_REQUEST)
        
        result = SalesService().process_pos_sale(
            pharmacy=request.user.pharmacy,
            items_data=items,
            payment_method=request.data.get('payment_method', 'Cash'),
            cashier_name=request.data.get('cashier_name', request.user.username)
        )
        
        return Response(result, status=status.HTTP_201_CREATED)
