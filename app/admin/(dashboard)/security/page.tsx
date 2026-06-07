import type { Metadata } from "next";
import { getAuthenticatedAdmin } from "@/lib/admin-auth";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { SectionHeader } from "@/components/ui/Section";
import { ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Security Settings",
};

export default async function AdminSecurityPage() {
  const admin = await getAuthenticatedAdmin();
  if (!admin || admin.role !== "owner") {
    return <AccessDenied />;
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Owner Only"
        title="Security Settings"
        description="Configure admin dashboard session lifetime, auth rules, and general password policies."
        className="mb-0"
      />

      <div className="border border-border p-6 bg-surface/30 space-y-4">
        <h3 className="font-display text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
          <ShieldCheck className="h-4 w-4" />
          General System Parameters
        </h3>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="border border-border p-4 bg-background">
            <p className="text-xs uppercase font-bold text-muted tracking-wider">Session Token Max-Age</p>
            <p className="text-lg font-bold mt-1">3600 Seconds (1 Hour)</p>
            <p className="text-xs text-muted mt-2">Active login cookie duration.</p>
          </div>
          <div className="border border-border p-4 bg-background">
            <p className="text-xs uppercase font-bold text-muted tracking-wider">HTTP-Only Security Cookies</p>
            <p className="text-lg font-bold text-emerald-600 mt-1">Enforced ✓</p>
            <p className="text-xs text-muted mt-2">Protects credentials from XSS.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
