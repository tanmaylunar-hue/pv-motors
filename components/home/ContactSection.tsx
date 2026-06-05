import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { ContactForm } from "@/components/contact/ContactForm";
import { Container, Section, SectionHeader } from "@/components/ui/Section";
import { FadeIn } from "@/components/ui/FadeIn";
import { CONTACT_INFO } from "@/lib/constants";

const contactItems = [
  {
    icon: Phone,
    label: "Phone",
    value: CONTACT_INFO.phone,
    href: `tel:${CONTACT_INFO.phone.replace(/\s/g, "")}`,
  },
  {
    icon: Mail,
    label: "Email",
    value: CONTACT_INFO.email,
    href: `mailto:${CONTACT_INFO.email}`,
  },
  {
    icon: MapPin,
    label: "Showroom",
    value: CONTACT_INFO.address,
  },
  {
    icon: Clock,
    label: "Hours",
    value: CONTACT_INFO.hours,
  },
];

export function ContactSection() {
  return (
    <Section id="contact" className="border-t border-border">
      <Container>
        <FadeIn>
          <SectionHeader
            eyebrow="Get in Touch"
            title="Visit Our Showroom"
            description="Book a test ride, request a quote, or speak with our EV specialists."
          />
        </FadeIn>

        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <FadeIn direction="left">
            <div className="space-y-8">
              {contactItems.map((item) => (
                <div key={item.label} className="flex items-start gap-5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-border">
                    <item.icon className="h-4 w-4 text-foreground" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-muted">
                      {item.label}
                    </p>
                    {item.href ? (
                      <a
                        href={item.href}
                        className="mt-1 block text-sm text-foreground transition-opacity hover:opacity-70"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p className="mt-1 text-sm leading-relaxed text-foreground">
                        {item.value}
                      </p>
                    )}
                  </div>
                </div>
              ))}

              <div className="border border-border bg-surface-elevated p-6">
                <p className="font-display text-xl font-medium text-foreground">
                  Ready to go electric?
                </p>
                <p className="mt-2 text-sm text-muted">
                  Schedule a free test ride and experience the KOMAKI difference
                  firsthand at our Noida showroom.
                </p>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={200}>
            <ContactForm />
          </FadeIn>
        </div>
      </Container>
    </Section>
  );
}
