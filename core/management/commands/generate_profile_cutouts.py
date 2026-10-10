from io import BytesIO
import logging

from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand, CommandError
from PIL import Image

from core.models import Profile

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Generate and cache u2netp transparent cutouts for profiles that have photos."

    def handle(self, *args, **options):
        profiles = Profile.objects.filter(photo__gt="").filter(photo_cutout="")
        if not profiles.exists():
            self.stdout.write(self.style.SUCCESS("No profile cutouts need generating."))
            return
        try:
            from rembg import new_session, remove
            session = new_session("u2netp")
        except Exception as exc:
            raise CommandError(
                "Could not load rembg/u2netp. Install requirements.txt and retry."
            ) from exc

        success = failed = 0
        for profile in profiles.iterator():
            try:
                profile.photo.open("rb")
                result = remove(profile.photo.read(), session=session)
                with Image.open(BytesIO(result)) as image:
                    output = BytesIO()
                    image.convert("RGBA").save(output, format="PNG", optimize=True)
                profile.photo_cutout.save(
                    f"profile-{profile.pk}.png", ContentFile(output.getvalue()), save=True
                )
                success += 1
                self.stdout.write(f"Created cutout for profile {profile.pk}.")
            except Exception:
                failed += 1
                logger.exception("Could not create cutout for profile %s", profile.pk)
                self.stderr.write(self.style.WARNING(f"Skipped profile {profile.pk}; original photo remains."))
        self.stdout.write(self.style.SUCCESS(f"Finished: {success} created, {failed} failed."))
