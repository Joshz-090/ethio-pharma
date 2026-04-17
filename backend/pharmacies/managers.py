from django.db import models

class PharmacyManager(models.Manager):
    """
    Manager to enforce pharmacy isolation.
    If 'pharmacy_id' is provided to the manager (e.g. from middleware),
    it can filter automatically. For now, it provides a 'for_pharmacy' helper.
    """
    def for_pharmacy(self, pharmacy):
        """
        Filters the queryset by the given pharmacy instance or ID.
        """
        return self.get_queryset().filter(pharmacy=pharmacy)

    def get_queryset(self):
        return super().get_queryset()
