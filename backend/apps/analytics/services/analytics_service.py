from analytics.selectors import analytics_selectors

class AnalyticsService:
    @staticmethod
    def get_dashboard_summary(pharmacy):
        """Aggregates all critical business metrics for the overview dashboard."""
        return {
            "fast_moving": analytics_selectors.get_fast_moving_medicines(pharmacy),
            "dead_stock": analytics_selectors.get_dead_stock(pharmacy).count(),
            "low_stock_alerts": analytics_selectors.get_low_stock_alerts(pharmacy).count(),
            "status": "ready"
        }

    @staticmethod
    def get_stock_report(pharmacy):
        """Generates a detailed report on stock health."""
        dead_stock = analytics_selectors.get_dead_stock(pharmacy)
        return {
            "dead_stock_items": [
                {
                    "name": item.medicine.generic_name,
                    "quantity": item.quantity_on_hand,
                    "last_price": float(item.unit_price)
                } for item in dead_stock
            ]
        }
