"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import { X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";

interface CaptionInfo {
  title: string;
  tagline?: string;
  category?: string;
}

interface ImageViewerModalProps {
  images: string[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
  captions?: CaptionInfo[];
}

export function ImageViewerModal({
  images,
  initialIndex,
  isOpen,
  onClose,
  captions,
}: ImageViewerModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Sync props to state during render (officially recommended pattern in React to avoid useEffect cascade)
  const [prevInitialIndex, setPrevInitialIndex] = useState(initialIndex);
  if (initialIndex !== prevInitialIndex) {
    setPrevInitialIndex(initialIndex);
    setCurrentIndex(initialIndex);
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ dist: number; scale: number } | null>(null);
  const touchStartX = useRef<number | null>(null);
  const lastTouchTime = useRef<number>(0);

  // Prev / Next actions (declared before useEffect to avoid TDZ / access-before-declaration)
  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [images.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [images.length]);

  const selectIndex = (index: number) => {
    setCurrentIndex(index);
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Reset zoom settings
  const resetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Handle Keyboard Arrows & Escape
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handlePrev, handleNext, onClose]);

  // Lock body scrolling when fullscreen viewer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Register raw touchmove listener with passive: false to prevent background scroll and browser zoom
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !isOpen) return;

    const handleTouchMoveRaw = (e: TouchEvent) => {
      if (e.touches.length > 1 || scale > 1) {
        if (e.cancelable) e.preventDefault();
      }
    };

    container.addEventListener("touchmove", handleTouchMoveRaw, { passive: false });
    return () => {
      container.removeEventListener("touchmove", handleTouchMoveRaw);
    };
  }, [isOpen, scale]);

  // Zoom In / Out
  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.5, 4));
  };

  const zoomOut = () => {
    setScale((prev) => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const toggleDoubleCheckZoom = () => {
    if (scale > 1) {
      resetZoom();
    } else {
      setScale(2.5);
    }
  };

  // Drag and Pan Logics
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || scale <= 1) return;
    
    const container = containerRef.current;
    const img = imageRef.current;
    if (!container || !img) return;

    const maxDeltaX = (img.clientWidth * scale - container.clientWidth) / 2;
    const maxDeltaY = (img.clientHeight * scale - container.clientHeight) / 2;

    let newX = e.clientX - dragStart.x;
    let newY = e.clientY - dragStart.y;

    if (maxDeltaX > 0) {
      newX = Math.max(-maxDeltaX, Math.min(maxDeltaX, newX));
    } else {
      newX = 0;
    }

    if (maxDeltaY > 0) {
      newY = Math.max(-maxDeltaY, Math.min(maxDeltaY, newY));
    } else {
      newY = 0;
    }

    setPosition({ x: newX, y: newY });
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  // Mobile Swipe and Pinch gestures
  const getTouchDist = (t1: React.Touch, t2: React.Touch) => {
    return Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    // Custom touch double-tap gesture detector (replaces onDoubleClick on smartphones)
    const now = Date.now();
    if (now - lastTouchTime.current < 300) {
      e.preventDefault();
      toggleDoubleCheckZoom();
      lastTouchTime.current = 0;
      return;
    }
    lastTouchTime.current = now;

    if (e.touches.length === 2) {
      const dist = getTouchDist(e.touches[0], e.touches[1]);
      touchStartRef.current = { dist, scale };
    } else if (e.touches.length === 1) {
      if (scale > 1) {
        setIsDragging(true);
        setDragStart({ 
          x: e.touches[0].clientX - position.x, 
          y: e.touches[0].clientY - position.y 
        });
      } else {
        touchStartX.current = e.touches[0].clientX;
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchStartRef.current) {
      const dist = getTouchDist(e.touches[0], e.touches[1]);
      const factor = dist / touchStartRef.current.dist;
      const nextScale = Math.max(1, Math.min(touchStartRef.current.scale * factor, 4));
      setScale(nextScale);
      if (nextScale === 1) setPosition({ x: 0, y: 0 });
    } else if (e.touches.length === 1 && isDragging && scale > 1) {
      const container = containerRef.current;
      const img = imageRef.current;
      if (!container || !img) return;

      const maxDeltaX = (img.clientWidth * scale - container.clientWidth) / 2;
      const maxDeltaY = (img.clientHeight * scale - container.clientHeight) / 2;

      let newX = e.touches[0].clientX - dragStart.x;
      let newY = e.touches[0].clientY - dragStart.y;

      if (maxDeltaX > 0) newX = Math.max(-maxDeltaX, Math.min(maxDeltaX, newX));
      else newX = 0;

      if (maxDeltaY > 0) newY = Math.max(-maxDeltaY, Math.min(maxDeltaY, newY));
      else newY = 0;

      setPosition({ x: newX, y: newY });
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchStartRef.current = null;
    setIsDragging(false);

    if (scale === 1 && touchStartX.current !== null && e.changedTouches[0]) {
      const diffX = e.changedTouches[0].clientX - touchStartX.current;
      const swipeThreshold = 50;
      if (diffX > swipeThreshold) {
        handlePrev();
      } else if (diffX < -swipeThreshold) {
        handleNext();
      }
    }
    touchStartX.current = null;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-black/95 backdrop-blur-md transition-all duration-300">
      {/* Top Header Bar */}
      <div className="flex h-14 sm:h-16 w-full items-center justify-between px-6 text-white bg-gradient-to-b from-black/80 to-transparent">
        <span className="text-sm font-mono tracking-wider">
          {currentIndex + 1} / {images.length}
        </span>
        
        {/* Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={zoomOut}
            disabled={scale <= 1}
            className="p-2 text-white/70 transition-colors hover:text-white disabled:opacity-30 min-h-[44px]"
            title="Zoom Out"
          >
            <ZoomOut className="h-5 w-5" />
          </button>
          <button
            onClick={zoomIn}
            disabled={scale >= 4}
            className="p-2 text-white/70 transition-colors hover:text-white disabled:opacity-30 min-h-[44px]"
            title="Zoom In"
          >
            <ZoomIn className="h-5 w-5" />
          </button>
          <button
            onClick={resetZoom}
            disabled={scale === 1}
            className="p-2 text-white/70 transition-colors hover:text-white disabled:opacity-30 min-h-[44px]"
            title="Reset Zoom"
          >
            <Maximize2 className="h-5 w-5" />
          </button>
          <div className="h-6 w-px bg-white/20" />
          <button
            onClick={onClose}
            className="p-2 text-white/70 transition-colors hover:text-white min-h-[44px]"
            aria-label="Close image viewer"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Main Image Viewport */}
      <div
        ref={containerRef}
        className="relative flex-1 overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Left Arrow */}
        <button
          onClick={handlePrev}
          className="absolute left-6 z-10 hidden sm:flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition-all hover:bg-white/10 hover:text-white active:scale-95"
          aria-label="Previous image"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        {/* Large Zoomable Image wrapper */}
        <div
          ref={imageRef}
          onDoubleClick={toggleDoubleCheckZoom}
          className="relative max-h-[75vh] max-w-[85vw] aspect-[4/3] w-full select-none"
          style={{
            transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${scale})`,
            transition: isDragging ? "none" : "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <Image
            src={images[currentIndex]}
            alt="Showroom gallery preview"
            fill
            className="object-contain pointer-events-none p-2"
            sizes="(max-width: 1200px) 100vw, 1200px"
            priority
          />
        </div>

        {/* Right Arrow */}
        <button
          onClick={handleNext}
          className="absolute right-6 z-10 hidden sm:flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition-all hover:bg-white/10 hover:text-white active:scale-95"
          aria-label="Next image"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {/* Captions if available */}
      {captions && captions[currentIndex] && (
        <div className="w-full text-center text-white pb-4 px-6 select-none bg-gradient-to-t from-black/50 to-transparent z-10">
          {captions[currentIndex].category && (
            <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-semibold block">
              {captions[currentIndex].category}
            </span>
          )}
          <h3 className="font-display text-lg sm:text-xl font-medium mt-0.5">
            {captions[currentIndex].title}
          </h3>
          {captions[currentIndex].tagline && (
            <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-xl mx-auto">
              {captions[currentIndex].tagline}
            </p>
          )}
        </div>
      )}

      {/* Thumbnail Strip (Hidden on mobile phones for vertical screen space optimization) */}
      <div className="w-full bg-black/60 p-4 border-t border-white/10 hidden sm:block">
        <div className="mx-auto flex max-w-2xl justify-center gap-2 overflow-x-auto py-2">
          {images.map((src, index) => (
            <button
              key={src}
              onClick={() => selectIndex(index)}
              className={`relative h-12 w-16 flex-shrink-0 overflow-hidden border transition-all ${
                currentIndex === index
                  ? "border-white scale-105"
                  : "border-white/20 opacity-50 hover:opacity-100 hover:border-white/50"
              }`}
            >
              <Image
                src={src}
                alt={`Thumbnail preview ${index + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Hidden container to cache and preload next and previous images */}
      <div className="hidden" aria-hidden="true">
        {images[(currentIndex + 1) % images.length] && (
          <Image
            src={images[(currentIndex + 1) % images.length]}
            alt="Preload next"
            width={100}
            height={100}
            priority
          />
        )}
        {images[(currentIndex - 1 + images.length) % images.length] && (
          <Image
            src={images[(currentIndex - 1 + images.length) % images.length]}
            alt="Preload prev"
            width={100}
            height={100}
            priority
          />
        )}
      </div>
    </div>
  );
}
