import { prisma } from "@/lib/db";
import { getAuthenticatedAdmin } from "@/lib/admin-auth";

/**
 * Log an administrative action to the AuditLog database table.
 */
export async function logAdminAction(action: string, details: string): Promise<void> {
  try {
    const admin = await getAuthenticatedAdmin();
    await prisma.auditLog.create({
      data: {
        adminId: admin?.id || null,
        actorName: admin?.username || "System",
        action,
        details,
      },
    });
  } catch (error) {
    console.error("[logAdminAction] Audit logging failed:", error);
  }
}
