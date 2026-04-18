# Smart Med Tracker: Pharmacy POS (pos_app)

## 🖥️ Role
The `pos_app` is the primary interface for **Pharmacists** in Arba Minch. It is a cross-platform (Windows & Android) application designed for high-speed inventory operations and reservation fulfillment.

## 🚀 Key Responsibilities
- **Stock Management**: Fast stock intake using the Global Medicine Catalog.
- **Reservation Processing**: Viewing and fulfilling user reservations made via the web portal.
- **Expiry Monitoring**: Visual alerts for medicines approaching expiration.
- **Offline Sync**: Caching inventory data locally to ensure the pharmacy can operate during internet outages.

## 🏗️ Flutter Architecture
- **Lib/Api**: Dio-based client calling the Django backend.
- **Lib/Providers**: Riverpod-based state management for inventory and search.
- **Lib/Screens**: 
    - `InventoryScreen`: CRUD for local stock.
    - `ReservationScreen`: List of active Holds for users.
    - `SearchScreen`: Quick lookup of global medicine registry.

## ⏱️ 1-Week Goals
- [ ] Connect to the new `inventory` and `reservations` API endpoints.
- [ ] Implement the "Reserved" list view.
- [ ] Add "Expiry Date" sorting and highlights.
