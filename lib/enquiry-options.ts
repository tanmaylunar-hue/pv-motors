import { catalogue } from "@/lib/catalogue";

export type EnquiryVariantOption = {
  id?: string;
  name: string;
};

export type EnquiryVehicleOption = {
  id?: string;
  name: string;
  variants: EnquiryVariantOption[];
};

export function getCatalogueEnquiryOptions(): EnquiryVehicleOption[] {
  const vehicleMap = new Map<string, EnquiryVariantOption[]>();

  for (const item of catalogue) {
    const variants = vehicleMap.get(item.vehicle) ?? [];
    if (!variants.some((variant) => variant.name === item.variant)) {
      variants.push({ name: item.variant });
    }
    vehicleMap.set(item.vehicle, variants);
  }

  return [...vehicleMap.entries()].map(([name, variants]) => ({
    name,
    variants,
  }));
}
