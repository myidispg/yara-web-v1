from decimal import Decimal

from django.core.management.base import BaseCommand
from django.utils.text import slugify

from accounts.models import User
from catalog.models import Category, Product, ProductImage, ProductVariant, ProductVideo
from orders.models import Address, Order, OrderItem

VIDEO = "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4"

CATEGORIES = [
    ("Rings", "rings", "Solitaires, bands and statement rings.", [
        ("Engagement", "engagement"), ("Wedding Bands", "wedding-bands"),
        ("Cocktail", "cocktail"), ("Promise", "promise")]),
    ("Earrings", "earrings", "Studs to jhumkas, everyday to heirloom.", [
        ("Studs", "studs"), ("Drops", "drops"), ("Hoops", "hoops"), ("Jhumka", "jhumka")]),
    ("Pendants", "pendants", "Single stones and stories on a chain.", [
        ("Solitaire", "solitaire"), ("Mangalsutra", "mangalsutra"),
        ("Everyday", "everyday"), ("Charm", "charm")]),
    ("Bracelets", "bracelets", "Tennis lines, charms and cuffs.", [
        ("Tennis", "tennis"), ("Charm", "charm"), ("Cuff", "cuff")]),
    ("Chains", "chains", "Hand-finished gold chains.", [
        ("Classic", "classic"), ("Layered", "layered"), ("Rope & Box", "rope-box")]),
]

# name, cat, sub, price, mrp, featured, sized, stock, description, diamond_info
PRODUCTS = [
    ("Arka Solitaire Ring", "rings", "engagement", 84500, 98000, True, True, "in_stock",
     "A six-claw crown lifts a round brilliant so light enters from every angle. Our signature engagement silhouette, hand-finished in Jaipur.",
     "IGI certified · 0.72 ct · F colour · VS1"),
    ("Meera Wedding Band", "rings", "wedding-bands", 46900, 52000, False, True, "in_stock",
     "Channel-set diamonds circle a comfort-fit band — quiet fire for every day.",
     "18 diamonds · 0.36 ct total · GH · VS"),
    ("Rani Cocktail Ring", "rings", "cocktail", 62000, 71000, False, True, "low_stock",
     "A dome of pavé over a wide gold gallery. Worn alone, it is the whole conversation.",
     "68 diamonds · 0.85 ct total · pavé set"),
    ("Tara Promise Ring", "rings", "promise", 28900, None, False, True, "in_stock",
     "A slim band with three stones — yesterday, today, tomorrow.",
     "3 diamonds · 0.18 ct total"),
    ("Nakshatra Diamond Studs", "earrings", "studs", 33500, 39000, True, False, "in_stock",
     "The classic, perfected: four claws, screw backs, perfect symmetry.",
     "IGI certified · 2 × 0.25 ct · F–G · VS"),
    ("Champaka Drop Earrings", "earrings", "drops", 57200, None, False, False, "in_stock",
     "Petals of gold suspending a movable brilliant that catches every turn of light.",
     "2 drops · 0.60 ct total"),
    ("Valli Hoops", "earrings", "hoops", 41800, 46000, False, False, "in_stock",
     "Inside-out set hoops — fire visible from both sides of the ear.",
     "44 diamonds · 0.70 ct total"),
    ("Mallika Heirloom Jhumka", "earrings", "jhumka", 74900, 86000, True, False, "made_to_order",
     "A jhumka dome paved in rose-cut diamonds with pearl bells — our atelier's most requested bespoke piece.",
     "Rose cuts + 12 keshi pearls · 1.1 ct total"),
    ("Jyoti Solitaire Pendant", "pendants", "solitaire", 52600, 59900, True, False, "in_stock",
     "One stone, floating on a fine chain. Martini setting, invisible bail.",
     "IGI certified · 0.50 ct · F · VS2"),
    ("Aisha Mangalsutra Pendant", "pendants", "mangalsutra", 68300, None, False, False, "in_stock",
     "Two interlocking orbits of diamonds on black-beaded gold — tradition, redrawn.",
     "31 diamonds · 0.55 ct total"),
    ("Diya Everyday Pendant", "pendants", "everyday", 21900, 24500, False, False, "in_stock",
     "A flame-shaped diamond cluster you will never take off.",
     "9 diamonds · 0.15 ct total"),
        ("Sarita Tennis Bracelet", "bracelets", "tennis", 129000, 149000, True, False, "in_stock",
     "An unbroken river of forty-eight graduated diamonds, each four-claw set and hand-matched for fire.",
     "IGI certified · 2.40 ct total · F–G · VS"),
    ("Lata Charm Bracelet", "bracelets", "charm", 38400, None, False, False, "in_stock",
     "A fine box chain carrying a single solitaire that moves as you do.",
     "1 diamond · 0.20 ct · F · VS2"),
    ("Kanchan Open Cuff", "bracelets", "cuff", 59800, 66000, False, False, "in_stock",
     "An open cuff with twin diamond tips — architectural, weighty, unmistakable.",
     "2 diamonds · 0.40 ct total"),
    ("Dhara Classic Chain", "chains", "classic", 24500, None, False, False, "in_stock",
     "A hand-drawn box chain with our hallmark clasp. The foundation of every stack.",
     "18 KT gold · 16–18 inch adjustable"),
    ("Mohini Layered Chain", "chains", "layered", 43700, 49000, False, False, "in_stock",
     "Two lengths, one clasp — a layered look that never tangles.",
     "18 KT gold · diamond station · 0.10 ct"),
]


