import os
import sys
from pathlib import Path
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile

# Add the AI docs folder to sys.path dynamically
AI_FOLDER = settings.BASE_DIR.parent / 'docs' / 'ai'
if str(AI_FOLDER) not in sys.path:
    sys.path.append(str(AI_FOLDER))

try:
    import ocr_service
    import demand_predictor
except ImportError:
    ocr_service = None
    demand_predictor = None

class PrescriptionOCRView(APIView):
    """
    Bridge View for Hanan's OCR Service.
    Accepts an image and returns detected medicine names.
    """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        if not ocr_service:
            return Response({"error": "OCR Service not initialized. Check AI folder path."}, status=500)

        file_obj = request.FILES.get('image')
        if not file_obj:
            return Response({"error": "No image provided. Use 'image' field."}, status=400)

        # Save temporarily
        path = default_storage.save('temp_ocr.jpg', ContentFile(file_obj.read()))
        full_path = os.path.join(settings.MEDIA_ROOT, path)

        try:
            medicines = ocr_service.extract_medicine_names(full_path)
            return Response({
                "success": True,
                "medicines": medicines,
                "count": len(medicines)
            })
        except Exception as e:
            return Response({"error": str(e)}, status=500)
        finally:
            if os.path.exists(full_path):
                os.remove(full_path)

class DemandPredictionView(APIView):
    """
    Bridge View for Hanan's Demand Predictor.
    """
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        if not demand_predictor:
            return Response({"error": "Predictor Service not initialized."}, status=500)

        medicines = request.query_params.getlist('medicines')
        if not medicines:
            return Response({"error": "Provide medicine names via ?medicines=..."}, status=400)

        try:
            # We pass the local base URL
            results = demand_predictor.predict_demand(
                medicines, 
                base_url=f"http://127.0.0.1:8000/api"
            )
            return Response(results)
        except Exception as e:
            return Response({"error": str(e)}, status=500)
