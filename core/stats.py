from .models import MatchPerformance

def _d(a, b, n=1): return round(a / b, n) if b else 0
def overs_str(b): return f"{b // 6}.{b % 6}"

def analyse(profile):
    """All figures are computed from per-match MatchPerformance records."""
    P = list(MatchPerformance.objects.filter(match__player=profile).select_related("match").order_by("match__date", "match__id"))
    bat = [p for p in P if p.batted]; bowl = [p for p in P if p.balls_bowled]
    runs = sum(p.runs for p in bat); balls = sum(p.balls_faced for p in bat)
    outs = sum(1 for p in bat if not p.not_out)
    fours = sum(p.fours for p in bat); sixes = sum(p.sixes for p in bat); bnd = fours * 4 + sixes * 6
    hs = max(bat, key=lambda p: p.runs) if bat else None
    B = dict(inn=len(bat), runs=runs, balls=balls, avg=_d(runs, len(P), 2), sr=_d(runs * 100, balls),
        hs=f"{hs.runs}{'*' if hs.not_out else ''}" if hs else "-", fifties=sum(50 <= p.runs < 100 for p in bat),
        hundreds=sum(p.runs >= 100 for p in bat), fours=fours, sixes=sixes, bpct=_d(bnd * 100, runs),
        ducks=sum(p.runs == 0 and not p.not_out for p in bat))
    bb = sum(p.balls_bowled for p in bowl); rc = sum(p.runs_conceded for p in bowl); w = sum(p.wickets for p in bowl)
    best = max(bowl, key=lambda p: (p.wickets, -p.runs_conceded)) if bowl else None
    W = dict(inn=len(bowl), overs=overs_str(bb), wkts=w, runs=rc, econ=_d(rc * 6, bb, 2), avg=_d(rc, w, 2),
        sr=_d(bb, w), best=f"{best.wickets}/{best.runs_conceded}" if best else "-", w3=sum(p.wickets >= 3 for p in bowl),
        w4=sum(p.wickets >= 4 for p in bowl),
        w5=sum(p.wickets >= 5 for p in bowl), maidens=sum(p.maidens for p in bowl),
        dotpct=_d(sum(p.dot_balls for p in bowl) * 100, bb))
    F = dict(c=sum(p.catches for p in P), ro=sum(p.run_outs for p in P), st=sum(p.stumpings for p in P))
    F["total"] = F["c"] + F["ro"] + F["st"]
    # SportIQ Rating (0-100): mean of batting & bowling scores + fielding bonus (max 10)
    bs = min(100, B["avg"] * 1.6 + max(B["sr"] - 80, 0) * .4) if bat else None
    ws = min(100, (w / len(bowl)) * 30 + max(0, 9 - W["econ"]) * 7) if bowl else None
    parts = [x for x in (bs, ws) if x is not None]
    rating = round(min(100, (sum(parts) / len(parts) if parts else 0) + min(10, F["total"] * 2)))
    last = bat[-5:]; form = _d(sum(p.runs for p in last), len(last)); avg_inn = _d(runs, len(bat))
    ins = []
    if not P: ins.append("Add your first match to unlock your analysis.")
    if bat:
        if B["sr"] >= 130: ins.append(f"Aggressive scorer: strike rate {B['sr']}.")
        elif balls and B["sr"] < 80: ins.append(f"Anchor style (SR {B['sr']}). Look to rotate strike more.")
        if B["bpct"] >= 55: ins.append(f"{B['bpct']}% of your runs come from boundaries. Add singles and twos for consistency.")
        if B["fifties"] and not B["hundreds"]: ins.append(f"{B['fifties']} fifties, no hundred yet. Focus on converting starts.")
        if B["ducks"]: ins.append(f"{B['ducks']} duck(s). Work on your first 10 balls.")
        if len(bat) >= 3 and avg_inn:
            if form >= avg_inn * 1.15: ins.append(f"In form: last {len(last)} innings average {form} vs {avg_inn} overall.")
            elif form <= avg_inn * .85: ins.append(f"Below your usual: last {len(last)} innings average {form} vs {avg_inn} overall.")
    if bowl:
        if W["econ"] <= 6: ins.append(f"Excellent economy of {W['econ']}.")
        elif W["econ"] >= 9: ins.append(f"Expensive at {W['econ']} an over. Work on lengths and variations.")
        if W["dotpct"] >= 40: ins.append(f"{W['dotpct']}% dot balls: you build real pressure.")
    S = dict(labels=[f"{p.match.date:%d %b}" for p in P], runs=[p.runs if p.batted else None for p in P],
        sr=[_d(p.runs * 100, p.balls_faced) if p.batted and p.balls_faced else None for p in P],
        wkts=[p.wickets if p.balls_bowled else None for p in P],
        econ=[_d(p.runs_conceded * 6, p.balls_bowled, 2) if p.balls_bowled else None for p in P],
        mix=[fours, sixes])
    tiles = {"Batting": [(B["runs"], "Runs"), (B["avg"], "Runs / match"), (B["sr"], "Strike rate"), (B["hs"], "High score"),
            (B["fifties"], "50s"), (B["hundreds"], "100s"), (B["fours"], "Fours"), (B["sixes"], "Sixes"), (f"{B['bpct']}%", "Boundary runs")],
        "Bowling": [(W["wkts"], "Wickets"), (W["overs"], "Overs"), (W["econ"], "Economy"), (W["avg"], "Average"),
            (W["best"], "Best figures"), (W["w3"], "3W hauls"), (W["maidens"], "Maidens"), (f"{W['dotpct']}%", "Dot balls")],
        "Fielding": [(F["c"], "Catches"), (F["ro"], "Run outs"), (F["st"], "Stumpings")]}
    return dict(matches=len(P), bat=B, bowl=W, field=F, rating=rating, insights=ins, series=S, tiles=tiles, form=form, avg_inn=avg_inn)
