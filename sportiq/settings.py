import os
from pathlib import Path
BASE_DIR = Path(__file__).resolve().parent.parent
from dotenv import load_dotenv
load_dotenv(BASE_DIR / ".env")  # reads GOOGLE_CLIENT_ID etc. from the .env file
SECRET_KEY = os.getenv("SECRET_KEY", "dev-insecure-change-me")
DEBUG = os.getenv("DEBUG", "1") == "1"
ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "*").split(",")
CSRF_TRUSTED_ORIGINS = [o for o in os.getenv("CSRF_TRUSTED_ORIGINS", "").split(",") if o]
INSTALLED_APPS = ["django.contrib.admin", "django.contrib.auth", "django.contrib.contenttypes",
    "django.contrib.sessions", "django.contrib.messages", "django.contrib.staticfiles", "django.contrib.sites",
    "allauth", "allauth.account", "allauth.socialaccount", "allauth.socialaccount.providers.google", "core"]
MIDDLEWARE = ["django.middleware.security.SecurityMiddleware", "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware", "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware", "django.contrib.messages.middleware.MessageMiddleware",
    "allauth.account.middleware.AccountMiddleware"]
ROOT_URLCONF = "sportiq.urls"
TEMPLATES = [{"BACKEND": "django.template.backends.django.DjangoTemplates", "DIRS": [], "APP_DIRS": True,
    "OPTIONS": {"context_processors": ["django.template.context_processors.request",
        "django.contrib.auth.context_processors.auth", "django.contrib.messages.context_processors.messages",
        "core.context.profile"]}}]
WSGI_APPLICATION = "sportiq.wsgi.application"
if os.getenv("DB_NAME"):  # PostgreSQL when DB_* env vars are set, else SQLite (Free Tier friendly)
    DATABASES = {"default": {"ENGINE": "django.db.backends.postgresql", "NAME": os.getenv("DB_NAME"),
        "USER": os.getenv("DB_USER", "postgres"), "PASSWORD": os.getenv("DB_PASSWORD", ""),
        "HOST": os.getenv("DB_HOST", "localhost"), "PORT": os.getenv("DB_PORT", "5432")}}
else:
    DATABASES = {"default": {"ENGINE": "django.db.backends.sqlite3", "NAME": BASE_DIR / "db.sqlite3"}}
TIME_ZONE = "Asia/Kolkata"; USE_TZ = True; LANGUAGE_CODE = "en"
STATIC_URL = "/static/"; STATIC_ROOT = BASE_DIR / "staticfiles"
MEDIA_URL = "/media/"; MEDIA_ROOT = BASE_DIR / "media"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
AUTHENTICATION_BACKENDS = ["django.contrib.auth.backends.ModelBackend", "allauth.account.auth_backends.AuthenticationBackend"]
SITE_ID = 1
LOGIN_URL = "/login/"; LOGIN_REDIRECT_URL = "/go/"; LOGOUT_REDIRECT_URL = "/"
ACCOUNT_LOGIN_METHODS = {"email"}; ACCOUNT_SIGNUP_FIELDS = ["email*"]; ACCOUNT_EMAIL_VERIFICATION = "none"
SOCIALACCOUNT_LOGIN_ON_GET = True; SOCIALACCOUNT_AUTO_SIGNUP = True
SOCIALACCOUNT_PROVIDERS = {"google": {"SCOPE": ["profile", "email"], "AUTH_PARAMS": {"access_type": "online"},
    "APP": {"client_id": os.getenv("GOOGLE_CLIENT_ID", ""), "secret": os.getenv("GOOGLE_CLIENT_SECRET", ""), "key": ""}}}
