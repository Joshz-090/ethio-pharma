from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserProfileViewSet, RegisterView

router = DefaultRouter()
router.register(r'profiles', UserProfileViewSet, basename='user-profile')

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('', include(router.urls)),
]
