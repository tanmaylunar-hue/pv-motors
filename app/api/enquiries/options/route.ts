import { prisma } from "@/lib/db";
import { getCatalogueEnquiryOptions } from "@/lib/enquiry-options";
import { handlePrismaError, jsonOk } from "@/lib/api/response";

export async function GET() {
  try {
    const vehicles = await prisma.vehicle.findMany({
      include: { variants: { orderBy: { name: "asc" } } },
      orderBy: { name: "asc" },
    });

    if (vehicles.length > 0) {
      return jsonOk({
        source: "database" as const,
        vehicles: vehicles.map((vehicle) => ({
          id: vehicle.id,
          name: vehicle.name,
          variants: vehicle.variants.map((variant) => ({
            id: variant.id,
            name: variant.name,
          })),
        })),
      });
    }

    return jsonOk({
      source: "catalogue" as const,
      vehicles: await getCatalogueEnquiryOptions(),
    });
  } catch (error) {
    return handlePrismaError(error);
  }
}
