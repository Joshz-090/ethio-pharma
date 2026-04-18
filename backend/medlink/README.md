# Backend Core Configuration

This folder contains the project-level settings and routing for the Django application.

## ⚙️ Key Files
- `settings.py`: Integrated with modular apps in `/apps/`.
- `urls.py`: Root URL configurations that delegate to app-specific URL files.

## 🛠️ Global Settings Rules
- All environment variables must be loaded from `.env`.
- Database connections use UUID v4 as default PKs.
- Multi-tenancy isolation is enforced at the middleware/middleware-utility level.
