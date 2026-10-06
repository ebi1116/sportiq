from django.urls import path
from . import views as v
urlpatterns = [
    path("manifest.webmanifest", v.pwa_manifest, name="pwa_manifest"),
    path("service-worker.js", v.pwa_service_worker, name="pwa_service_worker"),
    path("offline/", v.pwa_offline, name="pwa_offline"),
    path("", v.splash, name="splash"),
    path("onboarding/<int:step>/", v.onboarding, name="onboarding"),
    path("login/", v.login_page, name="login"),
    path("terms/", v.terms, name="terms"),
    path("privacy/", v.privacy, name="privacy"),
    path("go/", v.go, name="go"),
    path("setup/", v.setup, name="setup"),
    path("profile/edit/", v.edit_profile, name="edit_profile"),
    path("dashboard/", v.dashboard, name="dashboard"),
    path("player-card/", v.player_card, name="player_card"),
    path("matches/add/", v.add_match, name="add_match"),
    path("matches/<int:match_id>/edit/", v.edit_match, name="edit_match"),
    path("matches/<int:match_id>/delete/", v.delete_match, name="delete_match"),
    path("analysis/", v.analysis, name="analysis"),
    path("player/<slug:username>/", v.public_profile, name="public_profile"),
]
