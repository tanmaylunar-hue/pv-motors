import { prisma } from "@/lib/db";
import { requireAdmin, AdminAuthError } from "@/lib/admin-auth";
import { jsonError, jsonOk } from "@/lib/api/response";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id: variantId } = await context.params;

  let admin;
  try {
    admin = await requireAdmin();
  } catch (error) {
    if (error instanceof AdminAuthError) return jsonError("Unauthorized.", 401);
    throw error;
  }

  try {
    const lock = await prisma.vehicleLock.findUnique({
      where: { variantId },
    });

    if (!lock) {
      return jsonError("No active lock found for this vehicle.", 404);
    }

    if (lock.adminId !== admin.id) {
      return jsonError("Lock belongs to another admin.", 403);
    }

    const updated = await prisma.vehicleLock.update({
      where: { variantId },
      data: { updatedAt: new Date() },
    });

    return jsonOk({ success: true, updatedAt: updated.updatedAt });
  } catch (error) {
    console.error("Lock heartbeat error:", error);
    return jsonError("Failed to update lock heartbeat.", 500);
  }
}
