import { prisma } from "@/lib/db";
import { requireAdmin, AdminAuthError } from "@/lib/admin-auth";
import { jsonError, jsonOk, parseJsonBody } from "@/lib/api/response";

type LockRequestBody = {
  force?: boolean;
};

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id: variantId } = await context.params;

  let admin;
  try {
    admin = await requireAdmin();
  } catch (error) {
    if (error instanceof AdminAuthError) return jsonError("Unauthorized.", 401);
    throw error;
  }

  const body = await parseJsonBody<LockRequestBody>(request);
  const force = !!body?.force;

  try {
    const existingLock = await prisma.vehicleLock.findUnique({
      where: { variantId },
      include: { admin: true },
    });

    const now = Date.now();
    const LOCK_TIMEOUT_MS = 15000; // 15 seconds expiration

    if (existingLock) {
      const isOwnLock = existingLock.adminId === admin.id;
      const isExpired = now - new Date(existingLock.updatedAt).getTime() > LOCK_TIMEOUT_MS;

      if (isOwnLock || isExpired || force) {
        // Break other lock if force or expired, or update own lock
        const updatedLock = await prisma.vehicleLock.upsert({
          where: { variantId },
          update: {
            adminId: admin.id,
            updatedAt: new Date(),
          },
          create: {
            variantId,
            adminId: admin.id,
          },
        });
        return jsonOk({ success: true, locked: false, lock: updatedLock });
      } else {
        // Lock is active and held by someone else
        return jsonOk({
          success: true,
          locked: true,
          username: existingLock.admin.username,
          role: existingLock.admin.role,
          acquiredAt: existingLock.createdAt,
        });
      }
    } else {
      // Create a brand new lock
      const newLock = await prisma.vehicleLock.create({
        data: {
          variantId,
          adminId: admin.id,
        },
      });
      return jsonOk({ success: true, locked: false, lock: newLock });
    }
  } catch (error) {
    console.error("Lock acquisition error:", error);
    return jsonError("Failed to manage lock.", 500);
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
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

    if (lock && lock.adminId === admin.id) {
      await prisma.vehicleLock.delete({
        where: { variantId },
      });
    }
    return jsonOk({ success: true });
  } catch (error) {
    console.error("Lock release error:", error);
    return jsonError("Failed to release lock.", 500);
  }
}
