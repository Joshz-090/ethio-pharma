from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.utils import timezone
from django.db.models import Count, Sum, F
from reservations.models import Reservation
from sales.models import Sale
from core.common.permissions import IsPharmacist, IsAdminUser

class DailySalesView(APIView):
    """
    GET /api/analytics/daily-sales/
    Returns today's total fulfilled reservations and revenue for a pharmacy.
    Pharmacists see only their own pharmacy's data.
    Admins see all.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        today = timezone.now().date()

        # Query Sales instead of Reservations for financial data
        base_qs = Sale.objects.filter(sold_at__date=today)

        if hasattr(user, 'profile') and user.profile.role == 'admin':
            qs = base_qs
        elif hasattr(user, 'profile') and user.profile.role == 'pharmacist':
            if not user.profile.pharmacy:
                return Response({"error": "No pharmacy assigned."}, status=403)
            qs = base_qs.filter(pharmacy=user.profile.pharmacy)
        else:
            return Response({"error": "Patients cannot access analytics."}, status=403)

        summary = qs.aggregate(
            total_sales_count=Count('id'),
            total_items_sold=Sum('quantity_sold'),
            total_revenue=Sum('total_amount')
        )

        return Response({
            "date": str(today),
            "pharmacy": str(user.profile.pharmacy) if hasattr(user, 'profile') and user.profile.role == 'pharmacist' else "All",
            "total_sales_count": summary['total_sales_count'] or 0,
            "total_items_sold": summary['total_items_sold'] or 0,
            "total_revenue": float(summary['total_revenue'] or 0),
        })


class WeeklySalesView(APIView):
    """
    GET /api/analytics/weekly-sales/
    Returns the count of fulfilled orders for each of the past 7 days.
    Used by Misiker's Line Chart.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        today = timezone.now().date()

        base_qs = Sale.objects.all()

        if hasattr(user, 'profile') and user.profile.role == 'pharmacist':
            if not user.profile.pharmacy:
                return Response({"error": "No pharmacy assigned."}, status=403)
            base_qs = base_qs.filter(pharmacy=user.profile.pharmacy)
        elif not (user.is_staff or (hasattr(user, 'profile') and user.profile.role == 'admin')):
            return Response({"error": "Access denied."}, status=403)

        results = []
        for i in range(6, -1, -1):
            day = today - timezone.timedelta(days=i)
            day_data = base_qs.filter(sold_at__date=day).aggregate(
                sales=Count('id'), 
                items=Sum('quantity_sold'),
                revenue=Sum('total_amount')
            )
            results.append({
                "date": str(day),
                "sales": day_data['sales'] or 0,
                "items_sold": day_data['items'] or 0,
                "revenue": float(day_data['revenue'] or 0),
            })

        return Response({"weekly_data": results})
