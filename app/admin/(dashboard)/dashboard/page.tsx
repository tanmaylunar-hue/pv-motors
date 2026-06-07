import type { Metadata } from "next";
import Link from "next/link";
import { Car, MessageSquare, Plus, TrendingUp, Users, ClipboardCheck } from "lucide-react";
import { prisma } from "@/lib/db";
import { StatCard } from "@/components/admin/StatCard";
import { SectionHeader } from "@/components/ui/Section";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { getCatalogue } from "@/lib/catalogue-server";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "PV Motors admin dashboard for managing vehicles and inquiries.",
};

export const dynamic = "force-dynamic";

const statusVariant = {
  new: "accent" as const,
  contacted: "default" as const,
  shadowed: "outline" as const, // matching enum style if needed
  scheduled: "accent" as const,
  closed: "outline" as const,
};

export default async function AdminPage() {
  const [catalogue, enquiryCount, recentEnquiries, recentActivity] = await Promise.all([
    getCatalogue(),
    prisma.enquiry.count(),
    prisma.enquiry.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
    prisma.auditLog.findMany({
      take: 5,
      orderBy: { timestamp: "desc" },
    }),
  ]);

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SectionHeader
          eyebrow="Admin"
          title="Dashboard"
          description="Manage vehicles, inquiries, and showroom operations."
          className="mb-0"
        />
        <Button href="/admin/vehicles/new" size="sm">
          <Plus className="h-4 w-4" />
          Add Vehicle
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Catalogue Entries" value={String(catalogue.length)} icon={Car} />
        <StatCard title="Enquiries" value={String(enquiryCount)} icon={MessageSquare} />
        <StatCard title="Featured" value={String(catalogue.filter((i) => i.featured).length)} icon={Users} />
        <StatCard title="In Stock" value={String(catalogue.filter((i) => i.stockStatus === "in_stock").length)} icon={TrendingUp} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Recent Enquiries */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Enquiries</CardTitle>
          </CardHeader>
          <div className="space-y-4">
            {recentEnquiries.length === 0 ? (
              <p className="text-sm text-muted">No enquiries yet.</p>
            ) : (
              recentEnquiries.map((enquiry) => (
                <div
                  key={enquiry.id}
                  className="flex items-center justify-between border-b border-border/50 pb-4 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{enquiry.name}</p>
                    <p className="text-xs text-muted">
                      {enquiry.vehicleName} — {enquiry.variantName}
                    </p>
                  </div>
                  <Badge variant={statusVariant[enquiry.status] || "default"}>
                    {enquiry.status}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Activity Log (User, Action, Time) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-neutral-500" />
              Recent Activity Log
            </CardTitle>
          </CardHeader>
          <div className="space-y-4">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-muted select-none">No administrative activity logged yet.</p>
            ) : (
              recentActivity.map((log) => {
                const timeStr = new Date(log.timestamp).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                const dateStr = new Date(log.timestamp).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                });

                return (
                  <div
                    key={log.id}
                    className="flex items-start justify-between border-b border-border/50 pb-4 last:border-0 last:pb-0 text-sm"
                  >
                    <div>
                      <p className="font-semibold text-foreground leading-snug">{log.action}</p>
                      <p className="text-xs text-muted mt-0.5">{log.details}</p>
                      <p className="text-[10px] text-neutral-400 mt-1.5 uppercase font-mono tracking-wider">
                        By: {log.actorName}
                      </p>
                    </div>
                    <div className="text-right whitespace-nowrap text-xs text-muted font-medium ml-4">
                      <div>{timeStr}</div>
                      <div className="text-[10px] font-normal text-neutral-400 mt-0.5">{dateStr}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              href="/admin/vehicles"
              className="flex items-start gap-3 border border-border bg-surface-elevated p-4 transition-colors hover:border-foreground/20"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-border bg-surface">
                <Car className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Manage Vehicles</p>
                <p className="text-xs text-muted">{catalogue.length} catalogue entries</p>
              </div>
            </Link>
            <Link
              href="/admin/enquiries"
              className="flex items-start gap-3 border border-border bg-surface-elevated p-4 transition-colors hover:border-foreground/20"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-border bg-surface">
                <MessageSquare className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">View Enquiries</p>
                <p className="text-xs text-muted">{enquiryCount} total submissions</p>
              </div>
            </Link>
          </div>
        </Card>
      </div>
    </>
  );
}
