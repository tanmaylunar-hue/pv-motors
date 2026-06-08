import { Container, Section, SectionHeader } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { FadeIn } from "@/components/ui/FadeIn";
import type { TrustBuildersItem } from "@/lib/homepage-settings";

interface TrustBuildersProps {
  items: TrustBuildersItem[];
}

export function TrustBuilders({ items }: TrustBuildersProps) {
  return (
    <Section id="trust-builders" className="border-t border-border bg-background relative overflow-hidden">
      <Container>
        <FadeIn>
          <SectionHeader
            eyebrow="Our Credentials"
            title="Dealership Statistics"
            description="Proven metrics that reflect our commitment to excellence, transparency, and consumer satisfaction."
            align="center"
            className="mx-auto"
          />
        </FadeIn>

        {/* 4 columns layout matching the 4 statistics items */}
        <div className="grid gap-6 grid-cols-2 lg:grid-cols-4 mt-10">
          {items.map((stat, i) => (
            <FadeIn key={stat.id} delay={i * 100} className="h-full">
              <Card className="flex flex-col items-center justify-center text-center p-8 bg-background border border-border/80 hover:border-foreground/20 hover:shadow-[0_8px_30px_rgba(0,0,0,0.025)] transition-all duration-200 rounded-none h-full shadow-sm">
                <span className="text-4xl md:text-5xl font-bold font-numeric text-foreground tracking-tight flex items-baseline">
                  {stat.value}
                  <span className="text-[var(--accent)] ml-0.5">{stat.suffix}</span>
                </span>
                <span className="mt-3 text-xs uppercase tracking-widest text-muted font-medium block">
                  {stat.label}
                </span>
              </Card>
            </FadeIn>
          ))}
        </div>
      </Container>
    </Section>
  );
}
