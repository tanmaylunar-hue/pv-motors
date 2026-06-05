import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Numeric } from "@/components/ui/Numeric";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  icon: LucideIcon;
}

export function StatCard({ title, value, change, icon: Icon }: StatCardProps) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted">{title}</p>
          <Numeric as="p" className="mt-1 text-2xl font-semibold text-foreground">
            {value}
          </Numeric>
          {change && (
            <Numeric className="mt-1 block text-xs text-muted">{change}</Numeric>
          )}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/15 text-accent">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}
