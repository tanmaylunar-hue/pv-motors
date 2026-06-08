"use client";

import { useEffect, useState } from "react";
import { Save, Shield, Settings2, Sparkles, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/Section";
import type { HomepageSettings } from "@/lib/homepage-settings";

export default function AdminHomepageSettingsPage() {
  const [settings, setSettings] = useState<HomepageSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    document.title = "Homepage Trust & Sections Config — Admin";
  }, []);

  async function loadSettings() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/homepage-settings");
      if (!response.ok) {
        throw new Error("Failed to load settings.");
      }
      const data = await response.json();
      setSettings(data);
    } catch (err: any) {
      setError(err.message || "Failed to load settings.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSettings();
  }, []);

  const handleTrustChange = (index: number, field: "label" | "value" | "suffix", val: string | number) => {
    if (!settings) return;
    const nextTrust = [...settings.trustBuilders];
    nextTrust[index] = { ...nextTrust[index], [field]: val };
    setSettings({ ...settings, trustBuilders: nextTrust });
  };

  const handleWhyChange = (index: number, field: "title" | "description", val: string) => {
    if (!settings) return;
    const nextWhy = [...settings.whyChooseUs];
    nextWhy[index] = { ...nextWhy[index], [field]: val };
    setSettings({ ...settings, whyChooseUs: nextWhy });
  };

  const handleAdvantageChange = (index: number, field: "title" | "value" | "description", val: string) => {
    if (!settings) return;
    const nextAdv = [...settings.ourAdvantages];
    nextAdv[index] = { ...nextAdv[index], [field]: val };
    setSettings({ ...settings, ourAdvantages: nextAdv });
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!settings) return;

    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("/api/admin/homepage-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to save settings.");
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: any) {
      setError(err.message || "Failed to save settings.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <SectionHeader
          eyebrow="Admin"
          title="Homepage Settings"
          description="Loading trust counters and configurations..."
        />
        <div className="grid gap-6 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 w-full animate-pulse border border-border bg-surface/30" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <SectionHeader
        eyebrow="Admin"
        title="Homepage Trust & Brand Settings"
        description="Configure Why Choose PV Motors, Our Advantages and Trust Counters immediately visible on the homepage."
        className="mb-0"
      />

      {error && (
        <div className="flex items-center gap-3 rounded border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 rounded border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>Homepage configurations saved successfully and caches revalidated!</span>
        </div>
      )}

      {settings && (
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Section: Trust Builders Counters */}
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 font-display text-xl font-semibold text-foreground border-b border-border pb-2">
              <TrendingUp className="h-5 w-5 text-neutral-400" />
              Trust Builders Counters
            </h3>
            <p className="text-xs text-muted">Manage the counters featured with counter animation on the public landing page.</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {settings.trustBuilders.map((item, idx) => (
                <Card key={item.id} className="space-y-3">
                  <span className="text-[10px] font-mono text-muted uppercase tracking-wider block font-bold border-b border-border/50 pb-1">
                    Counter: {item.id.replace("_", " ")}
                  </span>
                  <Input
                    label="Label"
                    value={item.label}
                    onChange={(e) => handleTrustChange(idx, "label", e.target.value)}
                    required
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      label="Numeric Value"
                      type="number"
                      step="any"
                      value={item.value}
                      onChange={(e) => handleTrustChange(idx, "value", Number(e.target.value))}
                      required
                    />
                    <Input
                      label="Suffix"
                      value={item.suffix}
                      onChange={(e) => handleTrustChange(idx, "suffix", e.target.value)}
                      placeholder="e.g. +, %"
                    />
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Section: Why Choose PV Motors */}
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 font-display text-xl font-semibold text-foreground border-b border-border pb-2">
              <Shield className="h-5 w-5 text-neutral-400" />
              Why Choose PV Motors Cards
            </h3>
            <p className="text-xs text-muted">The core trust-builder card grid with specific dealership warranties and deliveries.</p>
            <div className="grid gap-6 sm:grid-cols-2">
              {settings.whyChooseUs.map((item, idx) => (
                <Card key={item.id} className="space-y-3">
                  <span className="text-[10px] font-mono text-muted uppercase tracking-wider block font-bold border-b border-border/50 pb-1">
                    Card: {item.title}
                  </span>
                  <Input
                    label="Title"
                    value={item.title}
                    onChange={(e) => handleWhyChange(idx, "title", e.target.value)}
                    required
                  />
                  <Textarea
                    label="Description"
                    rows={2}
                    value={item.description}
                    onChange={(e) => handleWhyChange(idx, "description", e.target.value)}
                    required
                  />
                </Card>
              ))}
            </div>
          </div>

          {/* Section: Our Advantages */}
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 font-display text-xl font-semibold text-foreground border-b border-border pb-2">
              <Sparkles className="h-5 w-5 text-neutral-400" />
              Our Advantages Grid
            </h3>
            <p className="text-xs text-muted">Highlighting dealership statistics and quick benefits like response time, local presence, etc.</p>
            <div className="grid gap-6 sm:grid-cols-2">
              {settings.ourAdvantages.map((item, idx) => (
                <Card key={item.id} className="space-y-3">
                  <span className="text-[10px] font-mono text-muted uppercase tracking-wider block font-bold border-b border-border/50 pb-1">
                    Advantage: {item.id.replace("_", " ")}
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      label="Title"
                      value={item.title}
                      onChange={(e) => handleAdvantageChange(idx, "title", e.target.value)}
                      required
                    />
                    <Input
                      label="Stat Value"
                      value={item.value}
                      onChange={(e) => handleAdvantageChange(idx, "value", e.target.value)}
                      required
                    />
                  </div>
                  <Textarea
                    label="Description"
                    rows={2}
                    value={item.description}
                    onChange={(e) => handleAdvantageChange(idx, "description", e.target.value)}
                    required
                  />
                </Card>
              ))}
            </div>
          </div>

          {/* Action Button */}
          <div className="border-t border-border pt-6 flex justify-end">
            <Button
              type="submit"
              size="lg"
              disabled={submitting}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {submitting ? "Saving changes..." : "Save Homepage Settings"}
            </Button>
          </div>

        </form>
      )}
    </div>
  );
}
