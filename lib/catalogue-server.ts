import { cache } from "react";
import { getCatalogueFromDatabase } from "@/lib/sync-catalogue";
import type { CatalogueItem, VehicleCategory } from "@/types/catalogue";

export const getCatalogue = cache(async (): Promise<CatalogueItem[]> => {
  return getCatalogueFromDatabase();
});

export async function getCatalogueItemBySlug(
  slug: string
): Promise<CatalogueItem | undefined> {
  const items = await getCatalogue();
  return items.find((item) => item.slug === slug);
}

export async function getFeaturedCatalogueItems(): Promise<CatalogueItem[]> {
  const items = await getCatalogue();
  return items.filter((item) => item.featured);
}

export async function getCatalogueByCategory(
  category: VehicleCategory | "all"
): Promise<CatalogueItem[]> {
  const items = await getCatalogue();
  if (category === "all") return items;
  return items.filter((item) => item.category === category);
}
