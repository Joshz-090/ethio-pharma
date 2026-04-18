# 🛡️ Eyasu: Backend Lead (Day 2 Tasks)

### 🎯 Objective: High-Performance Engine
We have the basics live. Today, you must build the "Senior" features that make MedLink professional.

### 📅 Tomorrow's Sprint (Day 2):
1.  **[ ] Inventory Watchdog**:
    *   Build an endpoint `GET /api/inventory/low-stock/` that specifically flags items below `threshold`.
    *   Implement an email/notification trigger when stock hits zero.
2.  **[ ] Prescription Management**:
    *   Finish the `PATCH /api/prescriptions/{id}/approve/` endpoint.
    *   Hook it up so that when a pharmacist approves, a reservation can be finalized.
3.  **[ ] Sales & Analytics**:
    *   Create a `Sales` model to track actual completions.
    *   Build `GET /api/analytics/daily/` to give pharmacists their total sales for today.
4.  **[ ] Multi-Tenant Hardening**:
    *   Double-check that a pharmacist from "Pharmacy A" cannot see reservations for "Pharmacy B."
5.  **[ ] API for AI Integration**:
    *   Support Hanan by creating an endpoint that accepts OCR text results and searches for medicines.

### ⚠️ Deadline: MUST be pushed to Main by 6:00 PM Tomorrow.
