"""
Seed the YA-RA catalog with the six-piece mockup collection.
Usage:  python manage.py seed_catalog
Idempotent — safe to run repeatedly.
"""
from django.core.management.base import BaseCommand

from catalog.models import Category, Product, ProductImage, ProductVariant

U = "https://images.unsplash.com/{}?q=80&w={}&auto=format&fit=crop"

CATEGORIES = [
    ("rings", "Rings", "Natural diamond & gold rings."),
    ("earrings", "Earrings", "Studs, huggies & drops."),
    ("necklaces", "Necklaces", "Solitaire drops & fine chains."),
    ("bracelets", "Bracelets", "Tennis bracelets & bangles."),
    ("solitaires", "Solitaires", "Engagement rings & solitaire bands."),
    ("color-stone", "Color Stone Fine", "Ruby, sapphire & emerald accents."),
]

PRODUCTS = [
    {
        "slug": "aura-solitaire-diamond-ring",
        "name": "Aura Solitaire Diamond Ring",
        "category": "rings",
        "description": "Available in 14Kt and 18Kt Solid Gold with hand-selected certified natural solitaire diamond.",
        "carat": "0.50", "diamond_quality": "GH-VS", "certification": "IGI",
        "compare_at_price": "54000", "badge": "BESTSELLER",
        "images": [("photo-1605100804763-247f67b3557e", 1000),
                   ("photo-1603561591411-07134e71a2a9", 1000)],
        "variants": [
            dict(purity="18Kt", gold_color="Yellow", ring_size=s, price="48500",
                 gold_weight_grams="3.2", gold_value="18200", diamond_value="23500",
                 making_charges="4200", gst_amount="2600")
            for s in ("12", "14", "16")
        ] + [
            dict(purity="14Kt", gold_color="Yellow", ring_size=s, price="42500",
                 gold_weight_grams="3.2", gold_value="14200", diamond_value="23500",
                 making_charges="3200", gst_amount="1600")
            for s in ("12", "14", "16")
        ],
    },
    {
        "slug": "celeste-halo-stud-earrings",
        "name": "Celeste Halo Stud Earrings",
        "category": "earrings",
        "description": "Halo-set stud earrings with pavé surround in certified natural diamonds.",
        "carat": "0.75", "diamond_quality": "GH-VS", "certification": "IGI",
        "compare_at_price": None, "badge": "",
        "images": [("photo-1635767798638-3e25273a8236", 1000)],
        "variants": [
            dict(purity="14Kt", gold_color="White", price="62000",
                 gold_weight_grams="2.8", gold_value="16000", diamond_value="38000",
                 making_charges="5000", gst_amount="3000"),
            dict(purity="18Kt", gold_color="White", price="68500",
                 gold_weight_grams="2.8", gold_value="20500", diamond_value="38000",
                 making_charges="6500", gst_amount="3500"),
        ],
    },
    {
        "slug": "lumina-emerald-cut-pendant",
        "name": "Lumina Emerald Cut Pendant",
        "category": "necklaces",
        "description": "Emerald-cut solitaire pendant on a fine cable chain.",
        "carat": "0.40", "diamond_quality": "EF-VVS", "certification": "GIA",
        "compare_at_price": "45000", "badge": "",
        "images": [("photo-1599643478518-a784e5dc4c8f", 1000)],
        "variants": [
            dict(purity="18Kt", gold_color="Rose", price="39900",
                 gold_weight_grams="2.2", gold_value="12400", diamond_value="22000",
                 making_charges="3500", gst_amount="2000"),
            dict(purity="14Kt", gold_color="Rose", price="35500",
                 gold_weight_grams="2.2", gold_value="9500", diamond_value="22000",
                 making_charges="2500", gst_amount="1500"),
        ],
    },
    {
        "slug": "riviera-diamond-tennis-bracelet",
        "name": "Riviera Diamond Tennis Bracelet",
        "category": "bracelets",
        "description": "Classic four-prong tennis bracelet in a continuous line of natural diamonds.",
        "carat": "2.10", "diamond_quality": "GH-VS", "certification": "IGI",
        "compare_at_price": None, "badge": "",
        "images": [("photo-1611591475119-232145e143b4", 1000)],
        "variants": [
            dict(purity="18Kt", gold_color="Yellow", price="135000",
                 gold_weight_grams="8.0", gold_value="45000", diamond_value="78000",
                 making_charges="8000", gst_amount="4000"),
            dict(purity="14Kt", gold_color="Yellow", price="118000",
                 gold_weight_grams="8.0", gold_value="34000", diamond_value="72000",
                 making_charges="7000", gst_amount="5000"),
        ],
    },
    {
        "slug": "eternity-diamond-band",
        "name": "Eternity Diamond Band",
        "category": "rings",
        "description": "Full-eternity band with shared-prong round brilliant diamonds.",
        "carat": "0.80", "diamond_quality": "GH-VS", "certification": "IGI",
        "compare_at_price": None, "badge": "",
        "images": [("photo-1603561591411-07134e71a2a9", 1000)],
        "variants": [
            dict(purity="14Kt", gold_color="White", ring_size=s, price="72000",
                 gold_weight_grams="3.0", gold_value="24000", diamond_value="40000",
                 making_charges="5000", gst_amount="3000")
            for s in ("12", "14", "16")
        ] + [
            dict(purity="18Kt", gold_color="White", ring_size=s, price="79500",
                 gold_weight_grams="3.0", gold_value="29500", diamond_value="40000",
                 making_charges="6500", gst_amount="3500")
            for s in ("12", "14", "16")
        ],
    },
    {
        "slug": "luna-oval-solitaire-band",
        "name": "Luna Oval Solitaire Band",
        "category": "rings",
        "description": "Oval-cut solitaire on a slim knife-edge band.",
        "carat": "0.45", "diamond_quality": "EF-VVS", "certification": "GIA",
        "compare_at_price": None, "badge": "",
        "images": [("photo-1602751584552-8ba73aad10e1", 1000)],
        "variants": [
            dict(purity="18Kt", gold_color="Rose", ring_size=s, price="55400",
                 gold_weight_grams="2.6", gold_value="17400", diamond_value="31000",
                 making_charges="4500", gst_amount="2500")
            for s in ("12", "14", "16")
        ] + [
            dict(purity="14Kt", gold_color="Rose", ring_size=s, price="49900",
                 gold_weight_grams="2.6", gold_value="13900", diamond_value="31000",
                 making_charges="3000", gst_amount="2000")
            for s in ("12", "14", "16")
        ],
    },
]


