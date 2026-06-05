import { Star, Quote } from "lucide-react";
import { Container, Section, SectionHeader } from "@/components/ui/Section";
import { FadeIn } from "@/components/ui/FadeIn";
import { Numeric } from "@/components/ui/Numeric";
import { reviews } from "@/lib/reviews";

function ReviewCard({ review }: { review: (typeof reviews)[0] }) {
  return (
    <div className="w-[340px] shrink-0 border border-border bg-surface p-8 sm:w-[380px]">
      <Quote className="mb-4 h-6 w-6 text-muted/40" />
      <p className="mb-6 text-sm leading-relaxed text-muted">{review.text}</p>
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-3.5 w-3.5 ${
              i < review.rating
                ? "fill-foreground text-foreground"
                : "text-border"
            }`}
          />
        ))}
      </div>
      <div className="mt-4 border-t border-border pt-4">
        <p className="text-sm font-medium text-foreground">{review.name}</p>
        <p className="mt-0.5 text-xs text-muted">
          {review.vehicle} &middot; {review.location}
        </p>
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
          <div className="mt-12 grid gap-px border border-border bg-border sm:grid-cols-3">
            {[
              { value: "4.9", label: "Average Rating" },
              { value: "500+", label: "Happy Customers" },
              { value: "98%", label: "Would Recommend" },
            ].map((stat) => (
              <div key={stat.label} className="bg-surface px-6 py-8 text-center">
                <Numeric as="p" className="text-3xl font-semibold text-foreground">
                  {stat.value}
                </Numeric>
                <p className="mt-1 text-xs uppercase tracking-widest text-muted">
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
