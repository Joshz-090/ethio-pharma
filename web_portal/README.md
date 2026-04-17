# 🌐 Ethio-Pharma Public Web Portal

### Overview
A patient-facing **Next.js** portal designed for locating critical medicines across Ethiopia. It provides real-time availability and mapping to ensure patients don't have to visit multiple pharmacies manually.

### ✨ Key Features
- **Global Search**: Search the `GlobalMedicine` catalog for any drug.
- **Availability Locator**: Finder that shows which pharmacies currently have stock.
- **Map Integration**: Dynamic maps showing pharmacy locations and contact details.
- **SEO Optimized**: Built with Server-Side Rendering (SSR) for maximum visibility for local medical searches.

### 🛠️ Technical Stack
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS / Framer Motion
- **Maps**: Google Maps API / Leaflet
- **Data Fetching**: SWR / React Query for real-time stock status.

### 📂 Directory Structure
- `app/`: Main routing logic and server-side pages.
- `components/`: 
    - `search/`: The primary medicine discovery interface.
    - `maps/`: Interactive pharmacy location components.
- `services/`: API connectors for the Django Core.
- `public/`: Assets and SEO metadata.

### 🚀 Getting Started
1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Run Development Server**:
   ```bash
   npm run dev
   ```
3. **Build for Production**:
   ```bash
   npm run build
   ```

### 📋 UX Principles
- **Mobile First**: 90% of patients will access via smartphone.
- **Accessibility**: High-contrast text and clear medical terminology.
- **Speed**: Optimized bundle size for low-bandwidth environments.
