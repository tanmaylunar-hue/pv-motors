"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { NAV_LINKS, SITE_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("home");

  // Track page scroll for background styling
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // IntersectionObserver scroll spy to track the active homepage section
  useEffect(() => {
    if (pathname !== "/") return;

    const sectionIds = ["home", "featured", "catalogue", "reviews", "gallery", "contact"];
    const observers = sectionIds.map((id) => {
      const el = document.getElementById(id);
      if (!el) return null;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(id);
          }
        },
        {
          rootMargin: "-30% 0px -50% 0px", // Trigger when section is in middle of the screen
          threshold: 0,
        }
      );
      observer.observe(el);
      return { observer, el };
    });

    return () => {
      observers.forEach((obs) => {
        if (obs) {
          obs.observer.disconnect();
        }
      });
    };
  }, [pathname]);

  // Handle click on smooth scrolling links
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (pathname === "/" && href.startsWith("/#")) {
      e.preventDefault();
      const targetId = href.replace("/#", "");
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth" });
        setActiveSection(targetId);
        window.history.pushState(null, "", href);
      }
      setMobileOpen(false);
    }
  };

  const isLinkActive = (href: string) => {
    if (pathname === "/") {
      return href === `/#${activeSection}`;
    }
    // Fallback for subpages
    if (href === "/#home" && pathname === "/") return true;
    return false;
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-500",
        scrolled
          ? "border-b border-border bg-background/95 backdrop-blur-xl"
          : "bg-background/80 backdrop-blur-md border-b border-border/40"
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:h-20 lg:px-8">
        <Link href="/#home" onClick={(e) => handleLinkClick(e, "/#home")} className="group">
          <p className="font-display text-lg font-semibold tracking-tight text-foreground lg:text-xl">
            {SITE_NAME}
          </p>
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={(e) => handleLinkClick(e, link.href)}
              className={cn(
                "relative text-[11px] font-medium uppercase tracking-[0.18em] transition-all duration-300 pb-1",
                isLinkActive(link.href)
                  ? "text-foreground font-semibold"
                  : "text-muted hover:text-foreground"
              )}
            >
              {link.label}
              {isLinkActive(link.href) && (
                <span className="absolute bottom-0 left-0 h-[2px] w-full bg-black animate-fade-in" />
              )}
            </Link>
          ))}
          <Button href="/#contact" onClick={(e) => handleLinkClick(e, "/#contact")} size="sm">
            Book Ride
          </Button>
        </div>

        <button
          type="button"
          className="p-2 text-muted transition-colors hover:text-foreground lg:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      <div
        className={cn(
          "overflow-hidden border-t border-border bg-background transition-all duration-500 lg:hidden",
          mobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0 border-t-0"
        )}
      >
        <div className="space-y-1 px-4 py-4">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={(e) => {
                handleLinkClick(e, link.href);
                if (!link.href.startsWith("/#") || pathname !== "/") {
                  setMobileOpen(false);
                }
              }}
              className={cn(
                "block px-4 py-3 text-xs font-medium uppercase tracking-[0.15em] transition-colors",
                isLinkActive(link.href)
                  ? "bg-surface-elevated text-foreground font-semibold"
                  : "text-muted hover:text-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
          <div className="px-4 pt-2">
            <Button
              href="/#contact"
              onClick={(e) => {
                handleLinkClick(e, "/#contact");
                if (pathname === "/") setMobileOpen(false);
              }}
              className="w-full"
              size="sm"
            >
              Book Ride
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
