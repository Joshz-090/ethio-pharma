# 🚀 Ethio-Pharma 1-Week Sprint (4-Person Team)

**Goal**: Launch a functional MVP (Public Search + Pharmacy POS + Analytics) in 7 days.

---

## 👥 The Roles

### **Developer 1: Backend & Infrastructure (The Foundation)**
*   **Focus**: Django, PostgreSQL, Multi-tenancy, Auth.
*   **Tasks**:
    *   **Day 1-2**: Finalize multi-tenant models and middleware. Setup Supabase connections.
    *   **Day 3-4**: Implement JWT Auth, Pharmacy Onboarding, and Global Medicine Catalog.
    *   **Day 5**: Build Sales & Transaction API with inventory deduction logic.
    *   **Day 6-7**: Deploy to Koyeb/Render, setup CI/CD, and assist others with API integration.

### **Developer 2: Frontend Web (The Public Face)**
*   **Focus**: Next.js, Search Engine, Maps.
*   **Tasks**:
    *   **Day 1-2**: Setup Next.js project and Landing Page (SEO optimized).
    *   **Day 3-4**: Build the Medicine Search interface. Implement "Search by Location."
    *   **Day 5**: Integrate Google Maps or OpenStreetMap to show pharmacy locations.
    *   **Day 6-7**: Responsive design polish, SEO meta tags, and Vercel deployment.

### **Developer 3: Desktop/POS (The Operations)**
*   **Focus**: Flutter, SQLite, Local Sync.
*   **Tasks**:
    *   **Day 1-2**: Finalize Flutter Desk UI (Adaptive Layout for Windows).
    *   **Day 3-4**: Implement SQLite local cache for offline search. Build the "Add to Cart" flow.
    *   **Day 5**: Implement Receipt Printing (Thermal printer support) and Transaction History.
    *   **Day 6-7**: Sync engine (Offline-to-Cloud sync) and final Windows `.exe` build.

### **Developer 4: Data, AI & Alerts (The Brain)**
*   **Focus**: Analytics, Stock Prediction, Reporting.
*   **Tasks**:
    *   **Day 1-2**: Setup the "Daily Aggregation" logic in Django (Analytics app).
    *   **Day 3-4**: Build basic demand prediction (Statistical) and "Low Stock" alert engine.
    *   **Day 5**: Implement Reporting (Z-Report, Monthly Sales summary).
    *   **Day 6-7**: Integrate SMS/Email notifications for stock alerts and final testing.

---

## 📅 Daily Sync Schedule
*   **09:00 AM**: Standup (What did I do? What will I do? Blockers?)
*   **01:00 PM**: Backend/Frontend contract review (Are APIs working as expected?)
*   **06:00 PM**: Code Review & Merge into `main`.

---

## ⚔️ Integration Milestones
*   **Milestone 1 (Wed Night)**: Backend and POS are talking. End-to-end Pharmacy login and Stock view works.
*   **Milestone 2 (Fri Night)**: Public Web Portal searching real data from the Backend.
*   **Milestone 3 (Sun Night)**: Final MVP ready for Hackathon presentation.
