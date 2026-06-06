import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { VehicleForm } from "@/components/admin/VehicleForm";
import { SectionHeader } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Edit Vehicle",
};

type EditVehiclePageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminEditVehiclePage({ params }: EditVehiclePageProps) {
  const { id } = await params;

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
        title="Edit Vehicle"
        description="Update variant details, pricing, stock, and images."
        className="mb-8"
      />
      <VehicleForm variantId={id} />
    </>
  );
}
