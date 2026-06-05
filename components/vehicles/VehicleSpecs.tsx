import { Check } from "lucide-react";
import type { CatalogueItem } from "@/types/catalogue";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Numeric } from "@/components/ui/Numeric";

interface VehicleSpecsProps {
  item: CatalogueItem;
}

export function VehicleSpecs({ item }: VehicleSpecsProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Specifications</CardTitle>
        </CardHeader>
        <dl className="space-y-3">
          {item.specifications.map((spec) => (
            <div
              key={spec.label}
              className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0"
            >
              <dt className="text-sm text-muted">{spec.label}</dt>
              <Numeric as="dd" className="text-sm font-medium text-foreground">
                {spec.value}
              </Numeric>
            </div>
          ))}
        </dl>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Key Highlights</CardTitle>
        </CardHeader>
        <ul className="space-y-3">
          {item.highlights.map((highlight) => (
            <li key={highlight} className="flex items-start gap-3 text-sm text-muted">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-foreground" />
              {highlight}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
