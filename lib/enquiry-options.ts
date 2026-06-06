import { getCatalogue } from "@/lib/catalogue-server";

export type EnquiryVariantOption = {
  id?: string;
  name: string;
};

export type EnquiryVehicleOption = {
  id?: string;
  name: string;
  variants: EnquiryVariantOption[];
};

export async function getCatalogueEnquiryOptions(): Promise<EnquiryVehicleOption[]> {
  const catalogue = await getCatalogue();
  const vehicleMap = new Map<string, EnquiryVariantOption[]>();

  for (const item of catalogue) {
    const variants = vehicleMap.get(item.vehicle) ?? [];
    if (!variants.some((variant) => variant.name === item.variant)) {
      variants.push({ id: item.id, name: item.variant });
    }
    vehicleMap.set(item.vehicle, variants);
  }

  return [...vehicleMap.entries()].map(([name, variants]) => ({
    name,
    variants,
  }));
}
