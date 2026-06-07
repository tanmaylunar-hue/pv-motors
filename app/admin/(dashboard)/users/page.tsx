import type { Metadata } from "next";
import { getAuthenticatedAdmin } from "@/lib/admin-auth";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { SectionHeader } from "@/components/ui/Section";
import { AdminUsersManager } from "@/components/admin/AdminUsersManager";

export const metadata: Metadata = {
  title: "Admin User Management",
  description: "Manage admin users and roles.",
};

export default async function AdminUsersPage() {
  const currentAdmin = await getAuthenticatedAdmin();

  if (!currentAdmin || currentAdmin.role !== "owner") {
    return <AccessDenied />;
  }

  return (
    <>
      <div className="mb-8">
        <SectionHeader
          eyebrow="Admin"
          title="User Management"
          description="Create manager accounts, enable/disable access, or reset user credentials."
          className="mb-0"
        />
      </div>

      <AdminUsersManager currentAdminId={currentAdmin.id} />
    </>
  );
}
