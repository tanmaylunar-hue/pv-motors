"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const [animating, setAnimating] = useState(false);

  // Trigger a soft CSS-driven re-mount animation whenever pathname changes
  useEffect(() => {
    setAnimating(true);
    const timer = setTimeout(() => {
      setAnimating(false);
    }, 150); // fast transition duration
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div
      key={pathname}
      className={cn(
        "w-full flex-1 flex flex-col transition-all duration-200 ease-out",
        animating ? "opacity-0 scale-[0.99]" : "opacity-100 scale-100 animate-fade-in"
      )}
    >
      {children}
    </div>
  );
}
