import Image from "next/image";
import Link from "next/link";
import { Container, Section, SectionHeader } from "@/components/ui/Section";
import { FadeIn } from "@/components/ui/FadeIn";
import { Button } from "@/components/ui/Button";
import { getFeaturedCatalogueItems } from "@/lib/catalogue-server";
import { formatPrice, getPrimaryImage } from "@/lib/catalogue-format";
import { StockBadge } from "@/components/vehicles/StockBadge";

export async function FeaturedVehicles() {
  const featured = await getFeaturedCatalogueItems();

  return (
    <Section id="featured" className="border-t border-border bg-surface/25">
      <Container>
        <FadeIn>
          <SectionHeader
            eyebrow="Curated Showcase"
            title="Featured Vehicles"
            description="Our top-tier electric models, chosen for their outstanding performance, design, and range."
          />
        </FadeIn>

        {featured.length === 0 ? (
          <div className="border border-dashed border-border py-12 text-center bg-background">
            <p className="text-sm text-muted">No featured vehicles marked at the moment.</p>
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((item, i) => (
              <FadeIn key={item.id} delay={i * 100} className="flex h-full">
                <Link
                  href={`/vehicles/${item.slug}`}
                  className="flex w-full flex-col border border-border bg-background p-6 transition-all duration-300 hover:shadow-lg hover:border-[var(--accent)]/30 group"
                >
                  {/* Vehicle Image */}
                  <div className="relative mb-6 aspect-[4/3] w-full overflow-hidden border border-border bg-surface">
                    <Image
                      src={getPrimaryImage(item)}
                      alt={`${item.vehicle} ${item.variant}`}
                      fill
                      className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>

                  {/* Stock Status & Category */}
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-wider text-muted font-semibold bg-surface-elevated px-2 py-0.5 border border-border">
                      {item.category}
                    </span>
                    <StockBadge status={item.stockStatus} />
                  </div>

                  {/* Vehicle Name */}
                  <h3 className="font-display text-2xl font-medium text-foreground tracking-tight group-hover:text-[var(--accent)] transition-colors duration-300">
                    {item.vehicle}
                  </h3>
                  <p className="text-sm text-muted mb-2">{item.variant}</p>
                  <p className="text-xs text-muted line-clamp-2 mb-6 italic">{item.tagline}</p>

                  {/* Starting Price & Explore Button */}
                  <div className="mt-auto pt-4 border-t border-border flex flex-col gap-4">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-muted block mb-0.5">Starting Price</span>
                      <span className="font-numeric text-xl font-bold text-foreground">
                        {formatPrice(item.price)}
                      </span>
                    </div>
                    <div className="w-full justify-center inline-flex items-center gap-2 font-medium transition-all duration-200 ease-out active:scale-[0.97] min-h-[48px] md:min-h-0 bg-[var(--accent)] text-[var(--accent-foreground)] hover:bg-[var(--accent)]/90 border border-[var(--accent)] px-6 py-2.5 text-sm shadow-sm font-sans uppercase tracking-wider">
                      Explore Vehicle
                    </div>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
        )}
      </Container>
    </Section>
  );
}
