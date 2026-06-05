import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/ContactForm";
import { ContactInfo } from "@/components/contact/ContactInfo";
import { Container, Section, SectionHeader } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with PV Motors. Book a test ride, request a quote, or visit our showroom.",
};

export default function ContactPage() {
  return (
    <Section>
      <Container>
        <SectionHeader
          eyebrow="Contact Us"
          title="Let's Get You on the Road"
          description="Book a test ride, request a quote, or ask us anything about KOMAKI electric vehicles."
          align="center"
          className="mx-auto"
        />

        <div className="grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <ContactForm />
          </div>
          <div className="lg:col-span-2">
            <ContactInfo />
          </div>
        </div>
      </Container>
    </Section>
  );
}
