# 💻 Ethio-Pharma POS (Desktop & Mobile)

### Overview
A cross-platform **Flutter** application designed for high-performance pharmacy operations. Primary targets are **Windows Desktop** (for cashiers) and **Android** (for mobile inventory management).

### ✨ Key Features
- **High-Speed POS**: Atomic cart-based sales with auto-calculated VAT.
- **Offline Reliability**: SQLite-based local caching for medicine search.
- **Modern UI**: Dark/Light mode support with a focus on accessibility and speed.
- **Reporting**: Daily sales summaries and low-stock visual alerts.

### 📂 Directory Structure
- `lib/core/`: 
    - `api/`: Dio-based networking with interceptors for JWT/Pharmacy-ID.
    - `theme/`: Professional pharmaceutical color palette.
- `lib/features/`:
    - `auth/`: Multi-tenant login and role discovery.
    - `pos/`: The cashier workspace (Cart, Search, Receipt Generation).
    - `inventory/`: Stock browsing and scanning.
- `lib/models/`: Clean architecture data models mirroring the Global/Local registry.
- `assets/`: Optimized brand assets and iconography.

### 🚀 Getting Started
1. **Fetch Dependencies**:
   ```bash
   flutter pub get
   ```
2. **Environment Setup**:
   Copy `.env.example` to `.env` and set your `API_BASE_URL`.
3. **Run Application**:
   ```bash
   flutter run -d windows # For desktop
   ```

### 📋 Technical Standards
- **State Management**: Provider / Riverpod.
- **Local DB**: `sqflite` for caching.
- **Design Pattern**: Feature-driven clean architecture.
