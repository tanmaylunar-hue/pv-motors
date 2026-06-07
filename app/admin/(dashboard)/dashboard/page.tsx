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

const statusVariant: Record<string, "default" | "outline" | "accent"> = {
  new: "accent",
  contacted: "default",
  interested: "default",
  negotiation: "default",
  booked: "accent",
  closed: "outline",
  scheduled: "outline",
};

export default async function AdminPage() {
  const [catalogue, totalEnquiries, recentEnquiries, recentActivity] = await Promise.all([
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

  // Calculate New Enquiries count
  const newEnquiriesCount = await prisma.enquiry.count({
    where: { status: "new" },
  });

  // Calculate Daily Leads (leads submitted since today's local midnight)
  const localToday = new Date();
  localToday.setHours(0, 0, 0, 0);
  const dailyLeadsCount = await prisma.enquiry.count({
    where: {
      createdAt: {
        gte: localToday,
      },
    },
  });

  // Calculate Conversion Rate: (bookedEnquiries / totalEnquiries) * 100
  const bookedEnquiriesCount = await prisma.enquiry.count({
    where: { status: "booked" },
  });
  const conversionRate =
    totalEnquiries > 0 ? ((bookedEnquiriesCount / totalEnquiries) * 100).toFixed(1) : "0.0";

  // Calculate Popular Vehicles from all enquiries
  const allEnquiries = await prisma.enquiry.findMany({
    select: { vehicleName: true, variantName: true },
  });

  const popularMap = new Map<string, number>();
  for (const enq of allEnquiries) {
    const key = `${enq.vehicleName} (${enq.variantName})`;
    popularMap.set(key, (popularMap.get(key) || 0) + 1);
  }

  const popularVehicles = Array.from(popularMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

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
        <StatCard title="Total Enquiries" value={String(totalEnquiries)} icon={MessageSquare} />
        <StatCard title="New Enquiries" value={String(newEnquiriesCount)} icon={MessageSquare} />
        <StatCard title="Daily Leads" value={String(dailyLeadsCount)} icon={TrendingUp} />
        <StatCard title="Conversion Rate" value={`${conversionRate}%`} icon={Users} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
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

        {/* Popular Vehicles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-neutral-500" />
              Popular Vehicles
            </CardTitle>
          </CardHeader>
          <div className="space-y-4">
            {popularVehicles.length === 0 ? (
              <p className="text-sm text-muted">No enquiry data yet.</p>
            ) : (
              popularVehicles.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between border-b border-border/50 pb-4 last:border-0 last:pb-0 text-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-muted text-xs">#{idx + 1}</span>
                    <div>
                      <p className="font-medium text-foreground">{item.name}</p>
                    </div>
                  </div>
                  <Badge variant="default">
                    {item.count} {item.count === 1 ? "lead" : "leads"}
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
        <Card className="lg:col-span-3">
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
                <p className="text-xs text-muted">{totalEnquiries} total submissions</p>
              </div>
            </Link>
          </div>
        </Card>
      </div>
    </>
  );
}
