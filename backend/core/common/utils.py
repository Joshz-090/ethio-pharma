from rest_framework.response import Response

def api_response(success: bool, data=None, error=None, status=200):
    """Standardized response format for the whole team."""
    return Response({
        "success": success,
        "data": data,
        "error": error
    }, status=status)
