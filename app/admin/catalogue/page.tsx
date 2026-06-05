import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { CatalogueTable } from "@/components/admin/CatalogueTable";
import { Container, Section, SectionHeader } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { catalogue } from "@/lib/catalogue";

export const metadata: Metadata = {
  title: "Vehicle Catalogue",
  description: "Manage PV Motors vehicle catalogue — vehicles, variants, pricing, and stock.",
};

export default function AdminCataloguePage() {
  return (
    <Section>
      <Container>
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/admin"
              className="mb-4 inline-flex items-center gap-2 text-xs uppercase tracking-wider text-muted transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Dashboard
            </Link>
            <SectionHeader
              eyebrow="Admin"
              title="Vehicle Catalogue"
              description={`${catalogue.length} entries loaded from mock JSON. Editing will be enabled when the backend is connected.`}
              className="mb-0"
            />
          </div>
          <Button size="sm" disabled>
            <Plus className="h-4 w-4" />
            Add Entry
          </Button>
        </div>

        <CatalogueTable />

        <p className="mt-6 text-center text-xs text-muted">
          Data source: <code className="text-foreground">data/catalogue.json</code>
        </p>
      </Container>
    </Section>
  );
}
