import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "accent" | "outline";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-surface-elevated text-muted border border-border",
  accent: "bg-foreground text-background border border-foreground",
  outline: "border border-border text-muted",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 text-[10px] font-medium uppercase tracking-[0.15em]",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
