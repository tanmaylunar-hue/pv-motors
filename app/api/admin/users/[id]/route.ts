import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/crypto-hash";
import { logAdminAction } from "@/lib/audit-logs";
import { jsonError, jsonOk, parseJsonBody } from "@/lib/api/response";

type UpdateUserBody = {
  disabled?: boolean;
  password?: string;
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentAdmin = await requireAdmin("owner");
    const { id } = await params;

    const body = await parseJsonBody<UpdateUserBody>(request);

    if (!body) {
      return jsonError("Request body is required.");
    }

    // Fetch target admin user
    const targetAdmin = await prisma.adminUser.findUnique({
      where: { id },
    });

    if (!targetAdmin) {
      return jsonError("User not found.", 404);
    }

    const data: any = {};
    const logMessages: string[] = [];

    // Check disable status update
    if (body.disabled !== undefined) {
      // Prevent owner self deactivation
      if (id === currentAdmin.id) {
        return jsonError("You cannot disable your own Owner account.");
      }
      data.disabled = body.disabled;
      logMessages.push(body.disabled ? "disabled" : "enabled");
    }

    // Check password reset update
    if (body.password) {
      if (body.password.length < 6) {
        return jsonError("Password must be at least 6 characters.");
      }
      data.password = hashPassword(body.password);
      logMessages.push("password reset");
    }

    if (Object.keys(data).length === 0) {
      return jsonError("No valid update fields provided.");
    }

    const updatedUser = await prisma.adminUser.update({
      where: { id },
      data,
      select: {
        id: true,
        username: true,
        role: true,
        disabled: true,
        createdAt: true,
      },
    });

    const summary = logMessages.join(" and ");
    await logAdminAction(
      "Update Manager Status",
      `Modified manager account "${targetAdmin.username}": ${summary}`
    );

    return jsonOk(updatedUser);
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
