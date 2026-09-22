# Hardcoded serviceable pincodes - NCR region only
# Delhi, Gurugram, Noida, Faridabad (excluding outskirts/villages)

SERVICEABLE_PINCODES = {
    'delhi': list(range(110001, 110097)),      # 110001-110096
    'gurugram': list(range(122001, 122023)),   # 122001-122022
    'faridabad': list(range(121001, 121016)),  # 121001-121015
    'noida': list(range(201301, 201314)),      # 201301-201313
}

# Flatten for quick lookup
SERVICEABLE_PINCODE_SET = set()
for pincodes in SERVICEABLE_PINCODES.values():
    SERVICEABLE_PINCODE_SET.update(pincodes)

def is_pincode_serviceable(pincode):
    """Check if a pincode is in our serviceable area."""
    try:
        pin = int(pincode)
        return pin in SERVICEABLE_PINCODE_SET
    except (ValueError, TypeError):
        return False

def get_city_for_pincode(pincode):
    """Get city name for a serviceable pincode."""
    try:
        pin = int(pincode)
        for city, pincodes in SERVICEABLE_PINCODES.items():
            if pin in pincodes:
                return city.title()
        return None
    except (ValueError, TypeError):
        return None