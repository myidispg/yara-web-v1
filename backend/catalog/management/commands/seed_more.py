"""
Seed ~50 generated dummy designs per run.
  • Same seed  → idempotent (updates existing, no duplicates)
  • New seed   → brand-new unique batch
Usage:
  python manage.py seed_more                 # batch 1 (seed 26, ~53 designs)
  python manage.py seed_more --seed 2        # batch 2 (+~53 unique)
  python manage.py seed_more --seed 3        # batch 3 (+~53 unique)
  python manage.py seed_more --seed 9 --mult 2   # one big batch (~106)
"""
import random
from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone
from django.utils.text import slugify

from catalog.models import Category, Product, ProductImage, ProductVariant

U = "https://images.unsplash.com/{}?q=80&w={}&auto=format&fit=crop"

IMAGES = {
    "rings": ["photo-1605100804763-247f67b3557e", "photo-1603561591411-07134e71a2a9",
              "photo-1602751584552-8ba73aad10e1", "photo-1515562108358-a04467e2014b"],
    "solitaires": ["photo-1605100804763-247f67b3557e", "photo-1602751584552-8ba73aad10e1"],
    "earrings": ["photo-1635767798638-3e25273a8236", "photo-1573408301182-24bc27b8058d"],
    "necklaces": ["photo-1599643478518-a784e5dc4c8f"],
    "bracelets": ["photo-1611591475119-232145e143b4"],
    "color-stone": ["photo-1599643478518-a784e5dc4c8f", "photo-1603561591411-07134e71a2a9"],
}

COUNTS = {"rings": 12, "earrings": 10, "necklaces": 9, "bracelets": 8,
          "solitaires": 6, "color-stone": 8}

DESIGNS = {
    "rings": ["Halo Ring", "Solitaire Ring", "Eternity Band", "Cathedral Ring", "Vintage Ring",
              "Pavé Band", "Three-Stone Ring", "Stackable Band", "Twisted Ring", "Cocktail Ring"],
    "solitaires": ["Engagement Ring", "Solitaire Band", "Knife-Edge Solitaire",
                   "Classic Solitaire", "Oval Solitaire", "Cathedral Solitaire"],
    "earrings": ["Stud Earrings", "Halo Stud Earrings", "Huggie Hoops", "Drop Earrings",
                 "Jacket Earrings", "Climber Earrings", "Hoop Earrings", "Chandelier Earrings"],
    "necklaces": ["Pendant", "Solitaire Drop", "Halo Pendant", "Bar Necklace",
                  "Cluster Pendant", "Fine Chain Necklace"],
    "bracelets": ["Tennis Bracelet", "Diamond Bangle", "Line Bracelet", "Halo Bracelet",
                  "Chain Bracelet", "Cuff Bracelet"],
    "color-stone": ["Ruby Ring", "Emerald Pendant", "Sapphire Studs", "Pink Sapphire Ring",
                    "Ruby Pendant", "Emerald Ring", "Sapphire Pendant", "Amethyst Ring"],
}

PREFIXES = ["Aurora", "Vera", "Isla", "Maya", "Zara", "Kiara", "Anaya", "Diya", "Elena",
            "Freya", "Gia", "Hana", "Ira", "Jiya", "Kaya", "Lila", "Mira", "Naya", "Oona",
            "Pia", "Rhea", "Sia", "Tara", "Uma", "Veda", "Wren", "Zoe", "Aisha", "Meera",
            "Nyla", "Sana", "Isha", "Riya", "Pari", "Avni", "Naina", "Lina", "Kiran",
            "Aarna", "Noor"]

CARATS = [0.18, 0.25, 0.30, 0.40, 0.50, 0.60, 0.75, 0.90, 1.00, 1.20, 1.50, 2.00]
SIZES = ["12", "14", "16"]


def breakdown(carat, quality, purity):
    """Returns (price, gold_value, diamond_value, making_charges, gst_amount)."""
    diamond = int(round(carat * (62000 if quality == "EF-VVS" else 47000), -2))
    gold = int(round((18500 if purity == "18Kt" else 13500) * (0.7 + 0.3 * min(carat, 1.5)), -2))
    making = int(round((gold + diamond) * 0.09, -2))
    gst = int(round((gold + diamond + making) * 0.03, -2))
    return gold + diamond + making + gst, gold, diamond, making, gst


class Command(BaseCommand):
    help = "Adds ~50 generated dummy designs per run (new seed = new unique batch)."

    def add_arguments(self, parser):
        parser.add_argument("--seed", type=int, default=26,
                            help="Random seed. Change it to generate a NEW unique batch.")
        parser.add_argument("--mult", type=int, default=1,
                            help="Multiplier for batch size (e.g. --mult 2 ≈ 106 designs).")

    def handle(self, *args, **options):
        random.seed(options["seed"])
        cats = {slug: Category.objects.get(slug=slug) for slug in COUNTS}
        used = set(Product.objects.values_list("slug", flat=True))
        base_time = timezone.now() - timedelta(days=200)
        created = 0

        for cat_slug, n in COUNTS.items():
            for i in range(n * options["mult"]):
                name = f"{random.choice(PREFIXES)} {random.choice(DESIGNS[cat_slug])}"
                slug = slugify(name)
                k = 2
                while slug in used:          # guarantees uniqueness across batches
                    slug = f"{slugify(name)}-{k}"
                    k += 1
                used.add(slug)

                carat = random.choice(CARATS)
                quality = random.choice(["EF-VVS", "GH-VS"])
                color = random.choice(["Yellow", "White", "Rose"])
                badge = "BESTSELLER" if i % 6 == 0 else ("NEW" if i % 7 == 0 else "")
                price_18, _, _, _, _ = breakdown(carat, quality, "18Kt")
                compare = int(round(price_18 * 1.12, -2)) if random.random() < 0.4 else None

                product, _ = Product.objects.update_or_create(
                    slug=slug,
                    defaults={
                        "name": name,
                        "category": cats[cat_slug],
                        "description": f"{name} handcrafted in 14Kt and 18Kt solid gold "
                                       f"with certified natural {quality} diamonds.",
                        "carat": carat,
                        "diamond_quality": quality,
                        "certification": random.choice(["IGI", "GIA"]),
                        "compare_at_price": compare,
                        "badge": badge,
                        "is_active": True,
                    },
                )

                pool = IMAGES[cat_slug]
                product.images.all().delete()
                for j, pid in enumerate(pool[:random.choice([1, 2])]):
                    ProductImage.objects.create(product=product, url=U.format(pid, 600), sort_order=j)

                product.variants.all().delete()
                sizes = SIZES if cat_slug in ("rings", "solitaires") else [None]
                for purity in ("18Kt", "14Kt"):
                    price, gold, diamond, making, gst = breakdown(carat, quality, purity)
                    for gold_color in ("Yellow", "Rose", "White"):
                        for size in sizes:
                            ProductVariant.objects.create(
                                product=product, purity=purity, gold_color=gold_color,
                                ring_size=size, price=price, gold_value=gold,
                                diamond_value=diamond, making_charges=making,
                                gst_amount=gst, stock=10,
                            )

                # Back-date so the original six stay "newest" on the home page
                Product.objects.filter(pk=product.pk).update(
                    created_at=base_time + timedelta(minutes=created)
                )
                created += 1

        self.stdout.write(self.style.SUCCESS(
            f"✔ Added/updated {created} designs (seed={options['seed']}, mult={options['mult']})."
        ))