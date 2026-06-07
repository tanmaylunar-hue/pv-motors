import { NextResponse } from "next/server";
import { createAdminSessionToken, SESSION_MAX_AGE, ADMIN_SESSION_COOKIE } from "@/lib/admin-session";
import { requireAdmin, AdminAuthError } from "@/lib/admin-auth";
import { jsonError, jsonOk } from "@/lib/api/response";

export async function POST() {
  try {
    const admin = await requireAdmin();
    const token = await createAdminSessionToken(admin.id);
    const response = jsonOk({ success: true });
    
    response.cookies.set(ADMIN_SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });
    
    return response;
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return jsonError("Unauthorized", 401);
    }
    return jsonError("Internal Server Error", 500);
  }
}
