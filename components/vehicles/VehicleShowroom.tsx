"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Maximize2, MoveHorizontal, Box } from "lucide-react";
import type { CatalogueItem } from "@/types/catalogue";
import { ImageViewerModal } from "@/components/vehicles/ImageViewerModal";
import { Vehicle360Viewer } from "@/components/vehicles/Vehicle360Viewer";

interface VehicleShowroomProps {
  item: CatalogueItem;
  className?: string;
}

export function VehicleShowroom({ item, className }: VehicleShowroomProps) {
  const [activeTab, setActiveTab] = useState<"gallery" | "360">("gallery");
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const touchStartX = useRef<number | null>(null);
  
  const images = item.images ?? [];
  const images360 = item.images360 ?? [];
  const has360 = images360.length > 0;

  // Sync props to state during render (officially recommended pattern in React to avoid useEffect cascade)
  const [prevItem, setPrevItem] = useState(item);
  if (item !== prevItem) {
    setPrevItem(item);
    setActiveImageIndex(0);
    setActiveTab("gallery");
  }

  // Navigate standard images (wrapped in useCallback for useEffect dependencies)
  const handlePrev = useCallback(() => {
    if (images.length === 0) return;
    setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  }, [images.length]);

  const handleNext = useCallback(() => {
    if (images.length === 0) return;
    setActiveImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  }, [images.length]);

  // Keyboard navigation for active gallery preview
  useEffect(() => {
    if (activeTab !== "gallery" || isModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTab, isModalOpen, handlePrev, handleNext]);

  // Touch Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      touchStartX.current = e.touches[0].clientX;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || !e.changedTouches[0]) return;
    
    const diffX = e.changedTouches[0].clientX - touchStartX.current;
    const swipeThreshold = 50;

    if (diffX > swipeThreshold) {
      handlePrev();
    } else if (diffX < -swipeThreshold) {
      handleNext();
    }
    
    touchStartX.current = null;
  };

  if (images.length === 0) {
    return (
      <div className="flex aspect-square w-full items-center justify-center border border-border bg-surface text-sm text-muted">
        No images available.
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Mode Switcher Tabs (Only if 360 images are available) */}
      {has360 && (
        <div className="mb-6 flex gap-2 border-b border-border pb-3">
          <button
            onClick={() => setActiveTab("gallery")}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all border ${
              activeTab === "gallery"
                ? "bg-black text-white border-black"
                : "bg-background text-muted border-border hover:bg-surface-elevated hover:text-foreground"
            }`}
          >
            Showroom Gallery
          </button>
          <button
            onClick={() => setActiveTab("360")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all border ${
              activeTab === "360"
                ? "bg-black text-white border-black"
                : "bg-background text-muted border-border hover:bg-surface-elevated hover:text-foreground"
            }`}
          >
            <Box className="h-3.5 w-3.5" />
            Interactive 360° View
          </button>
        </div>
      )}

      {/* Showroom Display */}
      {activeTab === "360" && has360 ? (
        <Vehicle360Viewer images360={images360} vehicleName={item.vehicle} />
      ) : (
        <div className="flex flex-col">
          {/* Main Cover Image Display */}
          <div
            className="group relative aspect-square w-full cursor-zoom-in overflow-hidden border border-border bg-surface select-none"
            onClick={() => setIsModalOpen(true)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <Image
              src={images[activeImageIndex]}
              alt={`${item.vehicle} ${item.variant}`}
              fill
              className="object-contain p-6 transition-transform duration-500 group-hover:scale-102"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />

            {/* Hover Fullscreen overlay hint */}
            <div className="absolute right-4 top-4 rounded-full bg-black/60 border border-white/10 p-2.5 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 hidden sm:block">
              <Maximize2 className="h-4 w-4" />
            </div>

            {/* Arrow Navigation Controls */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/80 text-foreground shadow-sm transition-all hover:bg-background active:scale-90"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/80 text-foreground shadow-sm transition-all hover:bg-background active:scale-90"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            {/* Bottom Swipe Hint for Mobile */}
            <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1 text-[10px] font-medium text-white/80 backdrop-blur-sm sm:hidden">
              <MoveHorizontal className="h-3 w-3" />
              Swipe to browse
            </div>
          </div>

          {/* Sub-thumbnails gallery list */}
          {images.length > 1 && (
            <div className="mt-4 grid grid-cols-5 gap-2.5">
              {images.map((src, index) => (
                <button
                  key={src}
                  onClick={() => setActiveImageIndex(index)}
                  className={`relative aspect-square overflow-hidden border transition-all ${
                    activeImageIndex === index
                      ? "border-black scale-102 ring-1 ring-black"
                      : "border-border opacity-70 hover:opacity-100 hover:border-black/50"
                  }`}
                >
                  <Image
                    src={src}
                    alt={`${item.vehicle} thumbnail ${index + 1}`}
                    fill
                    className="object-contain p-1.5 bg-surface"
                    sizes="120px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Fullscreen Interactive Zoomer Modal */}
      <ImageViewerModal
        images={images}
        initialIndex={activeImageIndex}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
