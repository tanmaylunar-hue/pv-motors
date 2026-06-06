"use client";

import { useState } from "react";
import type { VehicleCategory, CatalogueItem } from "@/types/catalogue";
import { VehicleGrid } from "@/components/vehicles/VehicleGrid";
import { SectionHeader } from "@/components/ui/Section";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

const categories: { value: VehicleCategory | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "scooter", label: "Scooters" },
  { value: "motorcycle", label: "Motorcycles" },
  { value: "loader", label: "Loaders" },
];

interface VehiclesCatalogProps {
  items: CatalogueItem[];
}

export function VehiclesCatalog({ items }: VehiclesCatalogProps) {
  const [activeCategory, setActiveCategory] = useState<VehicleCategory | "all">("all");
  const filtered =
    activeCategory === "all"
      ? items
      : items.filter((item) => item.category === activeCategory);

  return (
    <>
      <SectionHeader
        eyebrow="Catalogue"
        title="KOMAKI Electric Vehicles"
        description="Browse our complete catalogue — every model, variant, price, and stock status in one place."
      />

      <div className="mb-10 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat.value}
            type="button"
            onClick={() => setActiveCategory(cat.value)}
            className={cn(
              "rounded-full transition-all",
              activeCategory === cat.value
                ? "ring-2 ring-foreground ring-offset-2 ring-offset-background"
                : ""
            )}
          >
            <Badge variant={activeCategory === cat.value ? "accent" : "outline"}>
              {cat.label}
            </Badge>
          </button>
        ))}
      </div>

      <VehicleGrid items={filtered} />
    </>
  );
}
