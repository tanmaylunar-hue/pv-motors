import { ArrowRight, ArrowDown } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Numeric } from "@/components/ui/Numeric";
import { SITE_TAGLINE } from "@/lib/constants";

export function Hero() {
  return (
    <section id="home" className="relative min-h-[90vh] overflow-hidden bg-grid">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />

      <div className="relative mx-auto flex min-h-[90vh] max-w-7xl flex-col justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl">
          <div className="animate-fade-in mb-8 flex items-center gap-4">
            <div className="relative h-6 w-6 shrink-0">
              <Image
                src="/emblem.png"
                alt="PV Motors Logo"
                fill
                priority
                className="object-contain filter grayscale opacity-70"
              />
            </div>
            <div className="h-px w-8 animate-line-grow bg-foreground/30" />
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted">
              {SITE_TAGLINE}
            </p>
          </div>

          <h1 className="font-display text-5xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-6xl lg:text-7xl xl:text-8xl">
            <span className="animate-fade-up opacity-0-start block animation-delay-75">
              The Future
            </span>
            <span className="animate-fade-up opacity-0-start block animation-delay-150 text-muted">
              Is Electric.
            </span>
          </h1>

          <p className="animate-fade-up opacity-0-start animation-delay-200 mt-8 max-w-lg text-base leading-relaxed text-muted sm:text-lg">
            Experience KOMAKI&apos;s finest electric vehicles at PV Motors — where
            premium design meets zero-emission performance.
          </p>

          <div className="animate-fade-up opacity-0-start animation-delay-250 mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Button href="/vehicles" size="lg">
              Explore Collection
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button href="/contact" variant="outline" size="lg">
              Book Test Ride
            </Button>
          </div>
        </div>

        <div className="animate-fade-up opacity-0-start animation-delay-300 mt-20 grid grid-cols-2 gap-px border border-border bg-border sm:grid-cols-4">
          {[
            { value: "220 km", label: "Max Range" },
            { value: "100 km/h", label: "Top Speed" },
            { value: "5+", label: "Models" },
            { value: "100%", label: "Electric" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center justify-center bg-background px-6 py-8 sm:px-8"
            >
              <Numeric
                as="p"
                className="text-2xl font-semibold text-foreground sm:text-3xl"
              >
                {stat.value}
              </Numeric>
              <p className="mt-1 text-xs uppercase tracking-widest text-muted">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        <a
          href="#featured"
          className="animate-fade-in opacity-0-start animation-delay-300 mt-16 flex items-center gap-2 text-xs uppercase tracking-widest text-muted transition-colors hover:text-foreground"
        >
          <ArrowDown className="h-4 w-4 animate-bounce" />
          Scroll to explore
        </a>
      </div>
    </section>
  );
}
