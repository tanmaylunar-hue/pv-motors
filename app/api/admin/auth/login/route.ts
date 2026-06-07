import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  createAdminSessionToken,
  SESSION_MAX_AGE,
  ADMIN_SESSION_COOKIE,
} from "@/lib/admin-session";
import { hashPassword, verifyPassword } from "@/lib/crypto-hash";
import { jsonError, jsonOk, parseJsonBody } from "@/lib/api/response";

type LoginBody = {
  username?: string;
  password?: string;
};

export async function POST(request: Request) {
  const body = await parseJsonBody<LoginBody>(request);

  const username = body?.username?.trim();
  const password = body?.password;

  if (!username || !password) {
    return jsonError("Username and password are required.");
  }

  // 1. Auto-seed the default Owner account if DB has no users
  try {
    const adminCount = await prisma.adminUser.count();
    if (adminCount === 0) {
      const defaultPassword = process.env.ADMIN_PASSWORD || "809Tanmay966";
      const hashedPassword = hashPassword(defaultPassword);
      await prisma.adminUser.create({
        data: {
          username: "admin",
          password: hashedPassword,
          role: "owner",
        },
      });
      console.log("[Login API] Auto-seeded default admin Owner account.");
    }
  } catch (err) {
    console.error("[Login API] Seeding check failed:", err);
  }

  // 2. Fetch admin user from DB
  const admin = await prisma.adminUser.findUnique({
    where: { username },
  });

  if (!admin) {
    return jsonError("Invalid credentials.", 401);
  }

  if (admin.disabled) {
    return jsonError("Your account has been disabled. Contact the Owner.", 403);
  }

  // 3. Verify password against hashed password
  const isMatch = verifyPassword(password, admin.password);
  if (!isMatch) {
    return jsonError("Invalid credentials.", 401);
  }

  // 4. Create and set cookie
  const token = await createAdminSessionToken(admin.id);
  const response = jsonOk({ success: true, role: admin.role, username: admin.username });
  
  response.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  const nowStr = String(Date.now());
  response.cookies.set("admin_last_active", nowStr, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  response.cookies.set("admin_session_start", nowStr, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  const cookieOpts = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  };
  response.cookies.set(ADMIN_SESSION_COOKIE, "", cookieOpts);
  response.cookies.set("admin_last_active", "", cookieOpts);
  response.cookies.set("admin_session_start", "", cookieOpts);
  return response;
}
