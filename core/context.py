def profile(request):
    u = request.user
    return {"profile": getattr(u, "profile", None) if u.is_authenticated else None}
