import type { CatalogueItem } from "@/types/catalogue";
import { VehicleCard } from "./VehicleCard";

interface VehicleGridProps {
  items: CatalogueItem[];
}

export function VehicleGrid({ items }: VehicleGridProps) {
  if (items.length === 0) {
    return (
      <div className="border border-border bg-surface p-12 text-center">
        <p className="text-muted">No vehicles found in this category.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <VehicleCard key={item.id} item={item} />
      ))}
    </div>
  );
}
