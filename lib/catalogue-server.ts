import catalogueData from "@/data/catalogue.json";
import { getCatalogueFromDatabase } from "@/lib/sync-catalogue";
import type { CatalogueItem, VehicleCategory } from "@/types/catalogue";

const fallbackCatalogue = catalogueData.catalogue as CatalogueItem[];

export async function getCatalogue(): Promise<CatalogueItem[]> {
  try {
    const fromDb = await getCatalogueFromDatabase();
    if (fromDb.length > 0) return fromDb;
  } catch {
    // fall back to bundled JSON
  }
  return fallbackCatalogue;
}

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

/** Static fallback for legacy imports. Prefer getCatalogue(). */
export const catalogue = fallbackCatalogue;
