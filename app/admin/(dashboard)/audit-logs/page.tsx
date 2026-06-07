import type { Metadata } from "next";
import { getAuthenticatedAdmin } from "@/lib/admin-auth";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { SectionHeader } from "@/components/ui/Section";
import { AuditLogsList } from "@/components/admin/AuditLogsList";

export const metadata: Metadata = {
  title: "Admin Audit Logs",
  description: "View logs of administrative changes.",
};

export default async function AdminAuditLogsPage() {
  const currentAdmin = await getAuthenticatedAdmin();

  if (!currentAdmin || currentAdmin.role !== "owner") {
    return <AccessDenied />;
  }

  return (
    <>
      <div className="mb-8">
        <SectionHeader
          eyebrow="Admin"
          title="System Audit Logs"
          description="View records of administrative events, creation of manager accounts, and catalog modifications."
          className="mb-0"
        />
      </div>

      <AuditLogsList />
    </>
  );
}
