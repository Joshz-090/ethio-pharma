# Smart Med Tracker: Technical Architecture & Design 🏛️

This document outlines the master architecture for the **Smart Med Tracker** ecosystem. It is designed for high efficiency, reliability in local environments (Arba Minch), and a strictly defined 1-week implementation timeline.

---

## 🏗️ 1. Core Architectural Vision
We move away from complex, over-engineered AI systems to a **Data-Driven Smart Platform**. The architecture prioritizes three things:
1.  **Speed of Search**: Finding medicine in Arba Minch sectors (Secha, Sikela) instantly.
2.  **Ease of Inventory**: Allowing pharmacists to manage stock with minimal data entry.
3.  **Scalable Simplicity**: Using the Service-Selector pattern to isolate logic.

---

## 📍 2. Localized Search Logic (Arba Minch)
Unlike generic health apps, Smart Med Tracker is hyper-localized:
- **Sector Filtering**: The system understands Arba Minch geography. Users can filter by "Nearby" or specific sectors (Sikela/Secha).
- **Distance Calculation**: The backend uses the Haversine formula (via `selectors/`) to calculate distances between the User's GPS and Pharmacy coordinates.
- **Offline-First Resilience**: The `pos_app` (Pharmacy side) is designed to handle inventory edits even when the internet is spotty, syncing when the connection is restored.

---

## 🧠 3. "Smart" Logic (Zero-Overhead Insight)
We replace complex Machine Learning with **Aggregated demand analysis**:
- **SearchHistory Engine**: Every search query is logged with a location stamp. This allows the system to tell pharmacies: "High demand for Insulin in Sikela - 50 searches in 24 hours."
- **Popularity Ranking**: Medicines are ranked by a weighted score of `(Searches * 0.3) + (Reservations * 0.7)`.
- **FAQ Chatbot**: A simple decision-tree based logic that answers common medicine availability and usage questions without requiring a GPU or complex LLM API.

---

## 🗄️ 4. The 11-Model Schema
The database (PostgreSQL) is constrained to 11 core models to ensure clear boundaries:
1.  **User**: Authentication.
2.  **UserProfile**: Roles (Patient/Pharmacist/Admin) and Language (Amharic/English).
3.  **Pharmacy**: Store profiles and verification state.
4.  **PharmacyLocation**: Precise GPS and Sector data.
5.  **Medicine**: Global registry (The source of truth).
6.  **Inventory**: Pharmacy-specific stock levels and pricing.
7.  **Reservation**: 2-hour hold system (No payment handling).
8.  **Reminder**: Patient dosage schedules.
9.  **SearchHistory**: Analytical log of user intent.
10. **MedicinePopularity**: Statistical ranking table.
11. **ChatLog**: FAQ interaction tracking.

---

## 💻 5. Tech Stack & Enforcement
- **Backend (Django/DRF)**:
    - `views/`: Only for request/response.
    - `services/`: All business logic (e.g., `reserve_medicine()`).
    - `selectors/`: All queries (e.g., `get_top_medicines()`).
- **Web (Next.js)**: Public-facing portal optimized for mobile browsers.
- **Desktop/Mobile (Flutter - pos_app)**: Cross-platform app for quick inventory scanning and management.

---

## ⏱️ 6. The 1-Week Delivery Sprint
| Day | Phase | Objective |
| :--- | :--- | :--- |
| **1-2** | **Core** | Finalize the 11 models and Auth system. |
| **3-4** | **Inventory** | Enable "Quick Add" stock and Search Selectors. |
| **5** | **Transaction** | Implement the Reservation timer and expiry logic. |
| **6** | **Engagement** | Connect the FAQ Chatbot and Reminder engine. |
| **7** | **Quality** | Performance testing index optimization (Postgres indexes). |

---

## 🔒 7. Security & Privacy
- **Tenancy**: Pharmacies can only see their own `Inventory` and `Reservations`.
- **Anonymity**: Search history is logged for analytics, but not explicitly tied to sensitive health data of the user unless a reservation is made.
