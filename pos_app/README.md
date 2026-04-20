# Smart Med Tracker: Pharmacy POS (pos_app)

## 🖥️ Role
The `pos_app` is the primary interface for **Pharmacists** in Arba Minch. It is a cross-platform (Windows & Android) application designed for high-speed inventory operations and reservation fulfillment.

## 🚀 Key Responsibilities
- **Stock Management**: Fast stock intake using the Global Medicine Catalog.
- **Reservation Processing**: Viewing and fulfilling user reservations made via the web portal.
- **Expiry Monitoring**: Visual alerts for medicines approaching expiration.
- **Offline Sync**: Caching inventory data locally to ensure the pharmacy can operate during internet outages.

## ✅ Day 1-2 Progress Audit
- [x] Flutter Layout Skeleton (Adaptive Windows UI) completed.
- [x] Local Database (SQLite) configured for medicine registry.
- [x] Inventory CRUD operations implemented.
- [x] Global Medicine Search (Local lookup) operational.

## 🏁 Day 3: Final Integration & Offline Power (TODAY)
Today we finish the "Industrial" side of Ethio-Pharma.

1.  **Fulfillment Logic**:
    *   In `lib/screens/ReservationScreen`, add a "Mark as Picked Up" button.
    *   This must call `PATCH /api/reservations/{id}/` to finalize the stock deduction.
2.  **Robust Offline Sync**:
    *   Implement a simple local queue for "Stock Updates".
    *   When the internet (Supabase connection) returns, use a background service to push updates.
3.  **Search Performance**:
    *   Ensure the local medicine catalog search is instantaneous (under 100ms).
4.  **Final Build**:
    *   Generate the Windows `.exe` and Android `.apk` for the presentation.

## ⏱️ Day 3 Milestones
- [ ] Connect to live `inventory` and `reservations` API endpoints.
- [ ] Implement the "Reserved" list fulfillment view.
- [ ] Add "Low Stock" visual alerts (Red highlights).
- [ ] Final stress test (500 items in inventory).
