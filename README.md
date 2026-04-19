<div align="center">
  <h1>🕊️ MedLink: Arba Minch</h1>
  <p><strong>A comprehensive pharmaceutical ecosystem connecting patients, pharmacies, and healthcare professionals.</strong></p>

  <!-- Badges -->
  <img src="https://img.shields.io/badge/Django-092E20?style=for-the-badge&logo=django&logoColor=green" alt="Django" />
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/Flutter-02569B?style=for-the-badge&logo=flutter&logoColor=white" alt="Flutter" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
</div>

<br />

## 📍 Project Overview
**MedLink** is designed specifically to solve real-world healthcare challenges in the Arba Minch community (Sikela, Secha, and beyond). Our platform optimizes medicine discovery for patients, simplifies inventory management for pharmacies, and ensures the highest standards of safety through secure prescription verification.

---

## ✨ Key Features
- 🔍 **Smart Medicine Discovery**: Patients can search for life-saving medications and find the exact pharmacies in Arba Minch that have them in stock.
- 📅 **Medicine Reservations**: Reserve medications online to ensure they aren't sold out before arriving at the pharmacy.
- 📋 **Prescription Verification**: Upload prescriptions securely. Pharmacists review and approve them before dispensing restricted medications.
- 📊 **Pharmacist Dashboard**: A premium, web-based analytics dashboard for pharmacies to track inventory, low-stock alerts, reservations, and daily revenue.
- 🛡️ **Role-Based Security**: Secure JWT authentication ensuring data privacy and restricted access between Patients, Pharmacists, and Admins.

---

## 🛠️ Tech Stack
This project leverages a modern, robust tech stack:

- **Backend (API)**: Django REST Framework (Python), SQLite/PostgreSQL, JWT Auth
- **Frontend (Web Portal)**: Next.js 14 (React), TypeScript, Tailwind CSS, Framer Motion, Recharts
- **Mobile App (Patients)**: Flutter, Dart

---

## 📁 Repository Structure

*   **`/backend`**: The Django REST API core. Contains apps for Users, Pharmacies, Medicines, Reservations, and Prescriptions.
*   **`/frontend`**: The Next.js web application. This is the dedicated portal exclusively for **Pharmacies and Admins** to manage inventory and view analytics.
*   **`/pos_app`**: The Flutter mobile application (Point of Sale/Patient app). Dedicated for **Normal Users (Patients)** to search and reserve medicines.
*   **`/docs`**: Detailed architecture diagrams, API documentation, and setup guides.

---

## 🚀 Quick Start Guide

### 1. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### 2. Web Frontend (Pharmacist Dashboard)
```bash
cd frontend
npm install
npm run dev
```

### 3. Mobile App (Patient App)
```bash
cd pos_app
flutter pub get
flutter run
```

---

## 👥 Team Roadmap & Task Guides
To ensure parallel development and smooth integration, each team member has a dedicated task workspace:

| Member | Focus Area | Task Board |
| :--- | :--- | :--- |
| 🛠️ **Eyasu** | Backend API & Database | [View Tasks](./backend/EYASU_TASKS.md) |
| 📱 **Yadesa** | Mobile Application (Flutter) | [View Tasks](./pos_app/YADESA_TASKS.md) |
| 🌐 **Misiker** | Web Frontend (Next.js Dashboard) | [View Tasks](./frontend/MISIKER_TASKS.md) |
| 🧠 **Hanan** | Documentation & AI Strategy | [View Tasks](./docs/HANAN_TASKS.md) |

---

<div align="center">
  <i>Built with ❤️ for the Arba Minch Community.</i>
</div>
