import type { Metadata } from "next";
import { getAuthenticatedAdmin } from "@/lib/admin-auth";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { SectionHeader } from "@/components/ui/Section";
import { CreditCard, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Payments Management",
};

export default async function AdminPaymentsPage() {
  const admin = await getAuthenticatedAdmin();
  if (!admin || admin.role !== "owner") {
    return <AccessDenied />;
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Owner Only"
        title="Payments Management"
        description="Configure Stripe, Razorpay, or custom checkout payment methods for vehicle bookings."
        className="mb-0"
      />

      <div className="border border-border p-6 bg-surface/30 space-y-4">
        <h3 className="font-display text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
          <CreditCard className="h-4 w-4" />
          Checkout Configurations
        </h3>
        
        <div className="grid gap-4 md:grid-cols-2">
          <div className="border border-border p-4 bg-background">
            <p className="text-xs uppercase font-bold text-muted tracking-wider">Booking Deposit Amount</p>
            <p className="text-2xl font-bold mt-1">₹5,000.00</p>
            <p className="text-xs text-muted mt-2">Required amount to hold any vehicle model.</p>
          </div>
          <div className="border border-border p-4 bg-background">
            <p className="text-xs uppercase font-bold text-muted tracking-wider">Gateway Status</p>
            <p className="text-lg font-bold text-emerald-600 mt-1 flex items-center gap-1">
              <ShieldCheck className="h-4 w-4" /> Connected
            </p>
            <p className="text-xs text-muted mt-2">Active payment gateway: Razorpay Test Mode.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
