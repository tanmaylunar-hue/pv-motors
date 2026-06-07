import { getCatalogueFromDatabase } from "@/lib/sync-catalogue";
import { handlePrismaError, jsonOk } from "@/lib/api/response";

export async function GET() {
  try {
    const catalogue = await getCatalogueFromDatabase();
    return jsonOk({ source: "database" as const, catalogue });
  } catch (error) {
    return handlePrismaError(error);
  }
}
