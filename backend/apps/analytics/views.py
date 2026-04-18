from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from common.utils import api_response
from .services.analytics_service import AnalyticsService

class AnalyticsViewSet(viewsets.ViewSet):
    """
    Dedicated Analytics ViewSet for Dashboards and Reports.
    """
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """Returns the high-level business summary for the active pharmacy."""
        data = AnalyticsService.get_dashboard_summary(request.user.pharmacy)
        return api_response(success=True, data=data)

    @action(detail=False, methods=['get'])
    def stock_report(self, request):
        """Returns detailed stock health insights."""
        data = AnalyticsService.get_stock_report(request.user.pharmacy)
        return api_response(success=True, data=data)
