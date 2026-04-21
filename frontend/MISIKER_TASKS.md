# 🌐 Web Application Plan: Misiker

Misiker, you are building the **MedLink Pharmacy & Admin Portal** using Next.js. This is where Pharmacists manage their business and Admins monitor the system.

## 🚀 Setup Instructions
1. `cd frontend`
2. Run `npx create-next-app@latest ./ --typescript --tailwind --eslint`. (Use these options when asked).
3. `npm install axios framer-motion lucide-react`
4. `npm run dev`

## 🎯 Your Coding Tasks for Today
1.  **Dashboard Shell**: Build a professional side-navigation layout (using Lucide icons).
2.  **Inventory Management Page**:
    *   Table view of the pharmacy's stock.
    *   "Update Quantity" and "Change Price" buttons.
3.  **Prescription Approval Flow**:
    *   A list of pending prescriptions uploaded by patients.
    *   Functionality to view the image and click "Approve" (Status: Approved) or "Reject" (Status: Rejected).

## 📄 Components to Build
- `/components/DashboardLayout.tsx`
- `/app/inventory/page.tsx`
- `/app/prescriptions/page.tsx`
- `/services/api.ts` (Point to Eyasu's backend).

## 📡 Deliverable
A functional web portal shell where a pharmacist can log in and see their specific inventory table.

---

## 🏗️ Next Steps: Admin Board vs Pharmacy Board

Great job on the registration and login flows! We now need two separate, distinct Dashboards. When a user logs in via `POST /api/token/`, the backend returns their profile details. Based on their `role` (either `"admin"` or `"pharmacist"`), you must route them to the correct dashboard layout. 

### 🏛️ 1. The Admin Board (Global Management)
**Who uses it:** The system owners (You/Admins) who control all of Arba Minch MedLink.
**Goal:** To approve or reject pharmacies and monitor their subscription payments.

**What to Build:**
*   **The "Registration Hall" (Pharmacy Registry):** A data table showing a list of all pharmacies that signed up.
*   **Approval Workflow:** Buttons to flip a pharmacy's status from `pending` to `approved` (after you verify their Telebirr payment).
*   **Subscription Monitor:** Red/Green color indicators for expiry dates and a button to suspend/block pharmacies that didn't pay their annual fee.

**APIs to Connect:**
*   `GET /api/pharmacies/` — Fetches the list of all pharmacies in the database.
*   `PATCH /api/pharmacies/{id}/` — Send `{"status": "approved"}` or `{"status": "suspended"}`.

### 👨‍⚕️ 2. The Pharmacist Board (Daily Shop Operations)
**Who uses it:** The individual Pharmacy owner/staff (e.g., Eyasu at Arba Minch Sikela Pharmacy).
**Goal:** To manage their specific shop's medicines, prescriptions, and app reservations.

**What to Build:**
*   **Inventory Control:** A table to view their medicines. A form to add new medicines requiring medical details (Brand, Strength, Route, Frequency, Expiry Date, Batch Number).
*   **Live Order Hub:** A screen to see live incoming reservations coming from the Yadesa's Flutter mobile app. Needs an "In-Store Pickup (Complete)" button when the patient arrives.
*   **AI Prescription Room:** A side-by-side view showing the patient's uploaded prescription photo on the left, and the AI-extracted editable text/medicines on the right for verification.
*   **Analytics Tab:** Charts showing their total sales and trending medicines.

**APIs to Connect:**
*   `GET /api/inventory/` — To show their medicine stock.
*   `POST /api/inventory/` — To add a new medicine to their shelves.
*   `GET /api/reservations/` — To load all their incoming patient reservations.
*   `PATCH /api/reservations/{id}/` — Send `{"status": "fulfilled"}` when a patient picks up the medicine.
*   `GET /api/analytics/pharmacist/` — To get data for the charts (Total sales, expiry warnings).

**⚡ Key Rule regarding Backend Security:** Because the backend is strictly *Multi-Tenant*, you do not have to worry about one pharmacy seeing another pharmacy's data! If you make a `GET /api/inventory/` call and pass the `Authorization: Bearer <token>`, the Django API automatically filters the data and *only* sends back the inventory belonging exactly to that logged-in pharmacist!
