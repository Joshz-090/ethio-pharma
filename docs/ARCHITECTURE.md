# Technical Architecture: MedLink

## 🏛️ System Overview
High-performance, modular clean architecture designed for rapid development and scalability.

## 🛠️ Tech Stack
- **Backend**: Django 4.2 + Django REST Framework (DRF)
- **Frontend**: Next.js (Pharmacy Management & Admin Dashboard)
- **Mobile**: Flutter (Patient Application)
- **Database**: PostgreSQL (Supabase)
- **Auth**: SimpleJWT (Role-based: User, Pharmacy, Admin)

## 📡 Design Patterns
1.  **Service-Selector Pattern**: Business logic resides in `services/`, and database queries in `selectors/`.
2.  **Shared Core**: A `core` app manages shared base models, custom permissions, and global utility functions.
3.  **Logical Multi-Tenancy**: Data isolation is enforced via a mandatory `pharmacy_id` filter on all inventory and reservation queries.

## 📊 Data Flow
1. Patient searches for medicine on **Mobile**.
2. **Backend Selector** queries nearby pharmacies for available stock.
3. Patient uploads prescription to **Backend** via **Mobile**.
4. **Pharmacist** receives notification on the **Web Dashboard** (Next.js), approves/denies.
5. Patient makes reservation; **Backend Service** decrements temporary stock and sets a 60-min timer.
