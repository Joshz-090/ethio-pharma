# Test Suite: Smart Med Tracker

## 🧪 Strategy
We follow a pyramid testing approach:
1.  **Unit Tests (Backend)**: Testing individual services (`services.py`).
2.  **Integration Tests (API)**: Verifying endpoints return the standard `{ success, data, error }` format.
3.  **End-to-End Tests**: Simulated user reservation workflows.

## 🛠️ Running Tests
```bash
cd backend
python manage.py test
```

## ⏱️ 1-Week Quality Goals
- Coverage for `users` (Auth) and `reservations` logic.
- Mock location tests for Arba Minch distance calculation.
