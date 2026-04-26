from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from .selectors import get_personalized_trends, get_admin_dashboard_stats

class TrendingMedicinesView(APIView):
    """
    API Endpoint for showing global trends and user-specific history.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        limit = int(request.query_params.get('limit', 5))
        trends = get_personalized_trends(user=request.user, limit=limit)
        return Response(trends)

from .selectors import get_personalized_trends, get_admin_dashboard_stats, get_pharmacist_revenue_stats

class PharmacistRevenueView(APIView):
    """
    API Endpoint for Pharmacist Revenue and Income analytics.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if not hasattr(request.user, 'profile') or request.user.profile.role != 'pharmacist':
            return Response({"detail": "Forbidden"}, status=403)
            
        stats = get_pharmacist_revenue_stats(request.user)
        return Response(stats)

class AdminDashboardView(APIView):
    """
    API Endpoint for Admin Dashboard summary stats.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if not hasattr(request.user, 'profile') or request.user.profile.role != 'admin':
            return Response({"detail": "Forbidden"}, status=403)
            
        stats = get_admin_dashboard_stats()
        return Response(stats)
