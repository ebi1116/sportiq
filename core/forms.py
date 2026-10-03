from decimal import Decimal
from django import forms
from .models import Profile, Match, MatchPerformance

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
