# MedLink: Arba Minch 🕊️

## 📍 Project Overview
**MedLink** is a comprehensive pharmaceutical ecosystem designed specifically for the Arba Minch community. It optimizes medicine discovery, simplifies pharmacy inventory, and ensures patient safety through prescription verification.

---

## 📁 Repository Structure

### ⚙️ /backend (Django REST API)
- **`/medlink`**: Project configuration and security settings.
- **`/apps`**: Domain-specific logic (Users, Pharmacies, Medicines, Reservations, Prescriptions).
- **`/core`**: Shared logic, base models, and custom permissions.

### 🌐 /frontend (Next.js)
- Dedicated web portal exclusively for **Pharmacies and Admins** to manage inventory, approve prescriptions, and view analytics.

### 📱 /mobile (Flutter)
- Dedicated Android application exclusively for **Normal Users (Patients)** to search for medicines, make reservations, and upload prescriptions.

### 📄 /docs (Detailed Documentation)
- Problem statement, detailed architecture, API design, and setup guides.

---

## 🚀 Quick Start
1.  **Backend**: `python manage.py runserver` (See `/docs/setup_guide.md`)
2.  **Mobile**: `flutter run`
3.  **Frontend**: `npm run dev`

---

## 👥 Team Roadmap (Assignees)
To ensure we move in parallel, each member has a dedicated task guide:
*   [🛠️ **Eyasu** (Backend)](./backend/EYASU_TASKS.md)
*   [📱 **Yadesa** (Mobile Application)](./pos_app/YADESA_TASKS.md)
*   [🌐 **Misiker** (Web Frontend)](./frontend/MISIKER_TASKS.md)
*   [🧠 **Hanan** (Docs & AI Strategy)](./docs/HANAN_TASKS.md)

---

## ✨ Why MedLink?
- **Localized**: Tailored for Sikela, Secha, and other Arba Minch sectors.
- **Secure**: JWT role-based authentication and prescription verification.
- **Smart**: Track medicine popularity and demand heatmaps in real-time.
- **Robust Docs**: Comprehensive guides to win judges' hearts. 💥
