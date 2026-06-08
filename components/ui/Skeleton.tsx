import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-neutral-200 dark:bg-neutral-800",
        className
      )}
      {...props}
    />
  );
}

export function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2.5 w-full", className)}>
      {Array.from({ length: lines }).map((_, idx) => {
        // Vary lengths of text lines for natural aesthetic
        const widthClass =
          idx === lines - 1
            ? "w-4/5"
            : idx % 2 === 0
            ? "w-full"
            : "w-11/12";
        return (
          <Skeleton
            key={idx}
            className={cn("h-3.5 rounded-sm", widthClass)}
          />
        );
      })}
    </div>
  );
}

export function SkeletonBlock({
  className,
  ...props
}: SkeletonProps) {
  return (
    <Skeleton
      className={cn("h-40 w-full rounded-sm", className)}
      {...props}
    />
  );
}
