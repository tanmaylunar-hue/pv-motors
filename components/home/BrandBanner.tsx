import { Button } from "@/components/ui/Button";
import { Container, Section } from "@/components/ui/Section";

export function BrandBanner() {
  return (
    <Section className="py-0">
      <Container>
        <div className="relative overflow-hidden rounded-2xl border border-accent/20 bg-gradient-to-r from-accent/10 via-surface to-surface p-6 md:p-12">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-accent/10 blur-2xl" />
          <div className="relative max-w-2xl">
            <p className="mb-2 text-sm font-medium uppercase tracking-widest text-accent">
              Limited Time Offer
            </p>
            <h2 className="text-2xl font-bold text-foreground md:text-3xl">
              Get up to ₹15,000 off on select KOMAKI models
            </h2>
            <p className="mt-3 text-muted">
              Visit our showroom or book a test ride online. Exchange bonus and easy
              EMI options available.
            </p>
            <div className="mt-6">
              <Button href="/contact" className="w-full sm:w-auto">Claim Your Offer</Button>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
