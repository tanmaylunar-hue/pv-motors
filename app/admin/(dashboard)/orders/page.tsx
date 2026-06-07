import type { Metadata } from "next";
import { AdminOrderTable } from "@/components/admin/AdminOrderTable";
import { SectionHeader } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Booking Order Management",
  description: "View and manage vehicle booking orders.",
};

export const dynamic = "force-dynamic";

export default function AdminOrdersPage() {
  return (
    <>
      <div className="mb-8">
        <SectionHeader
          eyebrow="Admin"
          title="Booking Orders"
          description="Track and update statuses of customer pre-orders and vehicle bookings."
          className="mb-0"
        />
      </div>

      <AdminOrderTable />
    </>
  );
}
