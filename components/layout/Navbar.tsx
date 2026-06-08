"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { NAV_LINKS, SITE_NAME, CONTACT_INFO } from "@/lib/constants";
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
        <Link href="/#home" onClick={(e) => handleLinkClick(e, "/#home")} className="group flex items-center">
          {/* Desktop Logo */}
          <div className="hidden lg:block relative h-12 w-28 shrink-0 transition-opacity hover:opacity-90">
            <Image
              src="/logo.jpg"
              alt="PV Motors Logo"
              fill
              priority
              className="object-contain"
            />
          </div>
          {/* Mobile Logo */}
          <div className="block lg:hidden relative h-10 w-10 shrink-0 transition-opacity hover:opacity-90">
            <Image
              src="/emblem.png"
              alt="PV Motors Logo"
              fill
              priority
              className="object-contain"
            />
          </div>
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
                <span className="absolute bottom-0 left-0 h-[2px] w-full bg-[var(--accent)] animate-fade-in" />
              )}
            </Link>
          ))}
          <Button href="/#contact" onClick={(e) => handleLinkClick(e, "/#contact")} size="sm">
            Book Ride
          </Button>
        </div>

        <button
          type="button"
          className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 text-muted transition-colors hover:text-foreground lg:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Premium Mobile Side Drawer Menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop Blur Overlay */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setMobileOpen(false)}
          />

          {/* Sliding Drawer Container */}
          <div className="fixed right-0 top-0 bottom-0 z-50 w-4/5 max-w-xs bg-background border-l border-border p-6 shadow-2xl flex flex-col justify-between animate-slide-in-right">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-5 border-b border-border/55">
                <div className="relative h-9 w-24 shrink-0">
                  <Image
                    src="/logo.jpg"
                    alt="PV Motors Logo"
                    fill
                    className="object-contain"
                  />
                </div>
                <button
                  type="button"
                  className="min-h-[40px] min-w-[40px] flex items-center justify-center p-1.5 text-muted hover:text-foreground border border-border rounded-full hover:bg-surface-elevated transition-colors"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="mt-8 space-y-1">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={(e) => {
                      handleLinkClick(e, link.href);
                      setMobileOpen(false);
                    }}
                    className={cn(
                      "block px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] border border-transparent rounded-sm transition-all duration-200",
                      isLinkActive(link.href)
                        ? "bg-surface-elevated text-foreground border-l-[var(--accent)] border-l-2 font-bold"
                        : "text-muted hover:text-foreground hover:bg-surface-elevated/50"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Bottom Contact & CTA */}
            <div className="pt-6 border-t border-border/55 space-y-4">
              <div className="text-[11px] text-muted space-y-1 font-numeric">
                <p className="font-bold text-foreground uppercase tracking-widest text-[8px] mb-1">Contact Showroom</p>
                <p className="hover:text-foreground transition-colors"><a href={`tel:${CONTACT_INFO.phone.replace(/\s/g, "")}`}>{CONTACT_INFO.phone}</a></p>
                <p className="hover:text-foreground transition-colors"><a href={`mailto:${CONTACT_INFO.email}`}>{CONTACT_INFO.email}</a></p>
              </div>
              <Button
                href="/#contact"
                onClick={(e) => {
                  handleLinkClick(e, "/#contact");
                  setMobileOpen(false);
                }}
                className="w-full text-xs py-3 uppercase tracking-widest"
                size="sm"
              >
                Book Ride
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
