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
    Allows access only to users with 'admin' role OR Django superusers.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        # Allow Django superadmins (manage.py createsuperuser)
        if request.user.is_staff or request.user.is_superuser:
            return True
        return bool(
            hasattr(request.user, 'profile') and 
            request.user.profile.role == 'admin'
        )
