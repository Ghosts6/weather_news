import os
from pathlib import Path
from dotenv import load_dotenv
import dj_database_url
from datetime import timedelta

load_dotenv()
BASE_DIR = Path(__file__).resolve().parent.parent

# Security config 

SECRET_KEY = os.getenv('SECRET_KEY')


# --- SECURITY SETTINGS ---
# In production, uncomment

# HTTP Strict Transport Security (HSTS)
# SECURE_HSTS_SECONDS = 31536000  # 1 year
# SECURE_HSTS_INCLUDE_SUBDOMAINS = True
# SECURE_HSTS_PRELOAD = True

# SSL/TLS Settings
# SECURE_SSL_REDIRECT = True
# SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# Session and Cookie Security
# SESSION_COOKIE_SECURE = True
# SESSION_COOKIE_AGE = 1209600  # 2 weeks
# SESSION_COOKIE_DOMAIN = '.*'
# SESSION_COOKIE_SAMESITE = 'Lax'
# CSRF_COOKIE_SECURE = True
# CSRF_COOKIE_DOMAIN = '.*'
# CSRF_COOKIE_SAMESITE = 'Lax'

# Content Security
# SECURE_CONTENT_TYPE_NOSNIFF = True
# X_FRAME_OPTIONS = 'DENY'

# CSRF Trusted Origins
# CSRF_TRUSTED_ORIGINS = ['*']


CORS_ALLOWED_ORIGINS = os.getenv('CORS_ALLOWED_ORIGINS', 'http://localhost:3001,http://127.0.0.1:3001').split(',')

# Site and Domain Settings
# SITE_DOMAIN = ''

# Debug and Allowed Hosts
DEBUG = os.getenv('DJANGO_DEBUG', 'False') == 'True'
ALLOWED_HOSTS = os.getenv('DJANGO_ALLOWED_HOSTS', '127.0.0.1,localhost,backend').split(',')


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'knox',
    'authentication',
    'weather',
    'corsheaders',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'weather.middleware.ExceptionHandlingMiddleware',
]

ROOT_URLCONF = 'climate.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [
                os.path.join(BASE_DIR, 'climate/Template'), ],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'climate.wsgi.application'


# Database

DATABASES = {
    'default': dj_database_url.config(
        default=f"sqlite:///{BASE_DIR / 'db.sqlite3'}"
    )
}


# Password validation

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

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'


STATIC_URL = '/static/'

# Default primary key field type

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# CACHES CONFIGS
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': os.getenv('REDIS_URL', 'redis://127.0.0.1:6379/1'),
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        }
    }
}

SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
SESSION_CACHE_ALIAS = 'default'

# Test config
TEST_RUNNER = 'test_runner.PytestTestRunner'

LOG_DIR = os.path.join(BASE_DIR, 'climate', 'Logs')
os.makedirs(LOG_DIR, exist_ok=True)

# Log
LOG_LEVEL = os.getenv('DJANGO_LOG_LEVEL', 'INFO').upper()

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '[%(asctime)s] [%(levelname)s] [%(name)s:%(lineno)s] %(message)s',
            'datefmt': '%Y-%m-%d %H:%M:%S'
        },
        'simple': {
            'format': '[%(asctime)s] [%(levelname)s] %(message)s',
            'datefmt': '%Y-%m-%d %H:%M:%S'
        },
        'json': {
            '()': 'pythonjsonlogger.json.JsonFormatter', # Corrected this
            'format': '%(asctime)s %(name)s %(levelname)s %(message)s %(lineno)s %(pathname)s'
        },
    },
    'handlers': {
        'file': {
            'level': LOG_LEVEL,
            'class': 'weather.custom_logging.GzipTimedRotatingFileHandler',
            'filename': os.path.join(LOG_DIR, 'log.txt'),
            'when': 'D',
            'interval': 1,
            'backupCount': 5,
            'formatter': 'verbose',
        },
        'console': {
            'level': LOG_LEVEL,
            'class': 'logging.StreamHandler',
            'formatter': 'simple' if DEBUG else 'json',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file', 'console'],
            'level': LOG_LEVEL,
            'propagate': True,
        },
        'weather': {
            'handlers': ['file', 'console'],
            'level': LOG_LEVEL,
            'propagate': False,
        },
    },
}

# REST FRAMEWORK SETTINGS # Added these
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': ('knox.auth.TokenAuthentication',),
}

# KNOX SETTINGS
# Timeout for tokens (e.g., 10 hours)
KNOX = {
    "TOKEN_TTL": timedelta(hours=10),
    "AUTH_HEADER_PREFIX": "Token",
}