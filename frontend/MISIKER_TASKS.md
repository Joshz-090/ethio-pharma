# 💻 Misiker: Frontend Developer Technical Tasks

## 📅 Day 1: Project Setup & Auth (DONE)
1.  **Project Setup**:
    *   Initialize Next.js: `npx create-next-app@latest frontend --typescript`.
    *   Create `.env.local` and add `NEXT_PUBLIC_API_URL=https://ethio-pharma.onrender.com/api`.
2.  **Auth Flow**:
    *   Install `axios`: `npm install axios`.
    *   Build `pages/login.tsx` with a form that sends `POST /api/token/` and saves the returned `access` token in `localStorage`.
    *   Create `middleware.ts` that redirects unauthenticated users away from dashboard pages.
3.  **Dashboard Layout**:
    *   Create a sidebar layout component with navigation links: Dashboard, Inventory, Orders, Prescriptions.
    *   Build `pages/dashboard/inventory.tsx` that fetches `GET /api/inventory/` (with Authorization header) and renders results in a table.

## 📅 Day 2: Order Management & Analytics (TOMORROW)
1.  **Live Order Queue**:
    *   Create `pages/dashboard/orders.tsx` that fetches `GET /api/reservations/` filtered by status `pending`.
    *   For each order, show two buttons: **"Mark as Fulfilled"** (`PATCH /api/reservations/{id}/` with `status: "fulfilled"`) and **"Cancel"**.
    *   Use `setInterval` every 30 seconds to auto-refresh the order list.
2.  **Inventory Management Forms**:
    *   Build an "Add Stock" modal form that sends `POST /api/inventory/` with `medicine`, `pharmacy`, `quantity`, and `price`.
    *   Build an inline "Edit" button per row that sends `PATCH /api/inventory/{id}/` to update price or quantity.
3.  **Prescription Review Panel**:
    *   Create `pages/dashboard/prescriptions.tsx` that fetches `GET /api/prescriptions/`.
    *   Display the uploaded prescription image and an **"Approve"** button that sends `PATCH /api/prescriptions/{id}/` with `status: "approved"`.
4.  **Analytics Chart**:
    *   Install `recharts`: `npm install recharts`.
    *   Fetch `GET /api/analytics/daily-sales/` and plot a `LineChart` showing total sales per day this week.
