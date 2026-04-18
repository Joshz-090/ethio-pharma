# Setup Guide: MedLink Arba Minch

## 🛠️ Backend Setup
1. `cd backend`
2. `python -m venv venv`
3. `venv\Scripts\activate` (Windows)
4. `pip install -r requirements.txt`
5. Create `.env` based on `.env.example` (Add Supabase Credentials).
6. `python manage.py migrate`
7. `python manage.py runserver`

## 📱 Mobile Setup (Flutter)
1. `cd mobile`
2. `flutter pub get`
3. `flutter run`

## 🌐 Frontend Setup (Next.js)
1. `cd frontend`
2. `npm install`
3. `npm run dev`

## 🐋 Docker (Optional)
```bash
docker-compose up --build
```