class Command(BaseCommand):
    help = "Seed demo categories, products, variants, a demo user and a sample order."

    def handle(self, *args, **opts):
        # ---- categories -------------------------------------------------
        cat_map = {}
        for name, slug, desc, subs in CATEGORIES:
            cat, _ = Category.objects.get_or_create(
                slug=slug,
                defaults={"name": name, "description": desc,
                          "image_url": f"https://picsum.photos/seed/collection-{slug}/1200/1500"},
            )
            cat_map[slug] = cat
            for sub_name, sub_slug in subs:
                Category.objects.get_or_create(
                    slug=sub_slug,
                    defaults={"name": sub_name, "parent": cat,
                              "image_url": f"https://picsum.photos/seed/collection-{sub_slug}/900/1100"},
                )

        # ---- products + variants + media --------------------------------
        created_products = 0
        for (name, cat_slug, sub_slug, price, mrp, featured, sized,
             stock, desc, diamond_info) in PRODUCTS:
            subcat = Category.objects.get(slug=sub_slug)
            product, created = Product.objects.get_or_create(
                slug=slugify(name),
                defaults={
                    "name": name, "category": subcat, "description": desc,
                    "diamond_info": diamond_info, "base_price": Decimal(price),
                    "mrp": Decimal(mrp) if mrp else None, "is_featured": featured,
                    "stock_status": stock,
                    "short_description": desc[:140],
                },
            )
            created_products += int(created)
            base = slugify(name)

            # images (remote URLs so seeding works without uploads)
            if not product.images.exists():
                for i in range(2):
                    suffix = "" if i == 0 else "-alt"
                    ProductImage.objects.create(
                        product=product, ordering=i,
                        remote_url=f"https://picsum.photos/seed/{base}{suffix}/900/1125",
                        alt=name,
                    )
            # video for featured pieces
            if featured and not product.videos.exists():
                ProductVideo.objects.create(product=product, title=f"{name} — 360° view",
                                            video_url=VIDEO, is_primary=True)

            # variants: colour × purity (× sizes for rings)
            if not product.variants.exists():
                eight_kt_delta = round(price * 0.12)
                sizes = ["6", "7", "8", "9", "10"] if sized else [None]
                for color in ["yellow", "rose", "white"]:
                    for purity, delta in [("14K", 0), ("18K", eight_kt_delta)]:
                        for size in sizes:
                            qty = 0 if stock == "out_of_stock" else (2 if stock == "low_stock" else 8)
                            ProductVariant.objects.create(
                                product=product, gold_color=color, purity=purity,
                                ring_size=size, price_delta=delta + (300 if color != "yellow" else 0),
                                stock_quantity=qty,
                            )

        # ---- demo user, address and a delivered sample order -------------
        user, created_user = User.objects.get_or_create(
            email="demo@vaira.in",
            defaults={"phone": "9876543210", "first_name": "Aisha", "last_name": "Sharma"},
        )
        if created_user:
            user.set_password("vaira@123")
            user.save()

            address = Address.objects.create(
                user=user, label="home", full_name="Aisha Sharma", phone="9876543210",
                line1="14 Altamount Road", city="Mumbai", state="Maharashtra",
                pincode="400026", is_default=True,
            )
            order = Order.objects.create(user=user, address=address,
                                         payment_method="upi", status="delivered")
            subtotal = Decimal("0")
            for variant in ProductVariant.objects.select_related("product").filter(
                    product__is_featured=True)[:2]:
                qty, unit = 1, variant.price
                subtotal += unit * qty
                OrderItem.objects.create(
                    order=order, product=variant.product, variant=variant,
                    product_name=variant.product.name, variant_label=variant.label,
                    quantity=qty, unit_price=unit, line_total=unit * qty,
                )
            order.subtotal = subtotal
            order.total = subtotal
            order.save()

        self.stdout.write(self.style.SUCCESS(
            f"Seeded {Category.objects.count()} categories, "
            f"{created_products} new products ({Product.objects.count()} total). "
            "Demo login: demo@vaira.in / vaira@123 (phone 9876543210 works too)."
        ))