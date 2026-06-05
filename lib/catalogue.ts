import catalogueData from "@/data/catalogue.json";
import type {
  CatalogueItem,
  Specification,
  StockStatus,
  VehicleCategory,
} from "@/types/catalogue";

export const catalogue = catalogueData.catalogue as CatalogueItem[];

export function getCatalogueItemBySlug(slug: string): CatalogueItem | undefined {
  return catalogue.find((item) => item.slug === slug);
}

export function getFeaturedCatalogueItems(): CatalogueItem[] {
  return catalogue.filter((item) => item.featured);
}

export function getCatalogueByCategory(
  category: VehicleCategory | "all"
): CatalogueItem[] {
  if (category === "all") return catalogue;
  return catalogue.filter((item) => item.category === category);
}

export function getSpecValue(
  item: CatalogueItem,
  label: string
): string | undefined {
  return item.specifications.find(
    (spec) => spec.label.toLowerCase() === label.toLowerCase()
  )?.value;
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatStockStatus(status: StockStatus): string {
  const labels: Record<StockStatus, string> = {
    in_stock: "In Stock",
    low_stock: "Low Stock",
    out_of_stock: "Out of Stock",
    pre_order: "Pre-Order",
  };
  return labels[status];
}

export function getPrimaryImage(item: CatalogueItem): string {
  return item.images[0] ?? "/vehicles/placeholder.svg";
}

export type { CatalogueItem, Specification, StockStatus, VehicleCategory };
