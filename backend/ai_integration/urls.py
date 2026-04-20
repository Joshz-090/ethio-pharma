from django.urls import path
from .views import PrescriptionOCRView, DemandPredictionView

urlpatterns = [
    path('ocr/', PrescriptionOCRView.as_view(), name='ai-ocr'),
    path('predict/', DemandPredictionView.as_view(), name='ai-predict'),
]
