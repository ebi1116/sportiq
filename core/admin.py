from django.contrib import admin
from .models import Profile, Match, MatchPerformance
admin.site.register([Profile, Match, MatchPerformance])
