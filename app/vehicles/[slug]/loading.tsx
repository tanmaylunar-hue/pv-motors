import { Container, Section } from "@/components/ui/Section";
import { Skeleton, SkeletonText, SkeletonBlock } from "@/components/ui/Skeleton";

export default function VehicleDetailLoading() {
  return (
    <Section>
      <Container>
        {/* Back Link skeleton */}
        <div className="mb-8 flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-sm" />
          <Skeleton className="h-4 w-32 rounded-sm" />
        </div>

        <div className="space-y-16">
          {/* Main Info Columns */}
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-start">
            {/* Left Column: Image / Gallery Placeholder */}
            <div className="space-y-4">
              {/* Tab selector skeleton */}
              <div className="flex gap-2 pb-3 border-b border-neutral-100">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-8 w-44" />
              </div>
              {/* Main image box skeleton */}
              <SkeletonBlock className="aspect-square w-full !h-auto rounded-none border border-neutral-100" />
              {/* Thumbnails row */}
              <div className="grid grid-cols-5 gap-2.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-square w-full rounded-none" />
                ))}
              </div>
            </div>

            {/* Right Column: Text and CTAs */}
            <div className="space-y-6">
              {/* Badges row */}
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-24" />
              </div>

              {/* Title & Subtitle */}
              <div className="space-y-2">
                <Skeleton className="h-10 w-2/3" />
                <Skeleton className="h-6 w-1/3" />
              </div>

              {/* Tagline */}
              <SkeletonText lines={2} />

              {/* Price panel skeleton */}
              <div className="border-y border-neutral-100 py-4 flex justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-3.5 w-24" />
                  <Skeleton className="h-8 w-36" />
                </div>
                <div className="space-y-2 text-right">
                  <Skeleton className="h-3.5 w-20" />
                  <Skeleton className="h-5 w-28 ml-auto" />
                </div>
              </div>

              {/* Variant selector skeleton */}
              <div className="space-y-3">
                <Skeleton className="h-4 w-36" />
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              </div>

              {/* Specs boxes grid */}
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>

              {/* Action buttons row */}
              <div className="space-y-3 pt-2">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Skeleton className="h-12 flex-1" />
                  <Skeleton className="h-12 flex-1" />
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Skeleton className="h-10 flex-1" />
                </div>
              </div>
            </div>
          </div>

          {/* Lower Section placeholders */}
          <div className="border-t border-neutral-100 pt-16 space-y-4">
            <Skeleton className="h-8 w-48" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
