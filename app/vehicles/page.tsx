import { getCatalogue } from "@/lib/catalogue-server";
import { VehiclesCatalog } from "@/components/vehicles/VehiclesCatalog";
import { Container, Section } from "@/components/ui/Section";

export default async function VehiclesPage() {
  const catalogue = await getCatalogue();

  return (
    <Section>
      <Container>
        <VehiclesCatalog items={catalogue} />
      </Container>
    </Section>
  );
}
