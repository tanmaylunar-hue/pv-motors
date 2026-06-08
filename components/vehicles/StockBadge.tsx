import type { StockStatus } from "@/types/catalogue";
import { cn } from "@/lib/utils";

const statusStyles: Record<
  StockStatus,
  { container: string; icon: string; label: string }
> = {
  in_stock: {
    container: "bg-emerald-50/80 border-emerald-200/80 text-emerald-800 hover:bg-emerald-100/60 hover:border-emerald-300/80",
    icon: "✓",
    label: "Available",
  },
  pre_order: {
    container: "bg-emerald-50/80 border-emerald-200/80 text-emerald-800 hover:bg-emerald-100/60 hover:border-emerald-300/80",
    icon: "✓",
    label: "Pre-Order",
  },
  low_stock: {
    container: "bg-orange-50/80 border-orange-200/80 text-[var(--accent)] hover:bg-orange-100/60 hover:border-orange-300/80",
    icon: "⏳",
    label: "Limited",
  },
  out_of_stock: {
    container: "bg-neutral-100/60 border-neutral-200/60 text-neutral-500 hover:bg-neutral-200/40 hover:border-neutral-300/40",
    icon: "—",
    label: "Out of Stock",
  },
};

interface StockBadgeProps {
  status: StockStatus;
  className?: string;
}

export function StockBadge({ status, className }: StockBadgeProps) {
  const config = statusStyles[status];

  if (!config) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full border transition-all duration-200 select-none h-5 shrink-0",
        config.container,
        className
      )}
    >
      <span className="text-[10px] leading-none shrink-0">{config.icon}</span>
      <span className="leading-none">{config.label}</span>
    </span>
  );
}

