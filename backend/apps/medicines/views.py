from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Medicine, Inventory, Review, Category, Sale
from .serializers import MedicineSerializer, InventorySerializer, ReviewSerializer, CategorySerializer, SaleSerializer
from .selectors import search_medicines_by_sector
from analytics.services import log_search
from core.common.permissions import IsAdmin, IsPharmacist, IsPatient

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

class MedicineViewSet(viewsets.ModelViewSet):
    queryset = Medicine.objects.all().prefetch_related('reviews', 'reviews__user')
    serializer_class = MedicineSerializer
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request, *args, **kwargs):
        try:
            return super().list(request, *args, **kwargs)
        except Exception as e:
            from rest_framework.response import Response
            return Response({"error": str(e), "detail": "Debug mode enabled by assistant"}, status=500)

class ReviewViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Medicine Reviews.
    """
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        review = self.get_object()
        review.likes += 1
        review.save()
        return Response({'status': 'liked', 'total_likes': review.likes})

class InventoryViewSet(viewsets.ModelViewSet):
    serializer_class = InventorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Inventory.objects.all().select_related('medicine', 'pharmacy')
        
        try:
            role = user.profile.role
            pharmacy = user.profile.pharmacy
        except (AttributeError, Exception):
            role = None
            pharmacy = None

        if role == 'admin':
            return qs
            
        if role == 'pharmacist':
            if pharmacy:
                return qs.filter(pharmacy=pharmacy)
            return qs.none()
            
        return qs.filter(pharmacy__is_active=True, quantity__gt=0)

    def perform_create(self, serializer):
        user = self.request.user
        try:
            pharmacy = user.profile.pharmacy
        except AttributeError:
            pharmacy = None
            
        if not pharmacy:
            from rest_framework.exceptions import ValidationError
            raise ValidationError("You must be assigned to a pharmacy to add stock.")
            
        serializer.save(pharmacy=pharmacy)

    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def search(self, request):
        """
        Localized search for Arba Minch sectors (Sikela/Secha).
        Logs search for AI demand prediction.
        """
        query = request.query_params.get('q', '')
        sector = request.query_params.get('sector', 'All')
        lat = request.query_params.get('lat')
        long = request.query_params.get('long')
        
        # Log for AI analytics
        log_search(query=query, user=request.user if request.user.is_authenticated else None, sector=sector)
        
        # Execute localized search logic with GPS sorting
        results = search_medicines_by_sector(
            query=query, 
            sector=sector,
            user_lat=lat,
            user_long=long
        )
        
        serializer = self.get_serializer(results, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def sell(self, request, pk=None):
        """
        Record a sale for an inventory item.
        Decrements quantity and records revenue.
        """
        inventory = self.get_object()
        sell_qty = int(request.data.get('quantity', 1))
        
        if inventory.quantity < sell_qty:
            from rest_framework.exceptions import ValidationError
            raise ValidationError("Not enough stock available.")
            
        # Create sale record
        from .models import Sale
        total_price = inventory.price * sell_qty
        
        Sale.objects.create(
            pharmacy=inventory.pharmacy,
            inventory_item=inventory,
            quantity_sold=sell_qty,
            total_price=total_price
        )
        
        # Decrement inventory
        inventory.quantity -= sell_qty
        inventory.save()
        
        serializer = self.get_serializer(inventory)
        return Response(serializer.data)

class SaleViewSet(viewsets.ReadOnlyModelViewSet):
    """
    View set to fetch all sales (intended for Admin).
    """
    queryset = Sale.objects.all().order_by('-created_at')
    serializer_class = SaleSerializer
    permission_classes = [permissions.IsAuthenticated]
