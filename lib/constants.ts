export const SITE_NAME = "PV Motors";
export const SITE_TAGLINE = "Authorized Dealer for KOMAKI EV";
export const SITE_DESCRIPTION =
  "Premium electric vehicles from KOMAKI. Explore scooters, motorcycles, and commercial EVs at PV Motors.";

export const NAV_LINKS = [
  { href: "/#home", label: "Home" },
  { href: "/#featured", label: "Featured Vehicles" },
  { href: "/#catalogue", label: "Full Catalogue" },
  { href: "/#reviews", label: "Customer Reviews" },
  { href: "/#gallery", label: "Gallery" },
  { href: "/#contact", label: "Contact Us" },
] as const;

export const CONTACT_INFO = {
  phone: "+91 98765 43210",
  email: "hello@pvmotors.in",
  address: "12 EV Boulevard, Sector 18, Noida, Uttar Pradesh 201301",
  hours: "Mon – Sat: 10:00 AM – 8:00 PM",
} as const;

/** WhatsApp number for admin enquiry alerts (digits only, with country code). */
export const ADMIN_WHATSAPP =
  process.env.NEXT_PUBLIC_ADMIN_WHATSAPP ?? CONTACT_INFO.phone.replace(/\D/g, "");

export const SOCIAL_LINKS = [
  { href: "https://instagram.com", label: "Instagram" },
  { href: "https://facebook.com", label: "Facebook" },
  { href: "https://youtube.com", label: "YouTube" },
] as const;
