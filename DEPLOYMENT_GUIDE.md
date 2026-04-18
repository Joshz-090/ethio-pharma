# Deployment & Security Checklist

## 🌍 Deployment Targets
- **Backend**: Koyeb, Render, or Railway (using `Procfile` and `runtime.txt`).
- **Database**: Supabase (Postgres).
- **Web App**: Vercel (React).

## 🔒 Security Measures
1.  **JWT Auth**: Enabled and configured with 1-hour expiry.
2.  **Environment Secrets**: All keys (DB, Secret Key) are moved to Environment Variables.
3.  **HTTPS**: `SECURE_SSL_REDIRECT` is enabled in production.
4.  **CORS**: Restricted to specific origins (React app URL) in production.
5.  **Multi-Tenancy Isolation**: Strictly enforced in Django QuerySets per user role.

## 🚀 How to Deploy (Backend)
1.  Push code to GitHub.
2.  Connect repository to your hosting provider (e.g., Render).
3.  Set Environment Variables:
    - `SECRET_KEY`: (Random string)
    - `DEBUG`: False
    - `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT` (From Supabase)
    - `ALLOWED_HOSTS`: your-app.render.com
4.  Run `python manage.py migrate` (automatic via `Procfile`).
