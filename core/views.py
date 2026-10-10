from functools import wraps
from collections import defaultdict
import json
from pathlib import Path
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404, redirect, render
from django.http import HttpResponse
from django.utils.text import slugify
from .forms import MatchForm, PerfForm, ProfileForm
from .models import Match, MatchPerformance, Profile
from .stats import analyse

def pwa_manifest(request):
    manifest = {
        "id": "/", "name": "SportIQ - Cricket Performance", "short_name": "SportIQ",
        "description": "Track your cricket performance and improve your game.",
        "start_url": "/", "scope": "/", "display": "standalone",
        "background_color": "#08080b", "theme_color": "#09090b", "orientation": "portrait",
        "icons": [
            {"src": "/static/core/img/pwa-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any"},
            {"src": "/static/core/img/pwa-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any"},
            {"src": "/static/core/img/pwa-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"},
        ],
    }
    return HttpResponse(json.dumps(manifest), content_type="application/manifest+json")

def pwa_service_worker(request):
    worker = Path(__file__).parent / "static" / "core" / "js" / "service-worker.js"
    response = HttpResponse(worker.read_text(encoding="utf-8"), content_type="application/javascript")
    response["Service-Worker-Allowed"] = "/"
    response["Cache-Control"] = "no-cache"
    return response

def pwa_offline(request):
    return render(request, "offline.html")

def profile_required(view):
    @wraps(view)
    def wrapper(request, *a, **k):
        p = getattr(request.user, "profile", None)
        if not p: return redirect("setup")
        request.profile = p
        return view(request, *a, **k)
    return login_required(wrapper)

def splash(request):
    if request.user.is_authenticated: return redirect("go")
    return render(request, "splash.html")

def onboarding(request, step):
    step = min(max(step, 1), 3)
    return render(request, "onboarding.html", {"img": f"core/img/onb{step}.png",
        "prev": f"/onboarding/{step-1}/" if step > 1 else "/", "next": f"/onboarding/{step+1}/" if step < 3 else None})

def login_page(request):
    if request.user.is_authenticated: return redirect("go")
    return render(request, "login.html")

def terms(request):
    return render(request, "terms.html")

def privacy(request):
    return render(request, "privacy.html")

@login_required
def go(request):
    return redirect("dashboard" if hasattr(request.user, "profile") else "setup")

@login_required
def setup(request):
    if hasattr(request.user, "profile"): return redirect("dashboard")
    base = slugify(request.user.email.split("@")[0])[:24] or "player"
    name, i = base, 1
    while Profile.objects.filter(username=name).exists(): i += 1; name = f"{base}{i}"
    form = ProfileForm(request.POST or None, request.FILES or None, initial={"full_name": request.user.get_full_name(), "username": name})
    if form.is_valid():
        p = form.save(commit=False); p.user = request.user; p.save()
        form.create_photo_cutout(p)
        return redirect("dashboard")
    return render(request, "setup.html", {"form": form})

@profile_required
def edit_profile(request):
    form = ProfileForm(request.POST or None, request.FILES or None, instance=request.profile)
    if form.is_valid():
        form.save()
        messages.success(request, "Your profile has been updated.")
        return redirect("public_profile", username=request.profile.username)
    return render(request, "setup.html", {"form": form, "editing": True})

@profile_required
def dashboard(request):
    s = analyse(request.profile)
    kpis = [(s["bat"]["runs"], "Runs"), (s["bowl"]["wkts"], "Wickets"), (s["matches"], "Matches"), (s["bat"]["avg"], "Runs / match")]
    recent = request.profile.matches.select_related("performance")[:5]
    return render(request, "dashboard.html", {"s": s, "kpis": kpis, "recent": recent})

@profile_required
def add_match(request):
    mf, pf = MatchForm(request.POST or None), PerfForm(request.POST or None)
    if request.method == "POST" and mf.is_valid() and pf.is_valid():
        m = mf.save(commit=False); m.player = request.profile; m.save()
        p = pf.save(commit=False); p.match = m; p.balls_bowled = pf.balls
        if not p.batted: p.runs = p.balls_faced = p.fours = p.sixes = 0; p.not_out = False
        p.save()
        messages.success(request, "Match saved. Your stats are updated.")
        return redirect("dashboard")
    return render(request, "add_match.html", {"mf": mf, "pf": pf})

