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
  stockStatus: string;
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
    stockStatus: variant.stockStatus as CatalogueItem["stockStatus"],
    featured: variant.featured,
    highlights: (variant.highlights as string[]) ?? [],
  };
}

export async function getCatalogueFromDatabase(): Promise<CatalogueItem[]> {
  const variants = await prisma.variant.findMany({
    include: { vehicle: true },
    orderBy: [{ vehicle: { name: "asc" } }, { name: "asc" }],
  });

  return variants.map(variantToCatalogueItem);
}

export async function syncCatalogueFile(): Promise<CatalogueItem[]> {
  const catalogue = await getCatalogueFromDatabase();
  const filePath = path.join(process.cwd(), "data", "catalogue.json");
  await writeFile(filePath, `${JSON.stringify({ catalogue }, null, 2)}\n`, "utf-8");
  return catalogue;
}
