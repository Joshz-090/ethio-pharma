from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Prescription
from .serializers import PrescriptionSerializer
from core.common.permissions import IsPharmacist

class PrescriptionViewSet(viewsets.ModelViewSet):
    serializer_class = PrescriptionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        
        # Admin: All
        if hasattr(user, 'profile') and user.profile.role == 'admin':
            return Prescription.objects.all().order_by('-created_at')
            
        # Pharmacist: Only those assigned to their pharmacy
        if hasattr(user, 'profile') and user.profile.role == 'pharmacist':
            if user.profile.pharmacy:
                return Prescription.objects.filter(pharmacy=user.profile.pharmacy).order_by('-created_at')
            return Prescription.objects.none()
            
        # Patient: Their own
        return Prescription.objects.filter(user=user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['patch'], url_path='status',
            permission_classes=[IsPharmacist])
    def update_status(self, request, pk=None):
        """
        PATCH /api/prescriptions/{id}/status/
        Pharmacists use this to approve or reject a patient's prescription.
        Body: { "status": "approved" } or { "status": "rejected" }
        """
        prescription = self.get_object()
        new_status = request.data.get('status')

        # Validate the incoming status
        valid_statuses = ['approved', 'rejected']
        if new_status not in valid_statuses:
            return Response(
                {"error": f"Invalid status. Choose from: {valid_statuses}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Pharmacist can only update prescriptions in their pharmacy
        if prescription.pharmacy and prescription.pharmacy != request.user.profile.pharmacy:
            return Response(
                {"error": "You do not have permission to update this prescription."},
                status=status.HTTP_403_FORBIDDEN
            )

        prescription.status = new_status
        prescription.save()

        # If approved, find linked pending reservations and activate them
        if new_status == 'approved':
            from reservations.models import Reservation
            Reservation.objects.filter(
                user=prescription.user,
                pharmacy=prescription.pharmacy,
                status='pending'
            ).update(status='active')

        return Response({
            "id": str(prescription.id),
            "status": prescription.status,
            "message": f"Prescription has been {new_status} successfully."
        })
