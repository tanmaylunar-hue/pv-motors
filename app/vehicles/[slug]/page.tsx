import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Battery, Gauge } from "lucide-react";
import { VehicleSpecs } from "@/components/vehicles/VehicleSpecs";
import { VehicleShowroom } from "@/components/vehicles/VehicleShowroom";
import { StockBadge } from "@/components/vehicles/StockBadge";
import { Container, Section } from "@/components/ui/Section";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Numeric } from "@/components/ui/Numeric";
import {
  getCatalogue,
  getCatalogueItemBySlug,
} from "@/lib/catalogue-server";
import { formatPrice, getSpecValue } from "@/lib/catalogue-format";

interface VehicleDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const catalogue = await getCatalogue();
  return catalogue.map((item) => ({ slug: item.slug }));
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: VehicleDetailPageProps) {
  const { slug } = await params;
  const item = await getCatalogueItemBySlug(slug);
  if (!item) return { title: "Vehicle Not Found" };
  return {
    title: `${item.vehicle} — ${item.variant}`,
    description: item.tagline,
  };
}

export default async function VehicleDetailPage({ params }: VehicleDetailPageProps) {
  const { slug } = await params;
  const item = await getCatalogueItemBySlug(slug);

  if (!item) {
    notFound();
  }

  const range = getSpecValue(item, "Range");
  const topSpeed = getSpecValue(item, "Top Speed");

  return (
    <Section>
      <Container>
        <Link
          href="/vehicles"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Catalogue
        </Link>

        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <VehicleShowroom item={item} className="w-full" />
          </div>

          <div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Badge variant="outline">{item.category}</Badge>
              <StockBadge status={item.stockStatus} />
              {item.featured && <Badge variant="accent">Featured</Badge>}
            </div>

            <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              {item.vehicle}
            </h1>
            <p className="mt-1 text-lg text-muted">{item.variant}</p>
            <p className="mt-3 text-muted">{item.tagline}</p>

            <div className="mt-6 flex items-baseline gap-2">
              <Numeric as="p" className="text-3xl font-semibold text-foreground">
                {formatPrice(item.price)}
              </Numeric>
              <span className="text-sm text-muted">ex-showroom</span>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              {range && (
                <div className="border border-border bg-surface p-4">
                  <div className="flex items-center gap-2 text-foreground">
                    <Battery className="h-4 w-4" />
                    <span className="text-xs uppercase tracking-wider text-muted">Range</span>
                  </div>
                  <Numeric as="p" className="mt-1 text-lg font-semibold text-foreground">
                    {range}
                  </Numeric>
                </div>
              )}
              {topSpeed && (
                <div className="border border-border bg-surface p-4">
                  <div className="flex items-center gap-2 text-foreground">
                    <Gauge className="h-4 w-4" />
                    <span className="text-xs uppercase tracking-wider text-muted">Top Speed</span>
                  </div>
                  <Numeric as="p" className="mt-1 text-lg font-semibold text-foreground">
                    {topSpeed}
                  </Numeric>
                </div>
              )}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href={`/contact?vehicle=${encodeURIComponent(item.vehicle)}&variant=${encodeURIComponent(item.variant)}`} size="lg">
                Book Test Ride
              </Button>
              <Button href={`/contact?vehicle=${encodeURIComponent(item.vehicle)}&variant=${encodeURIComponent(item.variant)}`} variant="outline" size="lg">
                Get Quote
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-16">
          <VehicleSpecs item={item} />
        </div>
      </Container>
    </Section>
  );
}
