import { cn } from "@/lib/utils";

interface NumericProps {
  children: React.ReactNode;
  className?: string;
  as?: "span" | "p" | "div" | "dd";
}

export function Numeric({ children, className, as: Tag = "span" }: NumericProps) {
  return <Tag className={cn("font-numeric", className)}>{children}</Tag>;
}
