"use client";

import { useState, useTransition, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Send, Battery, Gauge, Star, MessageSquare } from "lucide-react";
import type { CatalogueItem } from "@/types/catalogue";
import { VehicleShowroom } from "@/components/vehicles/VehicleShowroom";
import { VehicleSpecs } from "@/components/vehicles/VehicleSpecs";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Numeric } from "@/components/ui/Numeric";
import { formatPrice, getSpecValue, getPrimaryImage } from "@/lib/catalogue-format";
import { reviews as mockReviews } from "@/lib/reviews";
import { StockBadge } from "@/components/vehicles/StockBadge";

interface VehicleDetailsClientProps {
  item: CatalogueItem;
  allVariants: CatalogueItem[];
  related: CatalogueItem[];
}

export function VehicleDetailsClient({
  item,
  allVariants,
  related,
}: VehicleDetailsClientProps) {
  const [selectedVariant, setSelectedVariant] = useState<CatalogueItem>(item);
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);
  const [notifyForm, setNotifyForm] = useState({ name: "", email: "", phone: "" });
  const [isSubmittingNotify, setIsSubmittingNotify] = useState(false);
  const [notifySuccess, setNotifySuccess] = useState(false);
  const [notifyError, setNotifyError] = useState<string | null>(null);

  // EMI Estimate calculation
  const emiEstimate = useMemo(() => {
    const principal = selectedVariant.price * 0.85; // 85% loan, 15% down payment
    const annualRate = 9.99; // 9.99% interest
    const months = 36; // 3 years

    const monthlyRate = annualRate / 12 / 100;
    const emi =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1);
    return Math.round(emi);
  }, [selectedVariant.price]);

  // Stock status logic

  // Specific reviews filter
  const filteredReviews = useMemo(() => {
    const list = mockReviews.filter((r) =>
      r.vehicle.toLowerCase().includes(selectedVariant.vehicle.toLowerCase())
    );
    return list.length > 0 ? list : mockReviews.slice(0, 3);
  }, [selectedVariant.vehicle]);

  const handleVariantChange = (variant: CatalogueItem) => {
    setSelectedVariant(variant);
    // Dynamically update URL without full page reload
    window.history.replaceState(null, "", `/vehicles/${variant.slug}`);
  };

  const handleNotifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifyForm.name.trim() || !notifyForm.email.trim() || !notifyForm.phone.trim()) {
      setNotifyError("All fields are required.");
      return;
    }
    
    setIsSubmittingNotify(true);
    setNotifyError(null);

    try {
      const response = await fetch("/api/notifications/stock-alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: notifyForm.name.trim(),
          email: notifyForm.email.trim(),
          phone: notifyForm.phone.trim(),
          vehicleName: selectedVariant.vehicle,
          variantName: selectedVariant.variant,
        }),
      });

      if (response.ok) {
        setNotifySuccess(true);
        setNotifyForm({ name: "", email: "", phone: "" });
      } else {
        const errData = await response.json();
        setNotifyError(errData.error ?? "Failed to request stock alert.");
      }
    } catch {
      setNotifyError("Network error. Please try again.");
    } finally {
      setIsSubmittingNotify(false);
    }
  };

  const range = getSpecValue(selectedVariant, "Range");
  const topSpeed = getSpecValue(selectedVariant, "Top Speed");

  return (
    <div className="space-y-16">
      {/* 1. VEHICLE HERO SECTION */}
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-start">
        {/* Gallery/360 Showroom Column */}
        <div>
          <VehicleShowroom item={selectedVariant} className="w-full" />
        </div>

        {/* Info, Selector & Actions Column */}
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="uppercase tracking-widest text-[9px]">
                {selectedVariant.category}
              </Badge>
              <StockBadge status={selectedVariant.stockStatus} />
              {selectedVariant.featured && (
                <span className="inline-flex items-center px-2 py-0.5 border border-black bg-black text-white rounded-sm text-xs font-semibold">
                  Featured
                </span>
              )}
            </div>
            
            <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
              {selectedVariant.vehicle}
            </h1>
            <div className="flex items-center gap-2 text-md text-muted">
              <span>Variant:</span>
              <span className="font-semibold text-foreground uppercase tracking-wider bg-surface-elevated border border-border px-2 py-0.5 text-xs">
                {selectedVariant.variant}
              </span>
            </div>
          </div>

          <p className="text-muted leading-relaxed text-sm">
            {selectedVariant.tagline}
          </p>

          {/* Pricing Row */}
          <div className="border-y border-border py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted">Ex-Showroom Price</p>
              <div className="flex items-baseline gap-1.5 mt-1">
                <Numeric as="span" className="text-3xl font-semibold text-foreground">
                  {formatPrice(selectedVariant.price)}
                </Numeric>
                <span className="text-xs text-muted">estimate</span>
              </div>
            </div>
            <div className="sm:text-right">
              <p className="text-xs uppercase tracking-widest text-muted">Starting EMI</p>
              <p className="text-sm font-semibold text-foreground mt-1.5">
                <span className="text-emerald-500 font-numeric">₹{emiEstimate.toLocaleString("en-IN")}</span> / month
              </p>
              <p className="text-[10px] text-muted mt-0.5">36 Months @ 9.99% EMI estimate</p>
            </div>
          </div>

          {/* Variant Selector */}
          {allVariants.length > 1 && (
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-foreground">
                Select Vehicle Variant
              </p>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {allVariants.map((v) => {
                  const isActive = selectedVariant.id === v.id;
                  const vRange = getSpecValue(v, "Range");
                  return (
                    <button
                      key={v.id}
                      onClick={() => handleVariantChange(v)}
                      className={`flex flex-col text-left p-4 border transition-all active:scale-[0.985] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black ${
                        isActive
                          ? "border-black bg-surface-elevated ring-1 ring-black"
                          : "border-border bg-surface hover:border-black/50"
                      }`}
                    >
                      <div className="flex justify-between items-start w-full">
                        <span className="text-sm font-semibold text-foreground">{v.variant}</span>
                        {isActive && (
                          <span className="h-1.5 w-1.5 rounded-full bg-black" />
                        )}
                      </div>
                      <div className="flex justify-between items-baseline mt-2 w-full">
                        <Numeric as="span" className="text-xs text-muted">
                          {formatPrice(v.price)}
                        </Numeric>
                        {vRange && (
                          <span className="text-[10px] text-muted/80">{vRange} Range</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Key Specs Card Grid */}
          <div className="grid grid-cols-2 gap-4">
            {range && (
              <div className="border border-border bg-surface p-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center border border-border bg-background shrink-0">
                  <Battery className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted">Range</p>
                  <Numeric as="p" className="text-md font-semibold text-foreground mt-0.5">
                    {range}
                  </Numeric>
                </div>
              </div>
            )}
            {topSpeed && (
              <div className="border border-border bg-surface p-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center border border-border bg-background shrink-0">
                  <Gauge className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted">Top Speed</p>
                  <Numeric as="p" className="text-md font-semibold text-foreground mt-0.5">
                    {topSpeed}
                  </Numeric>
                </div>
              </div>
            )}
          </div>

          {/* CTA & Actions Bar */}
          <div className="pt-2 flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                href={`/contact?vehicle=${encodeURIComponent(selectedVariant.vehicle)}&variant=${encodeURIComponent(
                  selectedVariant.variant
                )}&action=enquire`}
                className="flex-1"
                size="lg"
              >
                Enquire Now
              </Button>
              
              <Button
                href={`/contact?vehicle=${encodeURIComponent(selectedVariant.vehicle)}&variant=${encodeURIComponent(
                  selectedVariant.variant
                )}&action=test-ride`}
                variant="outline"
                className="flex-1"
                size="lg"
              >
                Book Test Ride
              </Button>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                href={`/contact?vehicle=${encodeURIComponent(selectedVariant.vehicle)}&variant=${encodeURIComponent(
                  selectedVariant.variant
                )}&action=callback`}
                variant="outline"
                className="flex-1 border border-border text-muted hover:text-foreground text-xs font-semibold py-2 h-auto flex items-center justify-center gap-1.5"
              >
                Request Callback
              </Button>
              
              {(selectedVariant.stockStatus === "low_stock" || selectedVariant.stockStatus === "out_of_stock") && (
                <Button
                  variant="outline"
                  className="flex-1 text-amber-500 border-amber-500/20 hover:border-amber-500/40 hover:bg-amber-500/5 text-xs font-semibold py-2 h-auto"
                  onClick={() => {
                    setNotifySuccess(false);
                    setNotifyError(null);
                    setIsNotifyOpen(true);
                  }}
                >
                  Notify Me (Stock Alert)
                </Button>
              )}
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="border border-border/60 bg-surface/20 p-4 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-foreground/90">
              <span className="text-emerald-500 font-bold">⚡ Response Time:</span>
              <span className="text-muted">Expected response in under 2 hours.</span>
            </div>
            <div className="flex items-center gap-2 text-foreground/90">
              <span className="text-amber-500 font-bold">⭐ Trust Indicator:</span>
              <span className="text-muted">4.9/5 average rating from 1,200+ satisfied customers.</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SPECIFICATIONS & HIGHLIGHTS */}
      <div className="border-t border-border pt-16">
        <VehicleSpecs item={selectedVariant} />
      </div>

      {/* 3. REVIEWS SECTION */}
      <div className="border-t border-border pt-16 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
              Owner Reviews
            </h2>
            <p className="text-sm text-muted mt-1">Verified owner testimonials of {selectedVariant.vehicle}</p>
          </div>
          <div className="flex items-center gap-1.5 text-sm font-semibold">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span>4.9 / 5.0</span>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {filteredReviews.map((rev) => (
            <Card key={rev.id} className="flex flex-col justify-between h-full bg-surface-elevated/40 hover:bg-surface-elevated/80 transition-colors">
              <div className="space-y-4">
                <div className="flex gap-0.5">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-muted italic">
                  &ldquo;{rev.text}&rdquo;
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-border/50 flex justify-between items-center text-xs">
                <div>
                  <p className="font-semibold text-foreground">{rev.name}</p>
                  <p className="text-muted mt-0.5">{rev.location}</p>
                </div>
                <span className="text-muted/70">{rev.date}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* HAPPY CUSTOMER DELIVERIES SHOWCASE */}
      <div className="border-t border-border pt-16 space-y-8">
        <div>
          <h2 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
            Recent Showroom Deliveries
          </h2>
          <p className="text-sm text-muted mt-1">Real moments of our customers taking home their KOMAKI EVs from PV Motors.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { url: "/happy-delivery-1.jpg", caption: "Congratulations on taking delivery of your new Komaki EV!" },
            { url: "/happy-delivery-2.jpg", caption: "PV Motors wishes a safe journey with your new electric ride." },
            { url: "/happy-delivery-3.jpg", caption: "Happy family taking delivery of their sleek EV scooter." },
            { url: "/happy-delivery-4.jpg", caption: "Another green vehicle delivered by PV Motors!" },
          ].map((item, idx) => (
            <div key={idx} className="group relative aspect-[4/3] bg-surface-elevated overflow-hidden border border-border">
              <img
                src={item.url}
                alt={item.caption}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  e.currentTarget.src = `https://images.unsplash.com/photo-${idx === 0 ? "1518640467707-6811f4a6ab73" : idx === 1 ? "1528605248644-14dd04022da1" : idx === 2 ? "1556740758-90de374c12ad" : "1531538606174-0f90ff5dce83"}?auto=format&fit=crop&w=600&q=80`;
                }}
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                <p className="text-[10px] font-semibold text-white leading-tight">{item.caption}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. RELATED VEHICLES SECTION */}
      {related.length > 0 && (
        <div className="border-t border-border pt-16 space-y-8">
          <div>
            <h2 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
              Recommended Showroom Models
            </h2>
            <p className="text-sm text-muted mt-1">Explore similar electric vehicles from Komaki</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.slice(0, 3).map((rel) => {
              const relRange = getSpecValue(rel, "Range");
              const relCover = getPrimaryImage(rel);
              return (
                <div
                  key={rel.id}
                  className="group flex flex-col border border-border bg-surface overflow-hidden transition-all hover:border-black/25"
                >
                  <Link href={`/vehicles/${rel.slug}`} className="relative aspect-[16/10] w-full bg-surface-elevated overflow-hidden border-b border-border/50">
                    <Image
                      src={relCover}
                      alt={`${rel.vehicle} ${rel.variant}`}
                      fill
                      className="object-contain p-4 transition-transform duration-500 group-hover:scale-102"
                      sizes="(max-width: 768px) 100vw, 30vw"
                      loading="lazy"
                    />
                  </Link>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <Badge variant="outline" className="text-[8px] uppercase tracking-wider">
                          {rel.category}
                        </Badge>
                        <StockBadge status={rel.stockStatus} />
                      </div>
                      <h3 className="font-display text-xl font-medium text-foreground mt-3 group-hover:text-neutral-700 transition-colors">
                        <Link href={`/vehicles/${rel.slug}`}>{rel.vehicle}</Link>
                      </h3>
                      <p className="text-xs text-muted mt-1">{rel.variant}</p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-border/50 flex justify-between items-baseline">
                      <div className="flex flex-col">
                        <span className="text-[9px] uppercase tracking-widest text-muted">Price</span>
                        <Numeric as="span" className="text-md font-semibold text-foreground mt-0.5">
                          {formatPrice(rel.price)}
                        </Numeric>
                      </div>
                      {relRange && (
                        <div className="text-right">
                          <span className="text-[9px] uppercase tracking-widest text-muted">Range</span>
                          <p className="text-xs font-semibold text-foreground mt-0.5">{relRange}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. NOTIFY ME MODAL DIALOG */}
      {isNotifyOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in select-none">
          <div className="relative w-full max-w-md border border-border bg-background p-6 shadow-2xl animate-fade-up">
            <button
              onClick={() => setIsNotifyOpen(false)}
              className="absolute right-4 top-4 p-1.5 text-muted hover:text-foreground transition-colors"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>

            {notifySuccess ? (
              <div className="text-center py-6 space-y-4">
                <div className="mx-auto flex h-12 w-12 items-center justify-center border border-border bg-emerald-50/50">
                  <Send className="h-5 w-5 text-emerald-600 animate-pulse" />
                </div>
                <h3 className="font-display text-xl font-medium text-foreground">
                  Stock Alert Requested
                </h3>
                <p className="text-sm text-muted">
                  Alert successfully configured. We will contact you at your email or phone when stock for{" "}
                  <strong>{selectedVariant.vehicle} {selectedVariant.variant}</strong> is updated.
                </p>
                <Button onClick={() => setIsNotifyOpen(false)} className="mt-4">
                  Close Window
                </Button>
              </div>
            ) : (
              <form onSubmit={handleNotifySubmit} className="space-y-4">
                <div>
                  <h3 className="font-display text-xl font-medium text-foreground">
                    Get Stock Notification
                  </h3>
                  <p className="text-xs text-muted mt-1">
                    Receive an immediate email & WhatsApp update when this vehicle becomes available.
                  </p>
                </div>

                <div className="space-y-3.5 pt-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-muted mb-1.5">
                      Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Rahul Sharma"
                      value={notifyForm.name}
                      onChange={(e) => setNotifyForm({ ...notifyForm, name: e.target.value })}
                      className="w-full bg-background border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-black transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-muted mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="rahul@example.com"
                      value={notifyForm.email}
                      onChange={(e) => setNotifyForm({ ...notifyForm, email: e.target.value })}
                      className="w-full bg-background border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-black transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-muted mb-1.5">
                      Mobile Phone
                    </label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="9876543210"
                      value={notifyForm.phone}
                      onChange={(e) =>
                        setNotifyForm({ ...notifyForm, phone: e.target.value.replace(/\D/g, "") })
                      }
                      className="w-full bg-background border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-black transition-colors"
                    />
                  </div>
                </div>

                {notifyError && (
                  <p className="text-xs text-red-500 font-semibold">{notifyError}</p>
                )}

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsNotifyOpen(false)}
                    className="flex-1 py-2 text-sm font-semibold border border-border hover:bg-surface transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingNotify}
                    className="flex-1 py-2 text-sm font-semibold bg-black text-white hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmittingNotify ? "Registering..." : "Notify Me"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
