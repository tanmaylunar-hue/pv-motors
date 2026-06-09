import { Star, Quote, Check } from "lucide-react";
import { Container, Section, SectionHeader } from "@/components/ui/Section";
import { FadeIn } from "@/components/ui/FadeIn";
import { Numeric } from "@/components/ui/Numeric";
import { reviews } from "@/lib/reviews";

function ReviewCard({ review }: { review: (typeof reviews)[0] }) {
  return (
    <div className="w-[280px] shrink-0 border border-border bg-background p-6 sm:p-8 sm:w-[380px] transition-all duration-300 hover:shadow-[0_12px_30px_rgba(224,79,22,0.03)] hover:border-[var(--accent)]/30 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-4">
          <Quote className="h-6 w-6 text-muted/20" />
          <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 px-2 py-0.5 text-[8px] uppercase tracking-widest font-semibold">
            <Check className="h-2.5 w-2.5" /> Verified Buyer
          </div>
        </div>
        <p className="mb-6 text-sm leading-relaxed text-muted font-normal italic">
          &ldquo;{review.text}&rdquo;
        </p>
      </div>
      <div>
        <div className="flex gap-1 mb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-3.5 w-3.5 ${
                i < review.rating
                  ? "fill-amber-400 text-amber-400"
                  : "text-neutral-200"
              }`}
            />
          ))}
        </div>
        <div className="border-t border-border/60 pt-4">
          <p className="text-sm font-semibold text-foreground">{review.name}</p>
          <p className="mt-0.5 text-xs text-muted/80 uppercase tracking-wider text-[10px]">
            {review.vehicle} &middot; {review.location}
          </p>
        </div>
      </div>
    </div>
  );
}

export function CustomerReviews() {
  const doubled = [...reviews, ...reviews];

  return (
    <Section id="reviews" className="overflow-hidden border-t border-border bg-surface">
      <Container>
        <FadeIn>
          <SectionHeader
            eyebrow="Testimonials"
            title="What Our Customers Say"
            description="Real experiences from riders who chose PV Motors for their electric journey."
            align="center"
            className="mx-auto"
          />
        </FadeIn>
      </Container>

      <FadeIn delay={200}>
        <div className="relative mt-4">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-surface to-transparent sm:w-32" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-surface to-transparent sm:w-32" />

          <div className="flex animate-marquee gap-px">
            {doubled.map((review, i) => (
              <ReviewCard key={`${review.id}-${i}`} review={review} />
            ))}
          </div>
        </div>
      </FadeIn>

      <Container>
        <FadeIn delay={300}>
          <div className="mt-8 grid gap-px border border-border/20 bg-border/20 grid-cols-1 md:grid-cols-3">
            {[
              { value: "4.9", label: "Average Rating" },
              { value: "500+", label: "Happy Customers" },
              { value: "98%", label: "Would Recommend" },
            ].map((stat) => (
              <div key={stat.label} className="bg-surface-elevated px-6 py-5 md:py-8 text-center flex flex-col justify-center items-center">
                <Numeric as="p" className="text-3xl font-semibold text-foreground">
                  {stat.value}
                </Numeric>
                {stat.label === "Average Rating" && (
                  <div className="flex gap-0.5 mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                )}
                <p className="mt-2 text-xs uppercase tracking-widest text-muted font-medium">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </FadeIn>
      </Container>
    </Section>
  );
}
