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
