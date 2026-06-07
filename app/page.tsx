export const dynamic = "force-dynamic";

import { Hero } from "@/components/home/Hero";
import { FeaturedVehicles } from "@/components/home/FeaturedVehicles";
import { VehiclesCatalog } from "@/components/vehicles/VehiclesCatalog";
import { CustomerReviews } from "@/components/home/CustomerReviews";
import { Gallery } from "@/components/home/Gallery";
import { ContactSection } from "@/components/home/ContactSection";
import { getCatalogue } from "@/lib/catalogue-server";
import { Container, Section } from "@/components/ui/Section";
import { prisma } from "@/lib/db";

export default async function HomePage() {
  const catalogue = await getCatalogue();

  let galleryItems: {
    src: string;
    alt: string;
    title: string;
    tagline: string;
    category: string;
  }[] = [];
  try {
    const fromDb = await prisma.galleryImage.findMany({
      where: { published: true },
      orderBy: [
        { sequence: "asc" },
        { createdAt: "desc" }
      ],
    });
    galleryItems = fromDb.map((img) => ({
      src: img.url,
      alt: img.title ?? "Showroom Gallery Image",
      title: img.title ?? "",
      tagline: img.tagline ?? "",
      category: img.category,
    }));
  } catch {
    // Ignore database errors and use fallbacks
  }

  const defaultGallery = [
    {
      src: "/gallery/komaki_venice_lifestyle.png",
      alt: "Komaki Venice Lifestyle Showcase",
      title: "Urban Luxury",
      tagline: "Elegant styling for the modern city commuter.",
      category: "Showroom",
    },
    {
      src: "/gallery/komaki_ranger_sunset.png",
      alt: "Komaki Ranger Sunset Highway",
      title: "Cruising Speed",
      tagline: "Unmatched performance on the open road.",
      category: "Vehicle Collection",
    },
    {
      src: "/gallery/komaki_scooter_neon.png",
      alt: "Komaki Scooter Neon Charging",
      title: "Futuristic Charging",
      tagline: "Eco-friendly power, charged for the journey ahead.",
      category: "Showroom",
    },
  ];

  const finalGallery = galleryItems.length > 0 ? galleryItems : defaultGallery;

  return (
    <>
      <Hero />
      <FeaturedVehicles />
      <Section className="border-t border-border bg-background">
        <Container>
          <VehiclesCatalog items={catalogue} />
        </Container>
      </Section>
      <CustomerReviews />
      <Gallery initialItems={finalGallery} />
      <ContactSection />
    </>
  );
}
