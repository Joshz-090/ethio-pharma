from django.urls import path
from .views import DailySalesView, WeeklySalesView

urlpatterns = [
    path('daily-sales/', DailySalesView.as_view(), name='analytics-daily'),
    path('weekly-sales/', WeeklySalesView.as_view(), name='analytics-weekly'),
]
