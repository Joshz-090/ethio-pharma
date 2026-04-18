from rest_framework import permissions

class IsPatient(permissions.BasePermission):
    """
    Allows access only to users with 'patient' role.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            hasattr(request.user, 'profile') and 
            request.user.profile.role == 'patient'
        )

class IsPharmacist(permissions.BasePermission):
    """
    Allows access only to users with 'pharmacist' role.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            hasattr(request.user, 'profile') and 
            request.user.profile.role == 'pharmacist'
        )

class IsAdminUser(permissions.BasePermission):
    """
    Allows access only to users with 'admin' role.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            hasattr(request.user, 'profile') and 
            request.user.profile.role == 'admin'
        )
