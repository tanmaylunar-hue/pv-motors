export type VehicleCategory = "scooter" | "motorcycle" | "loader";

export type StockStatus = "in_stock" | "low_stock" | "out_of_stock" | "pre_order";

export interface Specification {
  label: string;
  value: string;
}

export interface CatalogueItem {
  id: string;
  slug: string;
  vehicle: string;
  variant: string;
  category: VehicleCategory;
  tagline: string;
  price: number;
  specifications: Specification[];
  images: string[];
  images360: string[];
  sequence: number;
  stockStatus: StockStatus;
  stockQuantity: number;
  featured: boolean;
  highlights: string[];
}

export interface CatalogueData {
  catalogue: CatalogueItem[];
}
