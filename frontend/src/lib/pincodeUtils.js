// Hardcoded serviceable pincodes - NCR region only
// Delhi, Gurugram, Noida, Faridabad (excluding outskirts/villages)

const SERVICEABLE_PINCODES = {
  delhi: Array.from({ length: 96 }, (_, i) => 110001 + i),      // 110001-110096
  gurugram: Array.from({ length: 22 }, (_, i) => 122001 + i),   // 122001-122022
  faridabad: Array.from({ length: 15 }, (_, i) => 121001 + i),  // 121001-121015
  noida: Array.from({ length: 13 }, (_, i) => 201301 + i),      // 201301-201313
};

// Flatten for quick lookup
const SERVICEABLE_PINCODE_SET = new Set(
  Object.values(SERVICEABLE_PINCODES).flat()
);

export function isPincodeServiceable(pincode) {
  const pin = parseInt(pincode, 10);
  if (isNaN(pin)) return false;
  return SERVICEABLE_PINCODE_SET.has(pin);
}

export function getCityForPincode(pincode) {
  const pin = parseInt(pincode, 10);
  if (isNaN(pin)) return null;
  
  for (const [city, pincodes] of Object.entries(SERVICEABLE_PINCODES)) {
    if (pincodes.includes(pin)) {
      return city.charAt(0).toUpperCase() + city.slice(1);
    }
  }
  return null;
}