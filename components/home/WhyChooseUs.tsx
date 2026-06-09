import * as Icons from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Container, Section, SectionHeader } from "@/components/ui/Section";
import { FadeIn } from "@/components/ui/FadeIn";
import type { WhyChooseUsItem } from "@/lib/homepage-settings";

interface WhyChooseUsProps {
  items: WhyChooseUsItem[];
}

export function WhyChooseUs({ items }: WhyChooseUsProps) {
  return (
    <Section id="why-choose-us" className="border-t border-border bg-background relative">
      <Container>
        <FadeIn>
          <SectionHeader
            eyebrow="Why PV Motors"
            title="The Premium EV Experience"
            description="We are more than just a showroom — we are your dedicated lifetime partner in clean electric mobility."
            align="center"
            className="mx-auto"
          />
        </FadeIn>
        
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-8 md:mt-10">
          {items.map((feature, i) => {
            // Resolve the Lucide icon dynamically from the string name
            const IconComponent = (Icons as any)[feature.icon] || Icons.CheckCircle2;

            return (
              <FadeIn key={feature.id} delay={i * 100} className="h-full">
                <Card className="flex flex-col items-center text-center p-8 bg-background border border-border/80 hover:border-[var(--accent)]/30 hover:shadow-[0_8px_30px_rgba(0,0,0,0.025)] hover:-translate-y-0.5 transition-all duration-200 rounded-none group h-full">
                  <div className="mb-5 flex h-14 w-14 items-center justify-center bg-surface-elevated border border-border/60 text-[var(--accent)] group-hover:bg-[var(--accent)]/10 group-hover:border-[var(--accent)]/30 transition-all duration-200 rounded-none shadow-sm">
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <h3 className="mb-3 text-base font-semibold text-foreground tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-muted">
                    {feature.description}
                  </p>
                </Card>
              </FadeIn>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
