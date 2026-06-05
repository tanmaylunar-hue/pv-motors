import Image from "next/image";
import { cn } from "@/lib/utils";
import { getPrimaryImage } from "@/lib/catalogue";
import type { CatalogueItem } from "@/types/catalogue";

interface VehicleImageProps {
  item: CatalogueItem;
  className?: string;
  priority?: boolean;
}

export function VehicleImage({ item, className, priority = false }: VehicleImageProps) {
  const src = getPrimaryImage(item);

  return (
    <div
      className={cn(
        "relative overflow-hidden border border-border bg-surface",
        className
      )}
    >
      <Image
        src={src}
        alt={`${item.vehicle} ${item.variant}`}
        fill
        className="object-contain p-6"
        sizes="(max-width: 768px) 100vw, 50vw"
        priority={priority}
      />
    </div>
  );
}
