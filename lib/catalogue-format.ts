import type { CatalogueItem, StockStatus } from "@/types/catalogue";

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

export function getSpecValue(
  item: CatalogueItem,
  label: string
): string | undefined {
  return item.specifications.find(
    (spec) => spec.label.toLowerCase() === label.toLowerCase()
  )?.value;
}
