import type { Metadata } from "next";
import { AdminEnquiryTable } from "@/components/admin/AdminEnquiryTable";
import { SectionHeader } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Enquiry Management",
  description: "View and follow up on customer test-drive enquiries.",
};

export const dynamic = "force-dynamic";

export default function AdminEnquiriesPage() {
  return (
    <>
      <div className="mb-8">
        <SectionHeader
          eyebrow="Admin"
          title="Customer Enquiries"
          description="Track and follow up on client bookings and test-drive inquiries. Direct contact shortcuts included."
          className="mb-0"
        />
      </div>

      <AdminEnquiryTable />
    </>
  );
}
