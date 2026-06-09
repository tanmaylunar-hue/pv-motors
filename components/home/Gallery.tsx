"use client";

import { useState } from "react";
import Image from "next/image";
import { Container, Section, SectionHeader } from "@/components/ui/Section";
import { FadeIn } from "@/components/ui/FadeIn";
import { ZoomIn } from "lucide-react";
import { ImageViewerModal } from "@/components/vehicles/ImageViewerModal";

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

  const imageUrls = filteredItems.map((item) => item.src);
  const captions = filteredItems.map((item) => ({
    title: item.title,
    tagline: item.tagline,
    category: item.category,
  }));

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
          <div className="mb-8 flex overflow-x-auto whitespace-nowrap flex-nowrap gap-2 border-b border-border pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveTab(cat)}
                className={`shrink-0 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all duration-200 border active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                  activeTab === cat
                    ? "bg-[var(--accent)] text-[var(--accent-foreground)] border-[var(--accent)] shadow-[0_4px_12px_rgba(224,79,22,0.2)]"
                    : "text-muted hover:text-foreground hover:bg-surface-elevated bg-background border-border"
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
                  className="relative aspect-[4/3] w-full overflow-hidden group cursor-pointer border border-border hover:border-[var(--accent)]/30 bg-surface hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(224,79,22,0.04)] transition-all duration-300" 
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

      <ImageViewerModal
        images={imageUrls}
        initialIndex={activeImageIndex ?? 0}
        isOpen={activeImageIndex !== null}
        onClose={closeLightbox}
        captions={captions}
      />
    </Section>
  );
}
