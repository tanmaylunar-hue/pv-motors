import { Headphones, Shield, Truck, Wrench } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Container, Section, SectionHeader } from "@/components/ui/Section";

const features = [
  {
    icon: Shield,
    title: "Authorized Dealer",
    description:
      "Genuine KOMAKI vehicles with full manufacturer warranty and certified parts.",
  },
  {
    icon: Wrench,
    title: "Expert Service",
    description:
      "Trained technicians and dedicated service bays for hassle-free maintenance.",
  },
  {
    icon: Truck,
    title: "Doorstep Delivery",
    description:
      "Home delivery and registration assistance across the NCR region.",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description:
      "Round-the-clock roadside assistance and customer care for peace of mind.",
  },
];

export function WhyChooseUs() {
  return (
    <Section>
      <Container>
        <SectionHeader
          eyebrow="Why PV Motors"
          title="The Premium EV Experience"
          description="More than a showroom — we're your long-term partner in electric mobility."
          align="center"
          className="mx-auto"
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Card key={feature.title} hover className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 font-semibold text-foreground">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-muted">{feature.description}</p>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}