@profile_required
def edit_match(request, match_id):
    match = get_object_or_404(Match, id=match_id, player=request.profile)
    performance = get_object_or_404(MatchPerformance, match=match)
    mf = MatchForm(request.POST or None, instance=match)
    pf = PerfForm(request.POST or None, instance=performance, initial={"overs": f"{performance.balls_bowled // 6}.{performance.balls_bowled % 6}"})
    if request.method == "POST" and mf.is_valid() and pf.is_valid():
        mf.save()
        p = pf.save(commit=False)
        p.match = match
        p.balls_bowled = pf.balls
        if not p.batted:
            p.runs = p.balls_faced = p.fours = p.sixes = 0
            p.not_out = False
        p.save()
        messages.success(request, "Match updated. Your stats are refreshed.")
        return redirect("dashboard")
    return render(request, "add_match.html", {"mf": mf, "pf": pf, "editing": True, "match": match})

@profile_required
def delete_match(request, match_id):
    match = get_object_or_404(Match, id=match_id, player=request.profile)
    if request.method == "POST":
        match.delete()
        messages.success(request, "Match deleted. Your stats are updated.")
    return redirect("dashboard")

@profile_required
def analysis(request):
    return render(request, "analysis.html", {"s": analyse(request.profile), "player": request.profile})

@profile_required
def player_card(request):
    s = analyse(request.profile)
    by_opponent = defaultdict(lambda: {"runs": 0, "matches": 0})
    performances = MatchPerformance.objects.filter(match__player=request.profile).select_related("match")
    for p in performances:
        row = by_opponent[p.match.opponent]
        row["matches"] += 1
        if p.batted:
            row["runs"] += p.runs
    opponents = [{"name": name, **values} for name, values in by_opponent.items()]
    opponents.sort(key=lambda row: (-row["runs"], row["name"].lower()))
    card_data = {
        "photo": request.profile.photo_cutout.url if request.profile.photo_cutout else "",
        "original_photo": request.profile.photo.url if request.profile.photo else "",
        "logo": "/static/core/img/sportiq-cricket-logo.png",
        "background": "/static/core/img/player-card-background.png",
        "name": request.profile.full_name,
        "role": request.profile.get_role_display(),
        "country": request.profile.city or "",
        "username": request.profile.username,
        "matches": str(s["matches"]),
        "cards": {
          "Batting": [
            ["Runs", str(s["bat"]["runs"])], ["Strike Rate", str(s["bat"]["sr"])],
            ["Innings", str(s["bat"]["inn"])], ["Average", str(s["bat"]["avg"])],
            ["50s", str(s["bat"]["fifties"])], ["100s", str(s["bat"]["hundreds"])],
            ["Highest Score", str(s["bat"]["hs"])], ["4s", str(s["bat"]["fours"])],
            ["6s", str(s["bat"]["sixes"])],
          ],
          "Bowling": [
            ["Wickets", str(s["bowl"]["wkts"])], ["Economy", str(s["bowl"]["econ"])],
            ["Innings", str(s["bowl"]["inn"])], ["Overs", str(s["bowl"]["overs"])],
            ["Average", str(s["bowl"]["avg"])], ["Best Figures", str(s["bowl"]["best"])],
            ["5 Wicket Hauls", str(s["bowl"]["w5"])],
          ],
          "Matches": [
            [row["name"], f'{row["runs"]} runs · {row["matches"]} matches']
            for row in opponents
          ] or [["Matches", "No opponent data yet"]],
        },
        "stats": (
          [["Matches", str(s["matches"])], ["Wickets", str(s["bowl"]["wkts"])],
           ["Bowling Average", str(s["bowl"]["avg"])], ["Economy Rate", str(s["bowl"]["econ"])],
           ["Strike Rate", str(s["bowl"]["sr"])], ["Overs", str(s["bowl"]["overs"])],
           ["Best Bowling", str(s["bowl"]["best"])], ["4-Wicket Hauls", str(s["bowl"]["w4"])],
           ["5-Wicket Hauls", str(s["bowl"]["w5"])], ["Innings", str(s["bowl"]["inn"])]]
          if request.profile.role == "bowl" else
          [["Matches", str(s["matches"])], ["Runs", str(s["bat"]["runs"])],
           ["Batting Average", str(s["bat"]["avg"])], ["Strike Rate", str(s["bat"]["sr"])],
           ["Innings", str(s["bat"]["inn"])], ["50s", str(s["bat"]["fifties"])],
           ["100s", str(s["bat"]["hundreds"])], ["Highest Score", str(s["bat"]["hs"])],
           ["4s", str(s["bat"]["fours"])], ["6s", str(s["bat"]["sixes"])]]
        ),
    }
    return render(request, "player_card.html", {"s": s, "player": request.profile, "opponents": opponents,
        "photo_url": card_data["photo"], "card_data": card_data})

def public_profile(request, username):
    player = get_object_or_404(Profile, username=username.lower())
    return render(request, "public.html", {"s": analyse(player), "player": player})
