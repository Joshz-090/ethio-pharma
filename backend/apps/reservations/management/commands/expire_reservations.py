from django.core.management.base import BaseCommand
from django.utils import timezone
from reservations.models import Reservation
from reservations.services import cancel_reservation

class Command(BaseCommand):
    help = 'Expires reservations older than 60 minutes and restores stock'

    def handle(self, *args, **options):
        now = timezone.now()
        expired_reservations = Reservation.objects.filter(
            status='pending',
            expires_at__lt=now
        )

        count = 0
        for reservation in expired_reservations:
            try:
                cancel_reservation(reservation.id)
                # Update status to expired (cancel_reservation sets it to cancelled, 
                # we can override or just leave as cancelled)
                reservation.status = 'expired'
                reservation.save()
                count += 1
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Failed to expire {reservation.id}: {str(e)}'))

        self.stdout.write(self.style.SUCCESS(f'Successfully expired {count} reservations'))
