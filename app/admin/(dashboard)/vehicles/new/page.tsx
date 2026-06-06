import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { VehicleForm } from "@/components/admin/VehicleForm";
import { SectionHeader } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Add Vehicle",
};

export default function AdminNewVehiclePage() {
  return (
    <>
      <Link
        href="/admin/vehicles"
        className="mb-4 inline-flex items-center gap-2 text-xs uppercase tracking-wider text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Vehicles
      </Link>
      <SectionHeader
        eyebrow="Admin"
        title="Add Vehicle"
        description="Create a new catalogue entry with variant details, specs, and images."
        className="mb-8"
      />
      <VehicleForm />
    </>
  );
}
