import random
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.utils import timezone
from django.utils.text import slugify

from catalog.models import Category, Product, ProductMedia, ProductInstance

CATS = [
    ("rings", "Rings", "RG", "Diamond Ring"),
    ("earrings", "Earrings", "ER", "Diamond Earrings"),
    ("necklaces", "Necklaces & Pendants", "NK", "Diamond Pendant"),
    ("bracelets", "Bracelets & Bangles", "BR", "Diamond Bracelet"),
    ("solitaires", "Solitaires", "SO", "Solitaire Ring"),
    ("color-stone", "Color Stone Jewellery", "CS", "Color Stone Ring"),
]

ADJ = ["Aura", "Celeste", "Vega", "Ira", "Zoya", "Meera", "Tara", "Kiara", "Nyla", "Rhea",
       "Sana", "Diya", "Aria", "Luna", "Ivy", "Maya", "Nora", "Pia", "Riya", "Sia",
       "Avni", "Bela", "Cia", "Dua", "Ela", "Fia", "Gia", "Hia", "Isha", "Jia"]

IMAGES = [
    "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1635767798638-3e25273a8236?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1611591475119-232145e143b4?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1515562108358-a04467e2014b?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1573408301182-24bc27b8058d?q=80&w=1000&auto=format&fit=crop",
]

VIDEOS = [
    "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
]

KARATS = ["14Kt", "18Kt"]
COLORS = ["Yellow", "Rose", "White"]
RING_SIZES = ["6", "8", "10", "12", "14", "16", "18", "20"]
LABS = ["IGI", "GIA"]
GRADES = [("EF", "VVS"), ("GH", "VS"), ("IJ", "SI")]

GOLD_RATE = 7000    # INR per gram (14Kt)
DIA_RATE = 45000    # INR per carat
MAKING = 3000       # flat making charges


def q3(x): return Decimal(str(round(x, 3)))   # gold: 3 decimals
def q2(x): return Decimal(str(round(x, 2)))   # diamond: 2 decimals


def price_for(net_g, dia_ct):
    return Decimal(str(int((net_g * GOLD_RATE + dia_ct * DIA_RATE + MAKING) / 100) * 100))


class Command(BaseCommand):
    help = "Seeds 6 categories x 30 products with sequenced media and physical instances"

    def handle(self, *args, **options):
        rng = random.Random(7)

        ProductInstance.objects.all().delete()
        ProductMedia.objects.all().delete()
        Product.objects.all().delete()
        Category.objects.all().delete()

        media_rows, instance_rows = [], []
        prod_no = 0

        for slug, cat_name, prefix, noun in CATS:
            cat = Category.objects.create(name=cat_name, slug=slug)

            for i in range(1, 31):
                pname = f"{ADJ[(i - 1) % len(ADJ)]} {noun}"
                is_ring = slug in ("rings", "solitaires")

                # Blueprint weights
                net14 = q3(rng.uniform(2.0, 6.5))
                melle = q2(rng.uniform(0.05, 0.40))
                pointer = q2(rng.uniform(0.30, 1.00)) if (is_ring or rng.random() < 0.4) else Decimal("0.00")
                fancy = q2(rng.uniform(0.10, 0.50)) if rng.random() < 0.35 else Decimal("0.00")
                cstone = q2(rng.uniform(0.20, 1.20)) if slug == "color-stone" else Decimal("0.00")
                dcolor, dclarity = rng.choice(GRADES)
                total_dia = float(melle + pointer + fancy)

                product = Product.objects.create(
                    design_code=f"{prefix}-{i:03d}",
                    slug=slugify(pname),
                    name=pname,
                    category=cat,
                    description=f"{pname} handcrafted in solid gold with natural {dcolor}-{dclarity} diamonds.",
                    base_net_weight_14kt=net14,
                    base_price=price_for(float(net14), total_dia),
                    diamond_weight_round_melle=melle,
                    pointer_solitaire_weight=pointer,
                    fancy_cut_weight=fancy,
                    color_stone_weight=cstone,
                    diamond_color=dcolor,
                    diamond_clarity=dclarity,
                    has_solitaire_pointer=pointer > 0,
                    has_fancy_cut=fancy > 0,
                    has_color_stone=cstone > 0,
                )
                prod_no += 1

                # Media: 3-4 images + 1 video, in display sequence
                order = 1
                start = rng.randint(0, len(IMAGES) - 1)
                for j in range(rng.randint(3, 4)):
                    media_rows.append(ProductMedia(
                        product=product, url=IMAGES[(start + j) % len(IMAGES)],
                        kind="image", sort_order=order))
                    order += 1
                media_rows.append(ProductMedia(
                    product=product, url=VIDEOS[rng.randint(0, len(VIDEOS) - 1)],
                    kind="video", sort_order=order))

                # Physical instances
                sizes = rng.sample(RING_SIZES, k=rng.randint(3, 5)) if is_ring else [None]
                batch_start = len(instance_rows)
                for karat in KARATS:
                    for color in rng.sample(COLORS, k=2):
                        chosen_sizes = rng.sample(sizes, k=min(3, len(sizes))) if is_ring else [None]
                        for size in chosen_sizes:
                            kfactor = 1.2 if karat == "18Kt" else 1.0
                            sfactor = (1.0 + (int(size) - 12) * 0.015) if size else 1.0
                            net = q3(float(net14) * kfactor * sfactor)
                            dia = q2(max(0.01, total_dia + rng.uniform(-0.02, 0.02)))
                            sold = rng.random() >= 0.75
                            instance_rows.append(ProductInstance(
                                item_code=f"YRA-{prod_no:04d}-{karat[:2]}{color[0].upper()}-{size or 'OS'}",
                                design=product, karat=karat, gold_color=color, ring_size=size,
                                actual_net_weight=net, actual_diamond_weight=dia,
                                actual_color_stone_weight=cstone,
                                price=price_for(float(net), float(dia)),
                                report_lab=rng.choice(LABS),
                                report_number=str(rng.randint(100000000, 999999999)),
                                report_color=dcolor, report_clarity=dclarity,
                                status="sold" if sold else "in_stock",
                                sold_at=timezone.now() if sold else None,
                            ))
                # Guarantee at least one purchasable piece per design
                if not any(r.status == "in_stock" for r in instance_rows[batch_start:]):
                    instance_rows[batch_start].status = "in_stock"
                    instance_rows[batch_start].sold_at = None

        ProductMedia.objects.bulk_create(media_rows)
        ProductInstance.objects.bulk_create(instance_rows)

        self.stdout.write(self.style.SUCCESS(
            f"Seeded {Category.objects.count()} categories, {Product.objects.count()} products, "
            f"{len(media_rows)} media items, {len(instance_rows)} physical instances."
        ))