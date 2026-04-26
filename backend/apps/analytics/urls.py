from django.urls import path
from .views import TrendingMedicinesView, AdminDashboardView, PharmacistRevenueView

urlpatterns = [
    path('trending/', TrendingMedicinesView.as_view(), name='trending-medicines'),
    path('admin/', AdminDashboardView.as_view(), name='admin-dashboard'),
    path('pharmacist/', PharmacistRevenueView.as_view(), name='pharmacist-dashboard'),
]
