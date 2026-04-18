# 📱 Yadesa: Mobile Developer Technical Tasks

## 📅 Day 1: Project Setup & API Connection (DONE)
1.  **Project Structure**: Create folders: `lib/core/`, `lib/features/auth/`, `lib/features/search/`, `lib/features/reservations/`.
2.  **API Client Setup**:
    *   Add `http` or `dio` package to `pubspec.yaml`.
    *   Create `lib/core/api_client.dart` with `baseUrl = 'https://ethio-pharma.onrender.com/api'`.
    *   Store the JWT token securely using `flutter_secure_storage`.
3.  **Auth Screens**:
    *   Build `LoginPage` that sends `POST /api/token/` with `username` and `password`.
    *   Build `RegisterPage` that sends `POST /api/auth/register/` with `email`, `password`, and `role: "patient"`.
4.  **Medicine Search Screen**:
    *   Fetch `GET /api/inventory/?search=<query>` on text field change.
    *   Display results in a `ListView.builder` showing medicine name, price, and pharmacy.

## 📅 Day 2: Reservation Flow & Prescription Upload (TOMORROW)
1.  **Pharmacy Map View**:
    *   Add `google_maps_flutter` to `pubspec.yaml`.
    *   For each pharmacy in the search results, show a pin on the map using `location_lat` and `location_lon` from the API response.
2.  **Reserve Button Logic**:
    *   On medicine card tap, show a bottom sheet with quantity selector.
    *   Send `POST /api/reservations/` with `inventory_item`, `quantity` and `pharmacy` in the JSON body.
    *   On success, show a dialog with a **60-minute countdown timer** using a `Timer.periodic`.
3.  **Prescription Upload**:
    *   Add `image_picker` to `pubspec.yaml`.
    *   Build a camera/gallery button that sends the image via `multipart/form-data` to `POST /api/prescriptions/`.
4.  **User Reservation History**:
    *   Build `ReservationHistoryPage` that fetches `GET /api/reservations/` and shows each item with its status badge (`pending`, `fulfilled`, `cancelled`).
