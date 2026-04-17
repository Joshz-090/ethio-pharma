from django.db import transaction
from rest_framework.exceptions import ValidationError
from inventory.models import Inventory
from sales.models import Sale, SaleItem
from decimal import Decimal

class SalesService:
    @transaction.atomic
    def create_sale(self, pharmacy, medicine, quantity):
        """
        Legacy logic for single-item sales.
        """
        return self.process_pos_sale(pharmacy, [{'medicine_id': medicine.id, 'quantity': quantity}])

    @transaction.atomic
    def process_pos_sale(self, pharmacy, items_data, payment_method='Cash', cashier_name=None):
        """
        Processes a multi-item sale, updates inventory, and creates sale records atomically.
        """
        if not pharmacy:
            raise ValidationError("User account is not linked to a pharmacy.")

        if not items_data:
            raise ValidationError("No items provided for the sale.")

        total_amount = Decimal('0.00')

        # Initial Sale record
        sale = Sale.objects.create(
            pharmacy=pharmacy,
            total_amount=0,
            payment_method=payment_method,
            cashier_name=cashier_name
        )

        receipt_items = []

        for item in items_data:
            inventory_id = item.get('inventory_id')
            qty = item.get('quantity')

            if not qty or qty <= 0:
                raise ValidationError("Invalid quantity.")

            # Concurrency check & locking
            inv_item = Inventory.objects.filter(
                id=inventory_id,
                pharmacy=pharmacy
            ).select_for_update().first()

            if not inv_item:
                raise ValidationError(f"Inventory item {inventory_id} not found.")

            if inv_item.quantity_on_hand < qty:
                raise ValidationError(f"Insufficient stock for {inv_item.medicine.generic_name}.")

            line_total = inv_item.unit_price * Decimal(str(qty))
            total_amount += line_total
            
            # Stock deduction
            inv_item.quantity_on_hand -= qty
            inv_item.save()

            # Create line item
            SaleItem.objects.create(
                sale=sale,
                inventory_item=inv_item,
                quantity=qty,
                unit_price=inv_item.unit_price,
                subtotal=line_total
            )

            receipt_items.append({
                "name": inv_item.medicine.generic_name,
                "quantity": qty,
                "subtotal": float(line_total)
            })

        # Update final amounts
        sale.total_amount = total_amount
        sale.save()

        return {
            "sale_id": sale.id,
            "total_amount": float(sale.total_amount),
            "items": receipt_items,
            "status": "success"
        }
