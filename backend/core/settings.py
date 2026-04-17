import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# 1. ENVIRONMENT VARIABLES
# ========================
# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Load .env file from the project root
ENV_PATH = BASE_DIR / '.env'
if ENV_PATH.exists():
    load_dotenv(ENV_PATH)
else:
    print(f"CRITICAL ERROR: .env file not found at {ENV_PATH}")

def get_env_variable(var_name, default=None, required=True):
    """Safely load and validate environment variables."""
    value = os.getenv(var_name, default)
    if required and not value:
        print(f"CRITICAL ERROR: Environment variable '{var_name}' is missing.")
    return value

# 3. VALIDATION LOGIC (Temporary Startup Checks)
# =============================================
REQUIRED_VARS = ['DB_NAME', 'DB_USER', 'DB_PASSWORD', 'DB_HOST', 'DB_PORT', 'SECRET_KEY', 'DEBUG']
MISSING_VARS = [v for v in REQUIRED_VARS if not os.getenv(v)]

if MISSING_VARS:
    print("-" * 50)
    print(f"VALIDATION FAILED: Missing variables: {', '.join(MISSING_VARS)}")
    print("-" * 50)
else:
    # Check Database Host (Supabase Direct vs Pooler)
    db_host = os.getenv('DB_HOST')
    db_port = os.getenv('DB_PORT')
    
    # Validation based on User Requirements
    if db_host and not db_host.startswith("db.") and not "pooler" in db_host:
        print(f"WARNING: DB_HOST '{db_host}' does not start with 'db.'. Check your Supabase settings.")
    
    if db_port not in ["5432", "6543"]:
        print(f"WARNING: DB_PORT is '{db_port}'. Expected '5432' (Direct) or '6543' (Pooler).")
        
    if not os.getenv('DB_NAME') or not os.getenv('DB_USER'):
        print("ERROR: DB_NAME or DB_USER cannot be empty.")

# 2. SETTINGS CONFIGURATION
# =========================
SECRET_KEY = get_env_variable('SECRET_KEY')

# Debug parsing
debug_val = os.getenv('DEBUG', 'False').lower()
DEBUG = debug_val in ('true', '1', 't')
print(f"SYSTEM INFO: DEBUG mode is set to {DEBUG}")

ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', '*').split(',')


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third-party apps
    'rest_framework',
    'corsheaders',

    # Local apps (Multi-tenant SaaS modules)
    'accounts',
    'pharmacies',
    'inventory',
    'sales',
    'analytics',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # VERY TOP
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'core.urls'

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

WSGI_APPLICATION = 'core.wsgi.application'


# PostgreSQL Database Configuration
# =================================
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


# Custom User Model
AUTH_USER_MODEL = 'accounts.User'


# Password validation
# https://docs.djangoproject.com/en/6.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/6.0/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


from datetime import timedelta

# REST Framework & JWT Configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',  # For browser testing
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': False,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/6.0/howto/static-files/

STATIC_URL = 'static/'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
