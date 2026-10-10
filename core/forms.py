from decimal import Decimal
from io import BytesIO
import logging
from django import forms
from django.core.files.base import ContentFile
from PIL import Image
from .models import Profile, Match, MatchPerformance

logger = logging.getLogger(__name__)

def style(form):
    for f in form.fields.values():
        w = f.widget
        w.attrs["class"] = "form-check-input" if isinstance(w, forms.CheckboxInput) else ("form-select" if isinstance(w, forms.Select) else "form-control")

class ProfileForm(forms.ModelForm):
    class Meta:
        model = Profile
        fields = ["photo", "full_name", "username", "role", "batting_style", "bowling_style", "city"]
        labels = {"photo": "Profile photo"}
    def __init__(self, *a, **k):
        super().__init__(*a, **k)
        style(self)
        self.fields["photo"].widget.attrs.update({"accept": "image/*"})
    def save(self, commit=True):
        had_photo = bool(self.instance.pk and self.instance.photo)
        profile = super().save(commit=commit)
        photo = self.files.get(self.add_prefix("photo"))
        if commit and photo:
            self.create_photo_cutout(profile, photo)
        elif commit and had_photo and not profile.photo and profile.photo_cutout:
            profile.photo_cutout.delete(save=True)
        return profile

    def create_photo_cutout(self, profile, photo=None):
        photo = photo or self.files.get(self.add_prefix("photo"))
        if not photo:
            return
        if not profile.pk:
            return
        try:
            from rembg import new_session, remove
            if not getattr(self, "_rembg_session", None):
                self._rembg_session = new_session("u2netp")
            photo.open("rb")
            cutout = remove(photo.read(), session=self._rembg_session)
            with Image.open(BytesIO(cutout)) as image:
                output = BytesIO()
                image.convert("RGBA").save(output, format="PNG", optimize=True)
            old_cutout_name = profile.photo_cutout.name if profile.photo_cutout else ""
            profile.photo_cutout.save(
                f"profile-{profile.pk}.png",
                ContentFile(output.getvalue()), save=True,
            )
            if old_cutout_name and old_cutout_name != profile.photo_cutout.name:
                profile.photo_cutout.storage.delete(old_cutout_name)
        except Exception:
            logger.exception("Could not create profile photo cutout for profile %s", profile.pk)
            if profile.photo_cutout:
                profile.photo_cutout.delete(save=True)
    def clean_username(self): return self.cleaned_data["username"].lower()

class MatchForm(forms.ModelForm):
    class Meta:
        model = Match
        fields = ["date", "opponent", "venue", "fmt", "result"]
        widgets = {"date": forms.DateInput(attrs={"type": "date"}, format="%Y-%m-%d")}
    def __init__(self, *a, **k): super().__init__(*a, **k); style(self)

class PerfForm(forms.ModelForm):
    overs = forms.DecimalField(required=False, min_value=0, max_digits=5, decimal_places=1, label="Overs bowled (e.g. 3.4)")
    class Meta:
        model = MatchPerformance
        fields = ["batted", "runs", "balls_faced", "fours", "sixes", "not_out", "overs", "runs_conceded", "wickets", "maidens", "dot_balls", "catches", "run_outs", "stumpings"]
    field_order = Meta.fields
    def __init__(self, *a, **k): super().__init__(*a, **k); style(self)
    def clean_overs(self):
        o = self.cleaned_data.get("overs") or Decimal(0)
        whole = int(o); part = int(round((o - whole) * 10))
        if part > 5: raise forms.ValidationError("Use cricket notation: 3.4 means 3 overs and 4 balls (max .5).")
        self.balls = whole * 6 + part
        return o
    def clean(self):
        data = super().clean()
        if data.get("batted"):
            runs = data.get("runs") or 0
            boundary_runs = (data.get("fours") or 0) * 4 + (data.get("sixes") or 0) * 6
            if boundary_runs > runs:
                self.add_error("sixes", "Runs from fours and sixes cannot exceed the batter's total runs.")
        return data
