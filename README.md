# SportIQ v1 (Cricket)
Your Cricket Performance. Your IQ. Django 5 + allauth (Google) + Bootstrap 5 + Chart.js.

## Run locally
    python -m venv venv && source venv/bin/activate
    pip install -r requirements.txt
    python manage.py migrate && python manage.py runserver
Open http://127.0.0.1:8000. Blank database, no demo data.

## Install as an app (PWA)
SportIQ can be installed from a supported mobile or desktop browser using its browser menu or the **Install SportIQ** button. The install prompt requires HTTPS in production (localhost is supported for local development). The service worker caches the app shell and shows an offline page when the network is unavailable; account pages and match data are not stored for offline use. On iPhone/iPad, use Safari's Share menu and choose **Add to Home Screen**.

## Google login
Google Cloud Console > OAuth client (Web). Redirect URI: `http://127.0.0.1:8000/accounts/google/login/callback/` (add your domain too).
Paste both values into the `.env` file in the project root (next to manage.py).

## Database
SQLite by default. For PostgreSQL set `DB_NAME DB_USER DB_PASSWORD DB_HOST DB_PORT`.

## Production (EC2 Free Tier + nginx + DuckDNS)
Set `DEBUG=0 SECRET_KEY=... ALLOWED_HOSTS=yourname.duckdns.org CSRF_TRUSTED_ORIGINS=https://yourname.duckdns.org`,
run `python manage.py collectstatic`, serve with gunicorn (`gunicorn sportiq.wsgi`) behind nginx, and serve /static/ from `staticfiles/`.

## Flow
Splash > 3 onboarding slides > Google login > create profile > dashboard > add match > analysis > public profile `/player/<username>/`.
Screens 1-5 use your reference images as full-bleed backgrounds with tap zones over the buttons (`core/templates/`).

## Stats and SportIQ Rating
Everything is calculated from per-match `MatchPerformance` rows (`core/stats.py`).
Rating (0-100) = mean of batting score `min(100, avg*1.6 + max(SR-80,0)*0.4)` and bowling score `min(100, wkts/inns*30 + max(0,9-econ)*7)` (only those you have), plus a fielding bonus up to 10.
`sport` fields on Profile and Match are ready for v2 sports.
