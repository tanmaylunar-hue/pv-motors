import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api/response";

export async function GET() {
  try {
    await requireAdmin("owner");
    const logs = await prisma.auditLog.findMany({
      orderBy: { timestamp: "desc" },
      take: 200, // Limit to recent 200 logs to preserve performance
    });
    return jsonOk(logs);
  } catch (error: any) {
    if (error.status === 403) {
      return jsonError("Forbidden", 403);
    }
    if (error.status === 401) {
      return jsonError("Unauthorized", 401);
    }
    return jsonError("Internal server error", 500);
  }
}
