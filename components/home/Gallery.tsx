"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Container, Section, SectionHeader } from "@/components/ui/Section";
import { FadeIn } from "@/components/ui/FadeIn";
import { X, ZoomIn, ChevronLeft, ChevronRight } from "lucide-react";

interface GalleryItem {
  src: string;
  alt: string;
  title: string;
  tagline: string;
  category: string;
}

interface GalleryProps {
  initialItems: GalleryItem[];
}

const categories = ["all", "Customer Delivery", "Vehicle Collection", "Showroom", "Events", "Reviews"];

export function Gallery({ initialItems }: GalleryProps) {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);

  // Sync active tab changes to reset the lightbox
  const [prevTab, setPrevTab] = useState(activeTab);
  if (activeTab !== prevTab) {
    setPrevTab(activeTab);
    setActiveImageIndex(null);
  }

  // Filter items during render (officially recommended pattern to avoid useEffect set-state cascade)
  const filteredItems = activeTab === "all"
    ? initialItems
    : initialItems.filter((item) => item.category === activeTab);

  const openLightbox = (index: number) => {
    setActiveImageIndex(index);
  };

  const closeLightbox = () => {
    setActiveImageIndex(null);
  };

  const handlePrev = useCallback(() => {
    if (activeImageIndex === null || filteredItems.length === 0) return;
    setActiveImageIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : filteredItems.length - 1));
  }, [activeImageIndex, filteredItems.length]);

  const handleNext = useCallback(() => {
    if (activeImageIndex === null || filteredItems.length === 0) return;
    setActiveImageIndex((prev) => (prev !== null && prev < filteredItems.length - 1 ? prev + 1 : 0));
  }, [activeImageIndex, filteredItems.length]);

  // Keyboard navigation inside lightbox
  useEffect(() => {
    if (activeImageIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeLightbox();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeImageIndex, handlePrev, handleNext]);

  return (
    <Section id="gallery" className="border-t border-border bg-background scroll-mt-20">
      <Container>
        <FadeIn>
          <SectionHeader
            eyebrow="Visual Experience"
            title="Showroom Gallery"
            description="A visual look at the premium aesthetics and real-world dynamics of KOMAKI electric vehicles."
          />
        </FadeIn>

        {/* Category Tabs */}
        <FadeIn>
          <div className="mb-8 flex flex-wrap gap-2 border-b border-border pb-4">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveTab(cat)}
                className={`px-5 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all duration-200 border active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 ${
                  activeTab === cat
                    ? "bg-black text-white border-black"
                    : "text-muted hover:text-foreground hover:bg-neutral-50/50 bg-background border-border"
                }`}
              >
                {cat === "all" ? "All Showcase" : cat}
              </button>
            ))}
          </div>
        </FadeIn>

        {/* Gallery Grid */}
        {filteredItems.length === 0 ? (
          <FadeIn>
            <div className="border border-dashed border-border py-12 text-center bg-surface/10">
              <p className="text-sm text-muted">No images available in this category showcase.</p>
            </div>
          </FadeIn>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {filteredItems.map((item, index) => (
              <FadeIn key={item.src} delay={index * 50}>
                <div 
                  className="relative aspect-[4/3] w-full overflow-hidden group cursor-pointer border border-border bg-surface hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(0,0,0,0.03)] transition-all duration-300" 
                  onClick={() => openLightbox(index)}
                >
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.035]"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                    <ZoomIn className="absolute top-4 right-4 h-5 w-5 text-white/70" />
                    <span className="text-[9px] uppercase tracking-widest text-white/60 mb-1 font-semibold">
                      {item.category}
                    </span>
                    <h4 className="font-display text-lg font-medium text-white">{item.title}</h4>
                    <p className="text-xs text-white/80 mt-1 line-clamp-1">{item.tagline}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        )}
      </Container>

      {/* Lightbox Overlay */}
      {activeImageIndex !== null && filteredItems[activeImageIndex] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md transition-all duration-300">
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white/70 hover:text-white p-2 z-50 rounded-full bg-white/5 border border-white/10"
            aria-label="Close gallery lightbox"
          >
            <X className="h-6 w-6" />
          </button>

          <button
            onClick={handlePrev}
            className="absolute left-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition-all hover:bg-white/10 hover:text-white"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="relative max-h-[85vh] max-w-[90vw] overflow-hidden flex flex-col items-center">
            <div className="relative aspect-[4/3] w-screen max-w-4xl max-h-[70vh]">
              <Image
                src={filteredItems[activeImageIndex].src}
                alt={filteredItems[activeImageIndex].alt}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>
            <div className="mt-4 text-center text-white px-6">
              <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-semibold">
                {filteredItems[activeImageIndex].category}
              </span>
              <h3 className="font-display text-xl font-medium mt-0.5">
                {filteredItems[activeImageIndex].title}
              </h3>
              <p className="text-sm text-neutral-400 mt-1">
                {filteredItems[activeImageIndex].tagline}
              </p>
            </div>
          </div>

          <button
            onClick={handleNext}
            className="absolute right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition-all hover:bg-white/10 hover:text-white"
            aria-label="Next image"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </Section>
  );
}
