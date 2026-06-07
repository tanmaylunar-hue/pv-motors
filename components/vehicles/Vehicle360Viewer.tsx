"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { RotateCcw, Play, Pause, Maximize, Minimize, MoveHorizontal } from "lucide-react";

interface Vehicle360ViewerProps {
  images360: string[];
  vehicleName: string;
}

export function Vehicle360Viewer({ images360, vehicleName }: Vehicle360ViewerProps) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [preloading, setPreloading] = useState(true);
  const [loadedCount, setLoadedCount] = useState(0);
  
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startFrameRef = useRef(0);
  
  const totalFrames = images360.length;
  const pixelsPerFrame = 15;

  // Sync props to state during render
  const [prevImages360, setPrevImages360] = useState(images360);
  if (images360 !== prevImages360) {
    setPrevImages360(images360);
    setPreloading(true);
    setLoadedCount(0);
    setCurrentFrame(0);
  }

  // Preload all 360 frames to prevent flickering during rotation
  useEffect(() => {
    if (totalFrames === 0) return;

    let active = true;

    images360.forEach((src) => {
      const img = new window.Image();
      img.src = src;
      img.onload = () => {
        if (!active) return;
        setLoadedCount((prev) => {
          const next = prev + 1;
          if (next === totalFrames) {
            setPreloading(false);
          }
          return next;
        });
      };
      img.onerror = () => {
        if (!active) return;
        setLoadedCount((prev) => {
          const next = prev + 1;
          if (next === totalFrames) {
            setPreloading(false);
          }
          return next;
        });
      };
    });

    return () => {
      active = false;
    };
  }, [images360, totalFrames]);

  // Auto-rotation player effect
  useEffect(() => {
    if (!isAutoPlaying || preloading || totalFrames === 0) return;

    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % totalFrames);
    }, 120);

    return () => clearInterval(interval);
  }, [isAutoPlaying, preloading, totalFrames]);

  // Handle Drag & Swipe Events
  const handleStart = (clientX: number) => {
    if (preloading) return;
    isDraggingRef.current = true;
    startXRef.current = clientX;
    startFrameRef.current = currentFrame;
    setIsAutoPlaying(false);
  };

  const handleMove = (clientX: number) => {
    if (!isDraggingRef.current || totalFrames === 0) return;

    const deltaX = clientX - startXRef.current;
    const frameOffset = Math.floor(deltaX / pixelsPerFrame);
    
    let targetFrame = (startFrameRef.current - frameOffset) % totalFrames;
    if (targetFrame < 0) {
      targetFrame += totalFrames;
    }
    
    setCurrentFrame(targetFrame);
  };

  const handleEnd = () => {
    isDraggingRef.current = false;
  };

  // Keyboard events inside fullscreen
  useEffect(() => {
    if (!isFullscreen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        setIsAutoPlaying(false);
        setCurrentFrame((prev) => (prev > 0 ? prev - 1 : totalFrames - 1));
      } else if (e.key === "ArrowRight") {
        setIsAutoPlaying(false);
        setCurrentFrame((prev) => (prev + 1) % totalFrames);
      } else if (e.key === "Escape") {
        setIsFullscreen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen, totalFrames]);

  if (totalFrames === 0) {
    return (
      <div className="flex h-96 w-full items-center justify-center border border-dashed border-border bg-surface text-sm text-muted">
        360° View images not uploaded.
      </div>
    );
  }

  return (
    <div
      className={`relative select-none border border-border bg-black ${
        isFullscreen
          ? "fixed inset-0 z-50 flex flex-col items-center justify-center p-6"
          : "aspect-square w-full"
      }`}
    >
      {preloading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/90 p-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
          <p className="mt-4 text-xs font-mono text-white/70">
            PRELOADING SHOWROOM FRAMES ({Math.round((loadedCount / totalFrames) * 100)}%)
          </p>
        </div>
      )}

      {/* Main Image Rotator Frame */}
      <div
        className="relative flex-1 w-full h-full flex items-center justify-center cursor-ew-resize overflow-hidden"
        onMouseDown={(e) => handleStart(e.clientX)}
        onMouseMove={(e) => handleMove(e.clientX)}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={(e) => {
          if (e.touches[0]) handleStart(e.touches[0].clientX);
        }}
        onTouchMove={(e) => {
          if (e.touches[0]) handleMove(e.touches[0].clientX);
        }}
        onTouchEnd={handleEnd}
      >
        <div className="relative aspect-square w-full max-h-[80vh] pointer-events-none">
          <Image
            src={images360[currentFrame]}
            alt={`${vehicleName} 360 view frame ${currentFrame + 1}`}
            fill
            className="object-contain p-4"
            sizes={isFullscreen ? "100vw" : "(max-width: 768px) 100vw, 50vw"}
            priority
          />
        </div>

        {!preloading && !isAutoPlaying && (
          <div className="pointer-events-none absolute bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full bg-black/60 border border-white/10 px-4 py-1.5 text-xs text-white/70 animate-pulse">
            <MoveHorizontal className="h-4 w-4" />
            Drag to Rotate
          </div>
        )}
      </div>

      {/* Controls Bar */}
      <div className="flex w-full items-center justify-between border-t border-white/10 bg-neutral-900/90 px-6 py-4 text-white">
        {/* Playback Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAutoPlaying((prev) => !prev)}
            disabled={preloading}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white transition-all hover:bg-white/10 active:scale-95 disabled:opacity-40"
            title={isAutoPlaying ? "Pause Auto-rotate" : "Auto-rotate"}
          >
            {isAutoPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          <button
            onClick={() => {
              setIsAutoPlaying(false);
              setCurrentFrame(0);
            }}
            disabled={preloading}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white transition-all hover:bg-white/10 active:scale-95 disabled:opacity-40"
            title="Reset Angle"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>

        {/* Info Label */}
        <span className="text-xs font-mono tracking-widest text-neutral-400">
          ANGLE {Math.round((currentFrame / totalFrames) * 360)}° / FRAME {currentFrame + 1}
        </span>

        {/* Size Controls */}
        <button
          onClick={() => setIsFullscreen((prev) => !prev)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white transition-all hover:bg-white/10 active:scale-95"
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        >
          {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
