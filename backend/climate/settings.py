import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()
BASE_DIR = Path(__file__).resolve().parent.parent

# Security config 

SECRET_KEY = os.getenv('SECRET_KEY')

# Uncomment on production

# HTTP Strict Transport Security (HSTS)
# SECURE_HSTS_SECONDS = 31536000  
# SECURE_HSTS_INCLUDE_SUBDOMAINS = True 
# SECURE_HSTS_PRELOAD = True  

# SSL/TLS Settings
# SECURE_SSL_REDIRECT = True 
# SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')  

# Session and Cookie Security
# SESSION_COOKIE_SECURE = True  
# SESSION_COOKIE_AGE = 1209600  
# SESSION_COOKIE_DOMAIN = '.*'  
# SESSION_COOKIE_SAMESITE = 'Lax'  
# CSRF_COOKIE_SECURE = True
# CSRF_COOKIE_DOMAIN = '.*' 
# CSRF_COOKIE_SAMESITE = 'Lax'  

# Content Security
# SECURE_CONTENT_TYPE_NOSNIFF = True  
# X_FRAME_OPTIONS = 'DENY'  

# CSRF Trusted Origins
# CSRF_TRUSTED_ORIGINS = [
#     '*',
# ]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:home",
    "http://localhost:weather",
]

# Site and Domain Settings
# SITE_DOMAIN = ''

# Debug and Allowed Hosts
DEBUG = False
ALLOWED_HOSTS = ['*']


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'weather',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
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
# https://docs.djangoproject.com/en/4.2/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}


# Password validation
# https://docs.djangoproject.com/en/4.2/ref/settings/#auth-password-validators

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
# https://docs.djangoproject.com/en/4.2/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.2/howto/static-files/

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'


STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
STATICFILES_DIRS = [
    BASE_DIR / 'climate/static',
]
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Default primary key field type
# https://docs.djangoproject.com/en/4.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

import os

# CACHES CONFIGS
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.filebased.FileBasedCache',
        'LOCATION': os.path.join(BASE_DIR, 'cache'),  
        'TIMEOUT': 3600,  
        'OPTIONS': {
            'MAX_ENTRIES': 100,  
            'COMPRESS': True,  
            'CULL_FREQUENCY': 3, 
        }
    }
    # Uncomment the following code for Redis cache in production
    # 'default': {
    #     'BACKEND': 'django_redis.cache.RedisCache',
    #     'LOCATION': 'redis://127.0.0.1:6379/1',  # Change for production Redis setup
    #     'OPTIONS': {
    #         'CLIENT_CLASS': 'django_redis.client.DefaultClient',
    #     }
    # }
}

SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
SESSION_CACHE_ALIAS = 'default'

# Test config
TEST_RUNNER = 'test_runner.PytestTestRunner'

# Log
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
    },
    'handlers': {
        'file': {
            'level': 'INFO',  
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': 'climate/Logs/log.txt',
            'maxBytes': 1024 * 1024 * 15,  
            'backupCount': 10,
            'formatter': 'verbose',
        },
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file', 'console'],
            'level': 'INFO',  
            'propagate': True,
        },
        'weather': {
            'handlers': ['file', 'console'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}

