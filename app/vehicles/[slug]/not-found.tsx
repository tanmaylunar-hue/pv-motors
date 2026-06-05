import { Container, Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";

export default function VehicleNotFound() {
  return (
    <Section>
      <Container className="text-center">
        <h1 className="text-3xl font-bold text-foreground">Vehicle Not Found</h1>
        <p className="mt-4 text-muted">
          The vehicle you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <div className="mt-8">
          <Button href="/vehicles">Browse All Vehicles</Button>
        </div>
      </Container>
    </Section>
  );
}
