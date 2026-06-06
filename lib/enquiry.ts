import { ADMIN_WHATSAPP } from "@/lib/constants";

export const PHONE_REGEX = /^\d{10}$/;

export function normalizePhone(value: string): string {
  return value.replace(/\D/g, "").slice(-10);
}

export function isValidPhone(value: string): boolean {
  return PHONE_REGEX.test(normalizePhone(value));
}

export type EnquiryPayload = {
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  vehicleName: string;
  variantName: string;
  variantId?: string;
};

export function buildAdminWhatsAppUrl(enquiry: EnquiryPayload): string {
  const adminNumber = ADMIN_WHATSAPP;

  const text = [
    "New PV Motors Enquiry",
    "",
    `Name: ${enquiry.name}`,
    `Phone: ${enquiry.phone}`,
    `Address: ${enquiry.address}`,
    `City: ${enquiry.city}`,
    `State: ${enquiry.state}`,
    `Vehicle: ${enquiry.vehicleName}`,
    `Variant: ${enquiry.variantName}`,
  ].join("\n");

  return `https://wa.me/${adminNumber}?text=${encodeURIComponent(text)}`;
}
