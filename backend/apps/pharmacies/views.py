from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Pharmacy
from .serializers import PharmacySerializer

class PharmacyViewSet(viewsets.ModelViewSet):
    serializer_class = PharmacySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        
        if hasattr(user, 'profile') and user.profile.role == 'admin':
            return Pharmacy.objects.all()
            
        if hasattr(user, 'profile') and user.profile.role == 'pharmacist':
            if user.profile.pharmacy:
                return Pharmacy.objects.filter(id=user.profile.pharmacy.id)
            return Pharmacy.objects.none()
            
        return Pharmacy.objects.filter(is_active=True, status='approved')

    @action(detail=False, methods=['post'], url_path='onboard')
    def onboard(self, request):
        """
        POST /api/pharmacies/onboard/
        Request body: { "name", "license_number", "address", "phone_number" }
        """
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            # Set initial status to pending
            pharmacy = serializer.save(status='pending', is_active=False)
            
            # Link the current user to this pharmacy as a pharmacist
            user = request.user
            if hasattr(user, 'profile'):
                user.profile.pharmacy = pharmacy
                user.profile.role = 'pharmacist'
                user.profile.save()
                
            return Response({
                "message": "Onboarding request submitted successfully. Waiting for admin approval.",
                "pharmacy": serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
