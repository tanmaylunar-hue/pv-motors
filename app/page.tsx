import { Hero } from "@/components/home/Hero";
import { FeaturedVehicles } from "@/components/home/FeaturedVehicles";
import { CustomerReviews } from "@/components/home/CustomerReviews";
import { ContactSection } from "@/components/home/ContactSection";

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedVehicles />
      <CustomerReviews />
      <ContactSection />
    </>
  );
}
