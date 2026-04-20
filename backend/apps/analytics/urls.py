from django.urls import path
from .views import TrendingMedicinesView

urlpatterns = [
    path('trending/', TrendingMedicinesView.as_view(), name='trending-medicines'),
]
