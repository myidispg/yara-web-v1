import random
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.utils import timezone

from catalog.models import Category, Design, Product, ProductMedia, RateCard, RING_SIZES

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

VIDEOS = ["https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4"]

KARATS = ["14Kt", "18Kt"]
COLORS = ["Yellow", "Rose", "White"]
LABS = ["IGI", "GIA"]

def q3(x): return Decimal(str(round(x, 3)))
def q2(x): return Decimal(str(round(x, 2)))


class Command(BaseCommand):
    help = "Seeds categories, designs (with size refs) and physical products"

    def handle(self, *args, **options):
        rng = random.Random(7)
        rc = RateCard.get()
        bands = list(rc.grade_choices().keys()) or ["IJ/SI"]

        Product.objects.all().delete()
        ProductMedia.objects.all().delete()
        Design.objects.all().delete()
        Category.objects.all().delete()

        def price_for(net_g, dia_ct, karat, grade):
            gold_rate = float(rc.gold_rate_18kt if karat == "18Kt" else rc.gold_rate_14kt)
            gv = net_g * gold_rate
            dv = dia_ct * float(rc.rate_for_grade(grade))
            making = (gv + dv) * float(rc.making_charges_percentage) / 100
            gst = (gv + dv + making) * float(rc.gst_percentage) / 100
            return Decimal(str(int((gv + dv + making + gst) / 100) * 100))

        prod_no = 0
        for slug, cat_name, prefix, noun in CATS:
            cat = Category.objects.create(name=cat_name, slug=slug)

            for i in range(1, 31):
                pname = f"{ADJ[(i - 1) % len(ADJ)]} {noun}"
                is_ring = slug in ("rings", "solitaires", "color-stone")

                net12 = q3(rng.uniform(2.0, 6.5))
                melle = q2(rng.uniform(0.05, 0.40))
                pointer = q2(rng.uniform(0.30, 1.00)) if (is_ring or rng.random() < 0.4) else Decimal("0.00")
                fancy = q2(rng.uniform(0.10, 0.50)) if rng.random() < 0.35 else Decimal("0.00")
                cstone = q2(rng.uniform(0.20, 1.20)) if slug == "color-stone" else Decimal("0.00")

                design = Design.objects.create(
                    design_code=f"{prefix}-{i:03d}", name=pname, category=cat,
                    description=f"{pname} handcrafted in solid gold with natural diamonds.",
                    base_net_weight_14kt=net12,
                    diamond_weight_round_melle=melle,
                    pointer_solitaire_weight=pointer,
                    fancy_cut_weight=fancy,
                    color_stone_weight=cstone,
                    has_solitaire_pointer=pointer > 0,
                    has_fancy_cut=fancy > 0,
                    has_color_stone=cstone > 0,
                )
                if is_ring:
                    design.init_size_refs(float(net12), at_size=12)
                    design.save()
                prod_no += 1

                order = 1
                start = rng.randint(0, len(IMAGES) - 1)
                for j in range(rng.randint(3, 4)):
                    ProductMedia.objects.create(design=design, url=IMAGES[(start + j) % len(IMAGES)],
                                                kind="image", sort_order=order)
                    order += 1
                ProductMedia.objects.create(design=design, url=VIDEOS[0], kind="video", sort_order=order)

                sizes = rng.sample(RING_SIZES, k=rng.randint(3, 5)) if is_ring else [None]
                created = []
                for karat in KARATS:
                    for color in rng.sample(COLORS, k=2):
                        chosen = rng.sample(sizes, k=min(3, len(sizes))) if is_ring else [None]
                        for size in chosen:
                            net = design.calculate_net_weight(karat, size)
                            dia = q2(max(0.01, float(design.total_diamond_weight) + rng.uniform(-0.02, 0.02)))
                            grade = rng.choice(bands)
                            created.append(Product(
                                item_code=f"YRA-{prod_no:04d}-{karat[:2]}{color[0].upper()}-{size or 'OS'}",
                                design=design, karat=karat, gold_color=color, ring_size=size,
                                diamond_grade=grade,
                                actual_net_weight=net, actual_diamond_weight=dia,
                                actual_color_stone_weight=cstone,
                                price=price_for(float(net), float(dia), karat, grade),
                                report_lab=rng.choice(LABS),
                                report_number=str(rng.randint(100000000, 999999999)),
                                status="sold" if rng.random() >= 0.75 else "in_stock",
                            ))
                if created and not any(p.status == "in_stock" for p in created):
                    created[0].status = "in_stock"
                Product.objects.bulk_create(created)

        self.stdout.write(self.style.SUCCESS(
            f"Seeded {Category.objects.count()} categories, {Design.objects.count()} designs, "
            f"{Product.objects.count()} products."))