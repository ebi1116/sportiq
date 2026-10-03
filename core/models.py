from django.conf import settings
from django.db import models
from django.utils import timezone

class Profile(models.Model):
    ROLES = [("bat", "Batter"), ("bowl", "Bowler"), ("ar", "All-rounder"), ("wk", "Wicket-keeper")]
    HANDS = [("R", "Right-hand"), ("L", "Left-hand")]
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="profile")
    username = models.SlugField(max_length=30, unique=True)
    full_name = models.CharField(max_length=100)
    sport = models.CharField(max_length=20, default="cricket", editable=False)  # v2: more sports
    role = models.CharField(max_length=5, choices=ROLES, default="ar")
    batting_style = models.CharField(max_length=1, choices=HANDS, default="R")
    bowling_style = models.CharField(max_length=60, blank=True, help_text="e.g. Right-arm medium")
    city = models.CharField(max_length=60, blank=True)
    photo = models.ImageField(upload_to="profile_photos/", blank=True)
    created = models.DateTimeField(auto_now_add=True)
    def __str__(self): return self.full_name

class Match(models.Model):
    FORMATS = [("T10", "T10"), ("T20", "T20"), ("ODI", "ODI"), ("TEST", "Test"), ("OTH", "Other")]
    RESULTS = [("W", "Won"), ("L", "Lost"), ("D", "Draw / Tie"), ("NR", "No result")]
    player = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name="matches")
    sport = models.CharField(max_length=20, default="cricket", editable=False)
    date = models.DateField(default=timezone.localdate)
    opponent = models.CharField(max_length=80)
    venue = models.CharField(max_length=80, blank=True)
    fmt = models.CharField("Format", max_length=4, choices=FORMATS, default="T20")
    result = models.CharField(max_length=2, choices=RESULTS, default="W")
    class Meta: ordering = ["-date", "-id"]
    def __str__(self): return f"{self.player} vs {self.opponent} ({self.date})"

class MatchPerformance(models.Model):
    match = models.OneToOneField(Match, on_delete=models.CASCADE, related_name="performance")
    batted = models.BooleanField(default=True)
    runs = models.PositiveSmallIntegerField(default=0)
    balls_faced = models.PositiveSmallIntegerField(default=0)
    fours = models.PositiveSmallIntegerField(default=0)
    sixes = models.PositiveSmallIntegerField(default=0)
    not_out = models.BooleanField(default=False)
    balls_bowled = models.PositiveSmallIntegerField(default=0)
    runs_conceded = models.PositiveSmallIntegerField(default=0)
    wickets = models.PositiveSmallIntegerField(default=0)
    maidens = models.PositiveSmallIntegerField(default=0)
    dot_balls = models.PositiveSmallIntegerField(default=0)
    catches = models.PositiveSmallIntegerField(default=0)
    run_outs = models.PositiveSmallIntegerField(default=0)
    stumpings = models.PositiveSmallIntegerField(default=0)
