import type { Metadata } from "next";
import { getAuthenticatedAdmin } from "@/lib/admin-auth";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { SectionHeader } from "@/components/ui/Section";
import { KeyRound, ShieldAlert } from "lucide-react";

export const metadata: Metadata = {
  title: "Environment Variables Manager",
};

export default async function AdminEnvPage() {
  const admin = await getAuthenticatedAdmin();
  if (!admin || admin.role !== "owner") {
    return <AccessDenied />;
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Owner Only"
        title="Environment Variables"
        description="Inspect backend environment variables and system secrets configured in this deployment."
        className="mb-0"
      />

      <div className="border border-border p-6 bg-surface/30 space-y-4">
        <h3 className="font-display text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
          <KeyRound className="h-4 w-4" />
          Active Secrets Summary
        </h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between border border-border p-3 bg-background text-sm">
            <div>
              <p className="font-semibold font-mono">DATABASE_URL</p>
              <p className="text-xs text-muted mt-0.5">PostgreSQL Supabase database connection string</p>
            </div>
            <span className="text-xs bg-neutral-100 border border-border px-2 py-0.5 font-mono text-muted">••••••••••••••••</span>
          </div>

          <div className="flex items-center justify-between border border-border p-3 bg-background text-sm">
            <div>
              <p className="font-semibold font-mono">ADMIN_PASSWORD</p>
              <p className="text-xs text-muted mt-0.5">Global seed owner credential key</p>
            </div>
            <span className="text-xs bg-neutral-100 border border-border px-2 py-0.5 font-mono text-muted">••••••••••••••••</span>
          </div>

          <div className="flex items-center justify-between border border-border p-3 bg-background text-sm">
            <div>
              <p className="font-semibold font-mono">AUTH_SECRET</p>
              <p className="text-xs text-muted mt-0.5">JWT HMAC security signing secret</p>
            </div>
            <span className="text-xs bg-neutral-100 border border-border px-2 py-0.5 font-mono text-muted">••••••••••••••••</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 p-3 rounded mt-4">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <span>Caution: Changing environment variables may require a server redeployment.</span>
        </div>
      </div>
    </div>
  );
}
