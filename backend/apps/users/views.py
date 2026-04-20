from rest_framework import viewsets, permissions, status, generics
from rest_framework.response import Response
from .models import User, UserProfile
from .serializers import UserProfileSerializer, RegisterSerializer

class UserProfileViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Admin can see all profiles
        if self.request.user.is_staff or (hasattr(self.request.user, 'profile') and self.request.user.profile.role == 'admin'):
            return UserProfile.objects.all()
        # Users see only their own profile
        return UserProfile.objects.filter(user=self.request.user)

class RegisterView(generics.CreateAPIView):
    """
    Public registration endpoint.
    """
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "message": "User created successfully",
                "user": serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
