# Setup Guide: MedLink Arba Minch

This guide is optimized for Linux Mint and first-time team onboarding.

## 1. Prerequisites

Install core tooling:

```bash
sudo apt update
sudo apt install -y git curl python3.11 python3.11-venv python3-pip postgresql postgresql-contrib
```

Verify:

```bash
python3.11 --version
psql --version
node --version
npm --version
flutter --version
```

## 2. Clone Repository

```bash
git clone <repo-url>
cd ethio-pharma
```

## 3. Backend Setup (Django + PostgreSQL)

```bash
cd backend
python3.11 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

Create `backend/.env`:

```env
DEBUG=True
SECRET_KEY=change-this-for-prod
ALLOWED_HOSTS=127.0.0.1,localhost

DB_NAME=medlink
DB_USER=postgres
DB_PASSWORD=your-postgres-password
DB_HOST=127.0.0.1
DB_PORT=5432

CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

Create local database (once):

```bash
PGPASSWORD='your-postgres-password' psql -h 127.0.0.1 -U postgres -d postgres -c "CREATE DATABASE medlink;"
```

Apply migrations and run server:

```bash
python manage.py migrate
python manage.py runserver
```

Optional seed data for demos:

```bash
python apps/medicines/scripts/import_efda.py
python generate_test_data.py
```

## 4. Mobile Setup (Flutter POS App)

```bash
cd ../pos_app
flutter pub get
flutter run
```

Make sure `pos_app/.env` points to your backend:

```env
API_BASE_URL=http://127.0.0.1:8000/api
APP_ENV=development
```

## 5. Frontend Setup (Next.js Web Portal)

Current status: `frontend/` does not yet include a complete Next.js scaffold.

When scaffolded, setup will be:

```bash
cd ../frontend
npm install
npm run dev
```

## 6. Team Role Quick Paths

- Eyasu (Backend): APIs, models, permissions, migrations
- Yadesa (Mobile): Flutter integration and user flows
- Misiker (Web): pharmacist/admin dashboard
- Hanan (Docs + AI): architecture docs, API references, AI prototypes, pitch material

## 7. Health Checks

- Backend API root: `http://127.0.0.1:8000/api/` (401 is expected without token)
- Admin login: `http://127.0.0.1:8000/admin/login/`
- Flutter doctor: `flutter doctor -v`

## 8. Common Issues

- `database "medlink" does not exist`
	- Create DB with `CREATE DATABASE medlink;`
- `password authentication failed for user postgres`
	- Reset postgres password or update `DB_PASSWORD` in `.env`
- `Error: That port is already in use`
	- Use `python manage.py runserver 8001` or stop existing process on 8000
