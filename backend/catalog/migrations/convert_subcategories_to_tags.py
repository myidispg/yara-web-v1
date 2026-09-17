"""Convert subcategory designs to tag-based system.

This migration:
1. Creates tags for existing subcategories (solitaires, color-stone, etc.)
2. Assigns those tags to all designs in those subcategories
3. Deactivates the subcategories (soft delete — can be removed later)
"""

from django.db import migrations

# Subcategories to convert: slug → (tag_name, tag_group)
SUBCATEGORY_TO_TAG = {
    'solitaires': ('solitaire', 'style'),
    'color-stone': ('color-stone', 'material'),
}

# Subcategories to KEEP (not converted)
KEEP_SUBCATEGORIES = ['engagement-rings', 'wedding-bands']


def forwards(apps, schema_editor):
    Tag = apps.get_model('catalog', 'Tag')
    Category = apps.get_model('catalog', 'Category')
    Design = apps.get_model('catalog', 'Design')

    for slug, (tag_name, group) in SUBCATEGORY_TO_TAG.items():
        # Create the tag
        tag, _ = Tag.objects.get_or_create(
            slug=slug,
            defaults={'name': tag_name, 'group': group, 'is_active': True}
        )

        # Find the subcategory
        try:
            subcat = Category.objects.get(slug=slug)
        except Category.DoesNotExist:
            continue

        # Assign tag to all designs in this subcategory
        designs = Design.objects.filter(category=subcat)
        for design in designs:
            design.tags.add(tag)
            # Move design to parent category
            if subcat.parent:
                design.category = subcat.parent
                design.save(update_fields=['category'])

        # Deactivate the subcategory
        subcat.is_active = False
        subcat.save(update_fields=['is_active'])

        print(f"  Converted '{slug}' → tag '{tag_name}', {designs.count()} designs moved")


def backwards(apps, schema_editor):
    Tag = apps.get_model('catalog', 'Tag')
    Category = apps.get_model('catalog', 'Category')
    Design = apps.get_model('catalog', 'Design')

    for slug, (tag_name, group) in SUBCATEGORY_TO_TAG.items():
        try:
            tag = Tag.objects.get(slug=slug)
            subcat = Category.objects.get(slug=slug)
        except (Tag.DoesNotExist, Category.DoesNotExist):
            continue

        # Move designs back to subcategory
        for design in Design.objects.filter(tags=tag):
            design.category = subcat
            design.save(update_fields=['category'])
            design.tags.remove(tag)

        # Reactivate subcategory
        subcat.is_active = True
        subcat.save(update_fields=['is_active'])

        tag.delete()


class Migration(migrations.Migration):

    dependencies = [
        ('catalog', '0011_tag_design_tags'),  # Update this to your latest migration
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
    ]