"use client";

import { useEffect, useState, useRef } from "react";
import * as Icons from "lucide-react";
import { Container, Section, SectionHeader } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { FadeIn } from "@/components/ui/FadeIn";
import type { OurAdvantagesItem } from "@/lib/homepage-settings";

interface OurAdvantagesProps {
  items: OurAdvantagesItem[];
}

function parseValueString(val: string) {
  const match = val.match(/^([^\d]*)([\d.]+)([^\d]*)$/);
  if (!match) return { number: null, prefix: val, suffix: "" };
  return {
    prefix: match[1],
    number: parseFloat(match[2]),
    suffix: match[3],
  };
}

function AnimatedAdvantageValue({ value, duration = 1500 }: { value: string; duration?: number }) {
  const { number, prefix, suffix } = parseValueString(value);
  const [count, setCount] = useState(0);
  const elementRef = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (number === null) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          let startTime: number | null = null;
          const startVal = 0;
          const endVal = number;
          const range = endVal - startVal;

          const step = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const easeOutQuad = progress * (2 - progress);
            const currentVal = startVal + easeOutQuad * range;

            if (endVal % 1 !== 0) {
              setCount(Number(currentVal.toFixed(1)));
            } else {
              setCount(Math.floor(currentVal));
            }

            if (progress < 1) {
              window.requestAnimationFrame(step);
            } else {
              setCount(endVal);
            }
          };

          window.requestAnimationFrame(step);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [number, duration]);

  if (number === null) {
    return <span>{value}</span>;
  }

  return (
    <span ref={elementRef} className="font-numeric">
      {prefix}
      {count}
      {suffix}
    </span>
  );
}

export function OurAdvantages({ items }: OurAdvantagesProps) {
  return (
    <Section id="advantages" className="border-t border-border bg-surface-elevated/40 relative">
      <Container>
        <FadeIn>
          <SectionHeader
            eyebrow="Our Advantages"
            title="Why We Stand Out"
            description="The key performance guarantees and service standards that make PV Motors the premium EV dealer in the NCR region."
            align="center"
            className="mx-auto"
          />
        </FadeIn>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-10">
          {items.map((item, i) => {
            // Dynamically resolve icon from Lucide React
            const IconComponent = (Icons as any)[item.icon] || Icons.CheckCircle2;

            return (
              <FadeIn key={item.id} delay={i * 100} className="h-full">
                <Card className="flex flex-col h-full bg-background border border-border/80 hover:border-[var(--accent)]/30 hover:shadow-[0_8px_30px_rgba(0,0,0,0.025)] hover:-translate-y-0.5 transition-all duration-200 rounded-none group p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex h-12 w-12 items-center justify-center bg-surface-elevated border border-border/60 text-[var(--accent)] group-hover:bg-[var(--accent)]/10 group-hover:border-[var(--accent)]/30 transition-all duration-200 rounded-none shadow-sm">
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <span className="font-numeric text-lg font-bold text-[var(--accent)] tracking-tight">
                      <AnimatedAdvantageValue value={item.value} />
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-2 tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-xs text-muted leading-relaxed">
                    {item.description}
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
