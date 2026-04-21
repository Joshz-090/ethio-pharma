from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Medicine, Inventory, Review
from .serializers import MedicineSerializer, InventorySerializer, ReviewSerializer
from .selectors import search_medicines_by_sector
from analytics.services import log_search
from core.common.permissions import IsAdmin, IsPharmacist, IsPatient

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