class Command(BaseCommand):
    help = "Seeds the YA-RA catalog with the mockup collection (idempotent)."

    def handle(self, *args, **options):
        cats = {}
        for i, (slug, name, desc) in enumerate(CATEGORIES):
            cats[slug], _ = Category.objects.update_or_create(
                slug=slug,
                defaults={"name": name, "description": desc,
                          "sort_order": i, "is_active": True},
            )

        for spec in PRODUCTS:
            product, _ = Product.objects.update_or_create(
                slug=spec["slug"],
                defaults={
                    "name": spec["name"],
                    "category": cats[spec["category"]],
                    "description": spec["description"],
                    "carat": spec["carat"],
                    "diamond_quality": spec["diamond_quality"],
                    "certification": spec["certification"],
                    "compare_at_price": spec["compare_at_price"],
                    "badge": spec["badge"],
                    "is_active": True,
                },
            )
            product.images.all().delete()
            for j, (pid, w) in enumerate(spec["images"]):
                ProductImage.objects.create(product=product, url=U.format(pid, w), sort_order=j)

            product.variants.all().delete()
            for v in spec["variants"]:
                ProductVariant.objects.create(product=product, stock=10, **v)

        self.stdout.write(self.style.SUCCESS(
            f"✔ Seeded {len(CATEGORIES)} categories, {len(PRODUCTS)} products, "
            f"{sum(len(p['variants']) for p in PRODUCTS)} variants."
        ))