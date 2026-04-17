from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

def custom_exception_handler(exc, context):
    """Standardized error response format: {success, data, error}"""
    response = exception_handler(exc, context)

    if response is not None:
        response.data = {
            "success": False,
            "data": None,
            "error": response.data
        }
    else:
        # For unhandled exceptions
        return Response({
            "success": False,
            "data": None,
            "error": "Internal Server Error"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return response
