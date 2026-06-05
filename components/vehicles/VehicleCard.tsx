import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Battery, Gauge } from "lucide-react";
import type { CatalogueItem } from "@/types/catalogue";
import {
  formatPrice,
  getPrimaryImage,
  getSpecValue,
} from "@/lib/catalogue";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Numeric } from "@/components/ui/Numeric";
import { StockBadge } from "@/components/vehicles/StockBadge";
import { cn } from "@/lib/utils";

interface VehicleCardProps {
  item: CatalogueItem;
  variant?: "default" | "minimal";
}

export function VehicleCard({ item, variant = "default" }: VehicleCardProps) {
  const range = getSpecValue(item, "Range");
  const topSpeed = getSpecValue(item, "Top Speed");

  if (variant === "minimal") {
    return (
      <Link href={`/vehicles/${item.slug}`} className="group block h-full bg-background">
        <div className="flex h-full flex-col p-6 sm:p-8">
          <div className="relative mb-6 aspect-[4/3] overflow-hidden border border-border bg-surface transition-colors duration-500 group-hover:border-foreground/20">
            <Image
              src={getPrimaryImage(item)}
              alt={`${item.vehicle} ${item.variant}`}
              fill
              className="object-contain p-4"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </div>

          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge variant="outline">{item.category}</Badge>
            <StockBadge status={item.stockStatus} />
            {item.featured && <Badge variant="accent">Featured</Badge>}
          </div>

          <h3 className="font-display text-xl font-medium text-foreground transition-colors duration-300 group-hover:text-muted">
            {item.vehicle}
          </h3>
          <p className="mt-1 text-sm text-muted">{item.variant}</p>
          <p className="mt-2 line-clamp-2 text-sm text-muted">{item.tagline}</p>

          <div className="mt-4 flex items-center gap-4 text-xs text-muted">
            {range && (
              <Numeric className="flex items-center gap-1.5 uppercase tracking-wider">
                <Battery className="h-3.5 w-3.5" />
                {range}
              </Numeric>
            )}
            {topSpeed && (
              <Numeric className="flex items-center gap-1.5 uppercase tracking-wider">
                <Gauge className="h-3.5 w-3.5" />
                {topSpeed}
              </Numeric>
            )}
          </div>

          <div className="mt-auto flex items-center justify-between border-t border-border pt-6">
            <Numeric as="p" className="text-xl font-semibold text-foreground">
              {formatPrice(item.price)}
            </Numeric>
            <ArrowRight className="h-4 w-4 text-muted transition-all duration-300 group-hover:translate-x-1 group-hover:text-foreground" />
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/vehicles/${item.slug}`} className="group block">
      <Card hover className="h-full">
        <div className="relative mb-4 aspect-[16/10] overflow-hidden border border-border bg-surface">
          <Image
            src={getPrimaryImage(item)}
            alt={`${item.vehicle} ${item.variant}`}
            fill
            className="object-contain p-4"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge variant="outline">{item.category}</Badge>
          <StockBadge status={item.stockStatus} />
          {item.featured && <Badge variant="accent">Featured</Badge>}
        </div>

        <h3 className="font-display text-lg font-medium text-foreground transition-colors duration-300 group-hover:text-muted">
          {item.vehicle}
        </h3>
        <p className="mt-0.5 text-sm text-muted">{item.variant}</p>
        <p className="mt-1 line-clamp-2 text-sm text-muted">{item.tagline}</p>

        <div className="mt-4 flex items-center gap-4 text-sm text-muted">
          {range && (
            <Numeric className="flex items-center gap-1.5">
              <Battery className="h-4 w-4" />
              {range}
            </Numeric>
          )}
          {topSpeed && (
            <Numeric className="flex items-center gap-1.5">
              <Gauge className="h-4 w-4" />
              {topSpeed}
            </Numeric>
          )}
        </div>

        <div className={cn("mt-4 flex items-center justify-between border-t border-border pt-4")}>
          <Numeric as="p" className="text-lg font-semibold text-foreground">
            {formatPrice(item.price)}
          </Numeric>
          <span className="flex items-center gap-1 text-sm text-muted opacity-0 transition-all duration-300 group-hover:opacity-100">
            View
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </Card>
    </Link>
  );
}
