"use client";

import { useEffect, useState } from "react";

export default function Loading() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background transition-opacity duration-700 ease-in-out select-none">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse-branding {
          0%, 100% {
            opacity: 0.35;
            transform: scale(0.95);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
        }
        .animate-pulse-branding {
          animation: pulse-branding 2s ease-in-out infinite;
        }
      `}} />
      
      <div className="flex flex-col items-center">
        <div className="relative h-20 w-20 animate-pulse-branding">
          <img
            src="/emblem.png"
            alt="PV Motors Logo"
            className="h-full w-full object-contain"
          />
        </div>
        
        <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.3em] text-muted animate-pulse">
          PV Motors
        </p>
        
        {/* Authorised Dealer small subtitle */}
        <p className="mt-1 text-[8px] uppercase tracking-widest text-muted/60">
          Authorised Dealer of KOMAKI
        </p>
      </div>
    </div>
  );
}
