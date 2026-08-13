from django.core.management.base import BaseCommand

from catalog.models import RateCard


class Command(BaseCommand):
    help = "Set or view the global rate card"

    def add_arguments(self, parser):
        parser.add_argument("--gold-14kt", type=float, help="14Kt gold rate per gram (INR)")
        parser.add_argument("--gold-18kt", type=float, help="18Kt gold rate per gram (INR)")
        parser.add_argument("--diamond", type=float, help="Diamond rate per carat (INR)")
        parser.add_argument("--making", type=float, help="Making charges percentage, e.g. 15.0")
        parser.add_argument("--gst", type=float, help="GST percentage, e.g. 3.0")

    def handle(self, *args, **options):
        rc = RateCard.get()
        keys = ["gold_14kt", "gold_18kt", "diamond", "making", "gst"]
        if any(options.get(k) is not None for k in keys):
            if options.get("gold_14kt") is not None:
                rc.gold_rate_14kt = options["gold_14kt"]
            if options.get("gold_18kt") is not None:
                rc.gold_rate_18kt = options["gold_18kt"]
            if options.get("diamond") is not None:
                rc.diamond_rate_per_carat = options["diamond"]
            if options.get("making") is not None:
                rc.making_charges_percentage = options["making"]
            if options.get("gst") is not None:
                rc.gst_percentage = options["gst"]
            rc.save()
            self.stdout.write(self.style.SUCCESS("Rate card updated."))

        self.stdout.write(f"  14Kt Gold: Rs {rc.gold_rate_14kt}/g")
        self.stdout.write(f"  18Kt Gold: Rs {rc.gold_rate_18kt}/g")
        self.stdout.write(f"  Diamond:   Rs {rc.diamond_rate_per_carat}/ct")
        self.stdout.write(f"  Making:    {rc.making_charges_percentage} percent")
        self.stdout.write(f"  GST:       {rc.gst_percentage} percent")