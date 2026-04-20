from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .selectors import get_personalized_trends

class TrendingMedicinesView(APIView):
    """
    API Endpoint for showing global trends and user-specific history.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        limit = int(request.query_params.get('limit', 5))
        trends = get_personalized_trends(user=request.user, limit=limit)
        return Response(trends)
