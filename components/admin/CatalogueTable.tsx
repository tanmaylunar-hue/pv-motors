import Link from "next/link";
import Image from "next/image";
import { Pencil } from "lucide-react";
import { catalogue, formatPrice, getPrimaryImage } from "@/lib/catalogue";
import { StockBadge } from "@/components/vehicles/StockBadge";
import { Button } from "@/components/ui/Button";
import { Numeric } from "@/components/ui/Numeric";

export function CatalogueTable() {
  return (
    <div className="overflow-x-auto border border-border">
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead className="border-b border-border bg-surface">
          <tr>
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted">
              Image
            </th>
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted">
              Vehicle
            </th>
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted">
              Variant
            </th>
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted">
              Price
            </th>
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted">
              Stock
            </th>
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted">
              Specs
            </th>
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {catalogue.map((item) => (
            <tr key={item.id} className="bg-background transition-colors hover:bg-surface/50">
              <td className="px-4 py-3">
                <div className="relative h-12 w-16 overflow-hidden border border-border bg-surface">
                  <Image
                    src={getPrimaryImage(item)}
                    alt={item.vehicle}
                    fill
                    className="object-contain p-1"
                    sizes="64px"
                  />
                </div>
              </td>
              <td className="px-4 py-3">
                <Link
                  href={`/vehicles/${item.slug}`}
                  className="font-medium text-foreground hover:underline"
                >
                  {item.vehicle}
                </Link>
                <p className="text-xs capitalize text-muted">{item.category}</p>
              </td>
              <td className="px-4 py-3 text-muted">{item.variant}</td>
              <td className="px-4 py-3">
                <Numeric className="font-medium text-foreground">
                  {formatPrice(item.price)}
                </Numeric>
              </td>
              <td className="px-4 py-3">
                <StockBadge status={item.stockStatus} />
              </td>
              <td className="px-4 py-3 text-xs text-muted">
                {item.specifications.length} fields
              </td>
              <td className="px-4 py-3">
                <Button variant="ghost" size="sm" disabled>
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
