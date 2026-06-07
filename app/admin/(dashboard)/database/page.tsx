import type { Metadata } from "next";
import { getAuthenticatedAdmin } from "@/lib/admin-auth";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { SectionHeader } from "@/components/ui/Section";
import { Database, HardDrive, RefreshCw } from "lucide-react";

export const metadata: Metadata = {
  title: "Database Control Panel",
};

export default async function AdminDatabasePage() {
  const admin = await getAuthenticatedAdmin();
  if (!admin || admin.role !== "owner") {
    return <AccessDenied />;
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Owner Only"
        title="Database Control Panel"
        description="Monitor PostgreSQL database metrics, trigger manual seed scripts, or optimize indexes."
        className="mb-0"
      />

      <div className="border border-border p-6 bg-surface/30 space-y-4">
        <h3 className="font-display text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
          <Database className="h-4 w-4" />
          Database Connections
        </h3>
        
        <div className="grid gap-4 md:grid-cols-3">
          <div className="border border-border p-4 bg-background">
            <p className="text-xs uppercase font-bold text-muted tracking-wider">Engine Version</p>
            <p className="text-lg font-bold mt-1">PostgreSQL 16.2</p>
          </div>
          <div className="border border-border p-4 bg-background">
            <p className="text-xs uppercase font-bold text-muted tracking-wider">Active Clients</p>
            <p className="text-lg font-bold mt-1">4 Connections</p>
          </div>
          <div className="border border-border p-4 bg-background">
            <p className="text-xs uppercase font-bold text-muted tracking-wider">Storage Size</p>
            <p className="text-lg font-bold mt-1 flex items-center gap-1">
              <HardDrive className="h-4 w-4" /> 12.4 MB
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-border flex flex-wrap gap-2">
          <button className="inline-flex items-center gap-1.5 border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-neutral-50 active:scale-[0.98]">
            <RefreshCw className="h-3.5 w-3.5" />
            Optimize Indexes
          </button>
        </div>
      </div>
    </div>
  );
}
