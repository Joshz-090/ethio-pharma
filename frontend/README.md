<div align="center">
  <h1>🕊️ MedLink: Pharmacist Dashboard</h1>
  <p><strong>The dedicated web portal for Arba Minch pharmacies to manage inventory, track reservations, and verify prescriptions.</strong></p>

  <!-- Badges -->
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
</div>

<br />

## 📍 Frontend Overview
This is the **Next.js frontend** for the MedLink platform. It serves as a secure, role-based dashboard strictly for Pharmacists and Administrators in the Arba Minch region. The application is designed to be highly responsive, extremely legible, and deeply integrated with our Django backend API.

---

## ✨ Key Features
- 📦 **Inventory Management**: Add, update, or remove stock. Track batches and get automated alerts for medications that are low in stock or expiring soon.
- 📅 **Reservation Fulfillment**: View reservations made by patients via the mobile app. Approve, fulfill, or cancel reservations in real-time.
- 📋 **Prescription Approval**: Securely view patient-uploaded prescriptions before dispensing restricted medications.
- 📈 **Real-Time Analytics**: Visual KPI cards and charts (powered by Recharts) showing daily revenue, popular medications, and overall pharmacy performance.
- 🎨 **Modern Healthcare UX**: A calming, high-contrast, medical-blue aesthetic specifically designed to reduce pharmacist eye strain during long shifts.

---

## 🛠️ Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS & Custom Vanilla CSS (for glassmorphism and theme variables)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Data Visualization**: Recharts

---

## 🚀 Quick Start Guide

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Ensure you have a `.env.local` file pointing to the Django backend.
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   ```

3. **Run the Development Server**
   ```bash
   npm run dev
   ```

4. **Access the Dashboard**
   Open [http://localhost:3000/pharmacist](http://localhost:3000/pharmacist) to view the pharmacist portal.

---

<div align="center">
  <i>Part of the MedLink Ecosystem • Developed by Misiker</i>
</div>
