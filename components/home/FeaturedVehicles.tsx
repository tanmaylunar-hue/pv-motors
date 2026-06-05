import { ArrowRight } from "lucide-react";
import { VehicleCard } from "@/components/vehicles/VehicleCard";
import { Container, Section, SectionHeader } from "@/components/ui/Section";
import { FadeIn } from "@/components/ui/FadeIn";
import { Button } from "@/components/ui/Button";
import { getFeaturedCatalogueItems } from "@/lib/catalogue";

export function FeaturedVehicles() {
  const featured = getFeaturedCatalogueItems();

  return (
    <Section id="featured" className="border-t border-border">
      <Container>
        <FadeIn>
          <SectionHeader
            eyebrow="Catalogue"
            title="Featured Models"
            description="Curated selection of KOMAKI electric vehicles — engineered for performance, designed for the road ahead."
          />
        </FadeIn>

        <div className="grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((item, i) => (
            <FadeIn key={item.id} delay={i * 100}>
              <VehicleCard item={item} variant="minimal" />
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={300}>
          <div className="mt-12 flex justify-center">
            <Button href="/vehicles" variant="outline">
              View Full Catalogue
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </FadeIn>
      </Container>
    </Section>
  );
}
