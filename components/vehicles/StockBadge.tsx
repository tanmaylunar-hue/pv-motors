import type { StockStatus } from "@/types/catalogue";
import { formatStockStatus } from "@/lib/catalogue-format";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

const statusStyles: Record<StockStatus, string> = {
  in_stock: "border-foreground/20 bg-foreground text-background",
  low_stock: "border-border bg-surface-elevated text-foreground",
  out_of_stock: "border-border bg-surface text-muted line-through decoration-muted",
  pre_order: "border-foreground/30 bg-background text-foreground",
};

interface StockBadgeProps {
  status: StockStatus;
  className?: string;
}

export function StockBadge({ status, className }: StockBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(statusStyles[status], className)}
    >
      {formatStockStatus(status)}
    </Badge>
  );
}
