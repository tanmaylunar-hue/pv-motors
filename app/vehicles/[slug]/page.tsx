import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { VehicleDetailsClient } from "@/components/vehicles/VehicleDetailsClient";
import { Container, Section } from "@/components/ui/Section";
import {
  getCatalogue,
  getCatalogueItemBySlug,
} from "@/lib/catalogue-server";

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

  // Fetch all variants of the same vehicle
  const allCatalogue = await getCatalogue();
  const allVariants = allCatalogue.filter((v) => v.vehicle === item.vehicle);

  // Fetch related vehicles of the same category, excluding variants of this vehicle itself
  // and sorting by closest price difference to make recommendations highly relevant.
  const related = allCatalogue
    .filter((v) => v.vehicle !== item.vehicle && v.category === item.category)
    .sort((a, b) => Math.abs(a.price - item.price) - Math.abs(b.price - item.price));

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

        <VehicleDetailsClient
          item={item}
          allVariants={allVariants}
          related={related}
        />
      </Container>
    </Section>
  );
}

