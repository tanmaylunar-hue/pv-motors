import type { Metadata } from "next";
import {
  Car,
  MessageSquare,
  TrendingUp,
  Users,
  Plus,
  Settings,
  FileText,
} from "lucide-react";
import { StatCard } from "@/components/admin/StatCard";
import { Container, Section, SectionHeader } from "@/components/ui/Section";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { catalogue } from "@/lib/catalogue";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "PV Motors admin dashboard for managing vehicles and inquiries.",
};

const recentInquiries = [
  { id: 1, name: "Rahul Sharma", model: "KOMAKI Ranger", status: "new", date: "2 hours ago" },
  { id: 2, name: "Priya Patel", model: "KOMAKI Venice", status: "contacted", date: "5 hours ago" },
  { id: 3, name: "Amit Kumar", model: "KOMAKI TN 95", status: "scheduled", date: "1 day ago" },
  { id: 4, name: "Sneha Reddy", model: "KOMAKI MX 3", status: "closed", date: "2 days ago" },
];

const statusVariant = {
  new: "accent" as const,
  contacted: "default" as const,
  scheduled: "accent" as const,
  closed: "outline" as const,
};

export default function AdminPage() {
  return (
    <Section>
      <Container>
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <SectionHeader
            eyebrow="Admin"
            title="Dashboard"
            description="Manage vehicles, inquiries, and showroom operations."
            className="mb-0"
          />
          <div className="flex gap-3">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4" />
              Settings
            </Button>
            <Button href="/admin/catalogue" size="sm">
              <Plus className="h-4 w-4" />
              Manage Catalogue
            </Button>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Catalogue Entries" value={String(catalogue.length)} icon={Car} />
          <StatCard title="Inquiries" value="24" change="+12% this week" icon={MessageSquare} />
          <StatCard title="Test Rides" value="8" change="3 scheduled today" icon={Users} />
          <StatCard title="Conversions" value="62%" change="+5% vs last month" icon={TrendingUp} />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Inquiries</CardTitle>
            </CardHeader>
            <div className="space-y-4">
              {recentInquiries.map((inquiry) => (
                <div
                  key={inquiry.id}
                  className="flex items-center justify-between border-b border-border/50 pb-4 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{inquiry.name}</p>
                    <p className="text-xs text-muted">{inquiry.model}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={statusVariant[inquiry.status as keyof typeof statusVariant]}>
                      {inquiry.status}
                    </Badge>
                    <span className="text-xs text-muted">{inquiry.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { icon: Car, label: "Manage Catalogue", desc: `${catalogue.length} entries in JSON`, href: "/admin/catalogue" },
                { icon: MessageSquare, label: "View Inquiries", desc: "24 pending responses", href: null },
                { icon: FileText, label: "Generate Report", desc: "Monthly sales summary", href: null },
                { icon: Settings, label: "Site Settings", desc: "Branding & contact info", href: null },
              ].map((action) => {
                const inner = (
                  <>
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-border bg-surface">
                      <action.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{action.label}</p>
                      <p className="text-xs text-muted">{action.desc}</p>
                    </div>
                  </>
                );

                return action.href ? (
                  <Link
                    key={action.label}
                    href={action.href}
                    className="flex items-start gap-3 border border-border bg-surface-elevated p-4 transition-colors hover:border-foreground/20"
                  >
                    {inner}
                  </Link>
                ) : (
                  <button
                    key={action.label}
                    type="button"
                    className="flex items-start gap-3 border border-border bg-surface-elevated p-4 text-left transition-colors hover:border-foreground/20"
                  >
                    {inner}
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        <p className="mt-8 text-center text-xs text-muted">
          Admin backend not connected. This is a UI preview only.
        </p>
      </Container>
    </Section>
  );
}
