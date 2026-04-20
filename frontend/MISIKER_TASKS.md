# 🏛️ Misiker's Web Integration Guide (Pharmacist & Admin Portal)

This guide provides the technical roadmap for connecting the Next.js web application to the Ethio-Pharma production backend.

## 🔗 Connection Info
- **Production URL**: `https://ethio-pharma.onrender.com/api`
- **Interactive Documentation**: `https://ethio-pharma.onrender.com/api/docs/`
- **Format**: All requests must use `Content-Type: application/json`

---

## 🛠️ Tech Stack Recommendations
- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS + ShadcnUI (for professional tables and dialogs)
- **State Management**: React Query (TanStack Query) - *Best for handling API data fetching/caching*
- **Icons**: Lucide-React
- **Charts**: Recharts (for the Analytics Dashboard)

---

## 🔐 Step 1: Authentication & Role Management
- **Endpoint**: `POST /token/` 
- **User Role Logic**: 
  - Admin: Access to Pharmacy Approval & Global Analytics.
  - Pharmacist: Access to Inventory, Sales, & AI Verification.

---

## 🛡️ Section A: The Admin Dashboard (Feature List)
- [ ] **Pharmacy Registry**: A table showing all registered shops in Arba Minch.
- [ ] **Approval Workflow**: Clickable "Approve" or "Reject" status toggle.
- [ ] **Subscription Monitor**: 
  - Visual color indicators for expiry (Green = Active, Red = Expired).
  - Manual "Extend Subscription" button for Admins after receiving cash.
- [ ] **System Suspension**: Instant "OFF" switch to block any pharmacy violating rules.

---

- [ ] **Inventory Control (New Product Entry)**:
  - **Auto-Fill**: Search/Select from the Master Catalog to keep names consistent.
  - **Medical Details**: Capture `brand` (e.g. Panadol), `strength` (500mg), `route` (PO), `frequency` (BID), and `duration` (10 days).
  - **Safety**: Capture `expiry_date` (Show red if expired!) and `batch_number`.
  - **Advice**: Add Custom Advice to the `usage_instructions` field.
- [ ] **AI Prescription Room**: 
  - A side-by-side view: **[Original Photo]** | **[Editable AI List]**.
  - A "Verify & Save" button to finalize the data.
- [ ] **Live Order Hub**:
  - List of active reservations coming from Yadesa's mobile app.
  - "In-Store Pickup" button to mark a medication as sold.
- [ ] **BI Analytics Tab**:
  - "Demand Heatmap": Show what drugs are trending in the user's specific sector (Sikela/Secha).

---

## 📅 Section C: Subscription Warning Logic (Build this in Frontend)
Calculate `days_left = (subscription_expiry - today)`.
| Days Left | UI Behavior |
| :--- | :--- |
| 30 Days | Sticky Header: "Subscription expires in 30 days. Contact Admin." |
| 15 Days | Side Modal Popup on login. |
| 5 - 1 Days | Glowing Red Banner + Daily Alert. |
| 0 Days | Block Dashboard: "System Suspended. Please pay your yearly fee." |

---

### 💡 API Interceptor Code (Copy-Paste)
```typescript
import axios from 'axios';

const api = axios.create({ baseURL: 'https://ethio-pharma.onrender.com/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
```

**Misiker, your mission is to build a system that manages itself! 🚀**
