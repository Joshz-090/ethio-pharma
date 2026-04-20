# 📱 Mobile Application Plan: Yadesa

Yadesa, your goal is to transform the "POS App" skeleton into the **MedLink Patient Application**. This app is exclusively for normal users in Arba Minch.

## 🚀 Setup Instructions
1. `cd pos_app`
2. `flutter pub get`
3. Rename the project in `pubspec.yaml` to `medlink_patient`.
4. `flutter run`

## 🎯 Your Coding Tasks for Today
1.  **Rebranding**: Update the app name, colors, and logo to "MedLink Arba Minch".
2.  **Medicine Search UI**: Create a clean, beautiful search bar and list for medicines. Each item should show:
    *   Medicine Name
    *   Pharmacy Name
    *   Price
    *   Distance (Location)
3.  **Reservation Flow**:
    *   Add a "Reserve for 60 mins" button.
    *   Create a simple confirmation screen.
4.  **Auth Integration**: Use the `JWT` login flow to authenticate Patients.

## 📄 Key Files to Work On
- `lib/api/` (Update base URL to point to Eyasu's local IP or the Render URL).
- `lib/screens/medicine_search.dart` (You need to create this).
- `lib/screens/reservations.dart` (You need to create this).

## 📡 Deliverable
A working APK that can log in and display a list of medicines fetched from the Backend.
