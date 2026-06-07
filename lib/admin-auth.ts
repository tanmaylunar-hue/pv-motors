import { cookies } from "next/headers";
import { verifyAdminSessionToken } from "@/lib/admin-session";
import { prisma } from "@/lib/db";
import type { AdminUser } from "@/lib/generated/prisma/client";

export { ADMIN_SESSION_COOKIE, SESSION_MAX_AGE, createAdminSessionToken } from "@/lib/admin-session";

export async function getAuthenticatedAdmin(): Promise<AdminUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_session")?.value;
    if (!token) return null;

    // Decode token to extract userId
    const [payload] = token.split(".");
    if (!payload) return null;
    const parts = payload.split(":");
    if (parts.length !== 2) return null;
    const [userId] = parts;

    // Verify token validity
    const isValid = await verifyAdminSessionToken(token);
    if (!isValid) return null;

    // Fetch database user
    const admin = await prisma.adminUser.findUnique({
      where: { id: userId },
    });
    
    if (!admin || admin.disabled) return null;
    return admin;
  } catch {
    return null;
  }
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const admin = await getAuthenticatedAdmin();
  return !!admin;
}

export async function requireAdmin(requiredRole?: "owner" | "manager"): Promise<AdminUser> {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    throw new AdminAuthError("Unauthorized", 401);
  }
  if (requiredRole === "owner" && admin.role !== "owner") {
    throw new AdminAuthError("Forbidden", 403);
  }
  return admin;
}

export class AdminAuthError extends Error {
  status: number;
  constructor(message = "Unauthorized", status = 401) {
    super(message);
    this.name = "AdminAuthError";
    this.status = status;
  }
}
