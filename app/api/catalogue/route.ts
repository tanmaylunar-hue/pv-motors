import { getCatalogueFromDatabase } from "@/lib/sync-catalogue";
import { handlePrismaError, jsonOk } from "@/lib/api/response";
import catalogueData from "@/data/catalogue.json";
import type { CatalogueItem } from "@/types/catalogue";

export async function GET() {
  try {
    const catalogue = await getCatalogueFromDatabase();
    if (catalogue.length > 0) {
      return jsonOk({ source: "database" as const, catalogue });
    }
  } catch (error) {
    return handlePrismaError(error);
  }

  return jsonOk({
    source: "file" as const,
    catalogue: catalogueData.catalogue as CatalogueItem[],
  });
}
