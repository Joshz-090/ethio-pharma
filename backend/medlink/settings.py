import os
import sys
from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv

# 1. ENVIRONMENT VARIABLES & PATHS
# ========================
BASE_DIR = Path(__file__).resolve().parent.parent

# Insert apps directory into sys.path to allow 'users', 'pharmacies' etc. imports
sys.path.insert(0, os.path.join(BASE_DIR, 'apps'))

# Load .env file from the project root (for local development)
ENV_PATH = BASE_DIR / '.env'
if ENV_PATH.exists():
    load_dotenv(ENV_PATH)
    print("Loaded .env file from project root")
else:
    print("INFO: .env file not found, using environment variables (production mode)")

def get_env_variable(var_name, default=None, required=True):
    """Safely load and validate environment variables."""
    value = os.getenv(var_name, default)
    if required and not value:
        print(f"CRITICAL ERROR: Environment variable '{var_name}' is missing.")
    return value

# 2. CORE SETTINGS
# ===============
SECRET_KEY = get_env_variable('SECRET_KEY', default='django-insecure-build-mode-fallback', required=False)

# Debug parsing
debug_val = os.getenv('DEBUG', 'False').lower()
DEBUG = debug_val in ('true', '1', 't')
print(f"SYSTEM INFO: DEBUG mode is set to {DEBUG}")

# Handle ALLOWED_HOSTS for both development and production
allowed_hosts_env = os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1')
if 'onrender.com' in allowed_hosts_env:
    ALLOWED_HOSTS = allowed_hosts_env.split(',')
else:
    # Add Render domain to allowed hosts in production
    if not DEBUG:
        ALLOWED_HOSTS = ['ethio-pharma.onrender.com'] + allowed_hosts_env.split(',')
    else:
        ALLOWED_HOSTS = allowed_hosts_env.split(',')

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third-party apps
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'drf_spectacular',

    # Local apps (Domain Logic)
    'users',
    'pharmacies',
    'medicines',
    'reservations',
    'prescriptions',
    'analytics',
    'reminders',
    'ai_integration',
    'core',
]

SPECTACULAR_SETTINGS = {
    'TITLE': 'Ethio-Pharma MedLink API',
    'DESCRIPTION': 'Localized Pharmacy SaaS for Arba Minch sectors (Sikela/Secha)',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
}

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware', # For static files in production
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'medlink.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'medlink.wsgi.application'

# 3. DATABASE (PostgreSQL / Supabase)
# ===================================
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('DB_NAME'),
        'USER': os.getenv('DB_USER'),
        'PASSWORD': os.getenv('DB_PASSWORD'),
        'HOST': os.getenv('DB_HOST'),
        'PORT': os.getenv('DB_PORT', '5432'),
        'OPTIONS': {
            'sslmode': 'require',
        },
    }
}

# 4. AUTHENTICATION (Security Focused)
# ====================================
AUTH_USER_MODEL = 'users.User'

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

SPECTACULAR_SETTINGS = {
    'TITLE': 'Ethio-Pharma MedLink API',
    'DESCRIPTION': 'Inventory management and reservation system for Arba Minch pharmacies.',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': False,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# CORS for React Admin Portal
CORS_ALLOW_ALL_ORIGINS = DEBUG
cors_env = os.getenv('CORS_ALLOWED_ORIGINS', '')
CORS_ALLOWED_ORIGINS = [o.strip() for o in cors_env.split(',') if o.strip()] if not DEBUG else []

# 5. STATIC & MEDIA
# =================
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Media Files (User uploads: receipts, license docs)
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Deployment Security Headers
if not DEBUG:
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True

