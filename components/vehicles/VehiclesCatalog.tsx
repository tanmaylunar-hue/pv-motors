"use client";

import { useState, useMemo } from "react";
import type { VehicleCategory, CatalogueItem } from "@/types/catalogue";
import { VehicleGrid } from "@/components/vehicles/VehicleGrid";
import { SectionHeader } from "@/components/ui/Section";
import { Search, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

const categories: { value: VehicleCategory | "all"; label: string }[] = [
  { value: "all", label: "All Vehicles" },
  { value: "scooter", label: "Scooters" },
  { value: "motorcycle", label: "Motorcycles" },
  { value: "loader", label: "Loaders" },
];

interface VehiclesCatalogProps {
  items: CatalogueItem[];
}

export function VehiclesCatalog({ items }: VehiclesCatalogProps) {
  const [activeCategory, setActiveCategory] = useState<VehicleCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState<string>("all");
  const [selectedVariant, setSelectedVariant] = useState<string>("all");
  const [availability, setAvailability] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("default");

  // Get unique variants dynamically based on items
  const uniqueVariants = useMemo(() => {
    const list = items.map((item) => item.variant);
    return Array.from(new Set(list)).sort();
  }, [items]);

  // Filter and sort items reactively
  const filteredAndSortedItems = useMemo(() => {
    let result = [...items];

    // 1. Category Filter
    if (activeCategory !== "all") {
      result = result.filter((item) => item.category === activeCategory);
    }

    // 2. Search Query Filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.vehicle.toLowerCase().includes(query) ||
          item.variant.toLowerCase().includes(query) ||
          item.tagline.toLowerCase().includes(query)
      );
    }

    // 3. Price Filter
    if (priceRange !== "all") {
      if (priceRange === "under_120k") {
        result = result.filter((item) => item.price < 120000);
      } else if (priceRange === "120k_150k") {
        result = result.filter((item) => item.price >= 120000 && item.price <= 150000);
      } else if (priceRange === "above_150k") {
        result = result.filter((item) => item.price > 150000);
      }
    }

    // 4. Variant Filter
    if (selectedVariant !== "all") {
      result = result.filter((item) => item.variant === selectedVariant);
    }

    // 5. Availability Filter
    if (availability !== "all") {
      result = result.filter((item) => item.stockStatus === availability);
    }

    // 6. Sorting
    if (sortBy === "price_asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price_desc") {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [items, activeCategory, searchQuery, priceRange, selectedVariant, availability, sortBy]);

  return (
    <div id="catalogue" className="scroll-mt-20">
      <SectionHeader
        eyebrow="Browse Full Catalogue"
        title="Explore All Vehicles"
        description="Search and filter through our full lineup of KOMAKI electric two-wheelers and loaders. Find your perfect ride."
      />

      {/* Category Tabs */}
      <div className="mb-8 flex flex-wrap gap-2 border-b border-border pb-4">
        {categories.map((cat) => (
          <button
            key={cat.value}
            type="button"
            onClick={() => setActiveCategory(cat.value)}
            className={cn(
              "px-5 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all duration-300 border border-border",
              activeCategory === cat.value
                ? "bg-black text-white border-black"
                : "text-muted hover:text-foreground hover:bg-surface-elevated bg-background"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Filter Controls Grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5 bg-surface border border-border p-6 shadow-sm">
        {/* Search */}
        <div className="relative flex flex-col gap-1.5">
          <label className="text-[10px] font-medium uppercase tracking-wider text-muted">Search</label>
          <div className="relative">
            <input
              type="text"
              placeholder="e.g. Venice, Ranger..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background border border-border px-3 py-2 pl-9 text-sm text-foreground focus:outline-none focus:border-black transition-colors"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
          </div>
        </div>

        {/* Price Filter */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-medium uppercase tracking-wider text-muted">Price Range</label>
          <select
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
            className="w-full bg-background border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-black transition-colors"
          >
            <option value="all">All Prices</option>
            <option value="under_120k">Under ₹1,20,000</option>
            <option value="120k_150k">₹1,20,000 - ₹1,50,000</option>
            <option value="above_150k">Above ₹1,50,000</option>
          </select>
        </div>

        {/* Variant Filter */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-medium uppercase tracking-wider text-muted">Variant</label>
          <select
            value={selectedVariant}
            onChange={(e) => setSelectedVariant(e.target.value)}
            className="w-full bg-background border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-black transition-colors"
          >
            <option value="all">All Variants</option>
            {uniqueVariants.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>

        {/* Availability Filter */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-medium uppercase tracking-wider text-muted">Availability</label>
          <select
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
            className="w-full bg-background border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-black transition-colors"
          >
            <option value="all">All Availability</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
            <option value="pre_order">Pre-Order</option>
          </select>
        </div>

        {/* Sort By */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-medium uppercase tracking-wider text-muted">Sort By Price</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full bg-background border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-black transition-colors"
          >
            <option value="default">Default</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Results Info */}
      <div className="mb-6 flex items-center justify-between text-xs text-muted font-mono uppercase tracking-wider">
        <span>Showing {filteredAndSortedItems.length} of {items.length} models</span>
        {(searchQuery || priceRange !== "all" || selectedVariant !== "all" || availability !== "all" || activeCategory !== "all") && (
          <button
            onClick={() => {
              setActiveCategory("all");
              setSearchQuery("");
              setPriceRange("all");
              setSelectedVariant("all");
              setAvailability("all");
              setSortBy("default");
            }}
            className="text-black font-semibold hover:underline uppercase text-[10px] tracking-wider"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Catalogue Output */}
      {filteredAndSortedItems.length === 0 ? (
        <div className="border border-dashed border-border py-20 text-center bg-surface/30">
          <SlidersHorizontal className="mx-auto mb-4 h-8 w-8 text-muted" />
          <p className="text-sm font-medium text-foreground">No matches found</p>
          <p className="mt-1 text-xs text-muted">Try adjusting your filters or search keywords.</p>
        </div>
      ) : (
        <VehicleGrid items={filteredAndSortedItems} />
      )}
    </div>
  );
}
