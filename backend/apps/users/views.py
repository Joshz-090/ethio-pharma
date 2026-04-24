from rest_framework import viewsets, permissions, status, generics
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.exceptions import AuthenticationFailed
from django.contrib.auth import authenticate
from .models import User, UserProfile
from .serializers import UserProfileSerializer, RegisterSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        username = attrs.get(self.username_field)
        password = attrs.get('password')
        
        user = authenticate(username=username, password=password)
        
        # If authentication failed, check if it's because the user is inactive
        if user is None:
            try:
                temp_user = User.objects.get(username=username)
                if temp_user.check_password(password) and not temp_user.is_active:
                    raise AuthenticationFailed(
                        {"detail": "Your account is pending admin approval.", "code": "account_pending"},
                        code="account_pending"
                    )
            except User.DoesNotExist:
                pass
                
        return super().validate(attrs)

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class UserProfileViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Admin can see all profiles
        if self.request.user.is_staff:
            return UserProfile.objects.all()
        # Users see only their own profile
        return UserProfile.objects.filter(user=self.request.user)

    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user's profile"""
        try:
            profile = UserProfile.objects.get(user=request.user)
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        except UserProfile.DoesNotExist:
            # Create profile if it doesn't exist
            profile = UserProfile.objects.create(
                user=request.user,
                role='admin' if request.user.is_staff else 'pharmacist'
            )
            serializer = self.get_serializer(profile)
            return Response(serializer.data)

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
