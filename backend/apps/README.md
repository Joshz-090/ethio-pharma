# Backend Applications Directory

This directory contains the modular applications that power the Smart Med Tracker API. Each app is responsible for a specific domain.

## 🏗️ Folder Responsibilities

### 👤 /users
- **Purpose**: Identity and Access Management.
- **Responsibilities**: User registration, authentication (JWT), role-base access (Admin, Pharmacist, Patient), and language preferences (English/Amharic).

### 🏥 /pharmacies
- **Purpose**: Pharmacy Entity Management.
- **Responsibilities**: Managing pharmacy profiles, verification status, and geographical locations in Arba Minch.

### 💊 /medicines
- **Purpose**: Global Medicine Catalog.
- **Responsibilities**: Maintaining a standardized list of medicines (Names, Categories, Descriptions) to prevent duplicate entries and data fragmentation.

### 📦 /inventory
- **Purpose**: Stock & Supply Tracking.
- **Responsibilities**: Pharmacy-specific stock levels, expiration dates, unit pricing, and low-stock alerts.

### 📅 /reservations
- **Purpose**: Booking System.
- **Responsibilities**: Managing medicine holds for users, expiration of reservations (2-hour limit), and historical booking data.

### ⏰ /reminders
- **Purpose**: Patient Adherence.
- **Responsibilities**: Scheduling and triggering medicine reminders for mobile users.

### 📊 /analytics
- **Purpose**: Smart Tracking.
- **Responsibilities**: Search history logging, medicine popularity counting, and providing basic insights to pharmacies.

---

## 🛠️ Implementation Rules
1. **Views**: Use `views.py` only for request parsing and returning responses.
2. **Services**: All business logic (e.g., "Reserve Medicine") MUST go into `services.py` within each app.
3. **Selectors**: All DB retrieval logic (e.g., "Get Popular Medicines") MUST go into `selectors.py`.
