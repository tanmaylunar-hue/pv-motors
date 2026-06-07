import { cache } from "react";
import { getCatalogueFromDatabase } from "@/lib/sync-catalogue";
import type { CatalogueItem, VehicleCategory } from "@/types/catalogue";
import fs from "fs/promises";
import path from "path";

export const getCatalogue = cache(async (): Promise<CatalogueItem[]> => {
  try {
    return await getCatalogueFromDatabase();
  } catch (error) {
    console.error("[getCatalogue] Database connection error, falling back to static JSON:", error);
    try {
      const filePath = path.join(process.cwd(), "data", "catalogue.json");
      const content = await fs.readFile(filePath, "utf-8");
      const data = JSON.parse(content);
      return data.catalogue || [];
    } catch (fsError) {
      console.error("[getCatalogue] Failed to load static fallback JSON:", fsError);
      return [];
    }
  }
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
