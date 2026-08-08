from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from .models import User


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    ordering = ["email"]
    list_display = ["email", "phone", "first_name", "last_name", "is_staff"]
    search_fields = ["email", "phone", "first_name", "last_name"]
    fieldsets = DjangoUserAdmin.fieldsets[:1] + ((None, {"fields": ["phone"]}),) + DjangoUserAdmin.fieldsets[1:]
    add_fieldsets = DjangoUserAdmin.add_fieldsets + ((None, {"fields": ["email", "phone"]}),)