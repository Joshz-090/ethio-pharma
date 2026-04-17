from rest_framework.exceptions import ValidationError
from inventory.models import GlobalMedicine, Inventory

class InventoryService:
    def create_global_medicine(self, generic_name, scientific_name=None, **kwargs):
        """
        Logic to create global medicine with duplicate checks.
        """
        # Global uniqueness check
        medicines = GlobalMedicine.objects.filter(generic_name__iexact=generic_name)
        if medicines.exists():
             return medicines.first()
            
        return GlobalMedicine.objects.create(
            generic_name=generic_name, 
            scientific_name=scientific_name, 
            **kwargs
        )

    def create_inventory(self, pharmacy, medicine, quantity_on_hand, unit_price, **kwargs):
        """
        Logic to create pharmacy inventory with validation.
        """
        if not pharmacy:
            raise ValidationError("User must be linked to a Pharmacy.")

        if quantity_on_hand < 0:
            raise ValidationError("Quantity cannot be negative.")
        if unit_price <= 0:
            raise ValidationError("Price must be greater than zero.")
            
        return Inventory.objects.create(
            pharmacy=pharmacy, 
            medicine=medicine, 
            quantity_on_hand=quantity_on_hand, 
            unit_price=unit_price,
            **kwargs
        )
