"use client";

import { useEffect, useState } from "react";

export default function Loading() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background select-none animate-fade-in">
      {/* Top linear progress bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-neutral-100 overflow-hidden">
        <div 
          className="h-full bg-black transition-all duration-300"
          style={{
            animation: "shimmer-bar 1.5s infinite linear",
            transformOrigin: "left",
            width: "50%"
          }}
        />
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shimmer-bar {
          0% { transform: translateX(-100%) scaleX(0.5); }
          50% { transform: translateX(50%) scaleX(1); }
          100% { transform: translateX(200%) scaleX(0.5); }
        }
        @keyframes pulse-branding {
          0%, 100% {
            opacity: 0.4;
            transform: scale(0.96);
          }
          50% {
            opacity: 1;
            transform: scale(1.02);
          }
        }
        .animate-pulse-branding {
          animation: pulse-branding 1.5s ease-in-out infinite;
        }
      `}} />
      
      <div className="flex flex-col items-center">
        <div className="relative h-16 w-16 animate-pulse-branding">
          <img
            src="/emblem.png"
            alt="PV Motors Logo"
            className="h-full w-full object-contain"
          />
        </div>
        
        <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.25em] text-foreground">
          PV Motors
        </p>
        
        <p className="mt-1 text-[8px] uppercase tracking-widest text-muted/65">
          Authorized Dealer of KOMAKI
        </p>
      </div>
    </div>
  );
}
