import { prisma } from "@/lib/db";
import { requireAdmin, AdminAuthError } from "@/lib/admin-auth";
import { jsonError, jsonOk } from "@/lib/api/response";

export async function GET(request: Request) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const since = searchParams.get("since");

    const where: any = {};
    if (since) {
      const date = new Date(Number(since));
      if (!isNaN(date.getTime())) {
        where.createdAt = { gt: date };
      }
    }

    const notifications = await prisma.dashboardNotification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 15,
    });

    return jsonOk(notifications);
  } catch (error) {
    if (error instanceof AdminAuthError) return jsonError("Unauthorized.", 401);
    console.error("Notifications fetch error:", error);
    return jsonError("Failed to fetch notifications.", 500);
  }
}
