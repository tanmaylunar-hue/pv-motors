import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { AdminVehicleTable } from "@/components/admin/AdminVehicleTable";
import { SectionHeader } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Vehicle Management",
  description: "Manage PV Motors vehicle catalogue.",
};

export default function AdminVehiclesPage() {
  return (
    <>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SectionHeader
          eyebrow="Admin"
          title="Vehicle Management"
          description="Create, edit, and delete catalogue entries. Changes sync to the public site automatically."
          className="mb-0"
        />
        <Button href="/admin/vehicles/new" size="sm">
          <Plus className="h-4 w-4" />
          Add Vehicle
        </Button>
      </div>

      <AdminVehicleTable />
    </>
  );
}
