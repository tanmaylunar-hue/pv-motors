import { writeFile } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/db";
import type { CatalogueItem, Specification } from "@/types/catalogue";

export function variantToCatalogueItem(variant: {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  price: number;
  specifications: unknown;
  images: unknown;
  images360: unknown;
  sequence: number;
  stockStatus: string;
  stockQuantity: number;
  featured: boolean;
  highlights: unknown;
  vehicle: { name: string; category: string };
}): CatalogueItem {
  return {
    id: variant.id,
    slug: variant.slug,
    vehicle: variant.vehicle.name,
    variant: variant.name,
    category: variant.vehicle.category as CatalogueItem["category"],
    tagline: variant.tagline,
    price: variant.price,
    specifications: (variant.specifications as Specification[]) ?? [],
    images: (variant.images as string[]) ?? [],
    images360: (variant.images360 as string[]) ?? [],
    sequence: variant.sequence ?? 0,
    stockStatus: variant.stockStatus as CatalogueItem["stockStatus"],
    stockQuantity: variant.stockQuantity,
    featured: variant.featured,
    highlights: (variant.highlights as string[]) ?? [],
  };
}

export async function getCatalogueFromDatabase(): Promise<CatalogueItem[]> {
  const variants = await prisma.variant.findMany({
    include: { vehicle: true },
    orderBy: [
      { sequence: "asc" },
      { vehicle: { name: "asc" } },
      { name: "asc" }
    ],
  });

  return variants.map(variantToCatalogueItem);
}

export async function syncCatalogueFile(): Promise<CatalogueItem[]> {
  const catalogue = await getCatalogueFromDatabase();
  const filePath = path.join(process.cwd(), "data", "catalogue.json");
  try {
    await writeFile(filePath, `${JSON.stringify({ catalogue }, null, 2)}\n`, "utf-8");
  } catch (err) {
    console.warn(
      "[syncCatalogueFile] Non-fatal: Failed to write catalogue.json (expected in read-only hosting environments):",
      err
    );
  }
  return catalogue;
}
