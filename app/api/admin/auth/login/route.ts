import { NextResponse } from "next/server";
import {
  createAdminSessionToken,
  SESSION_MAX_AGE,
  ADMIN_SESSION_COOKIE,
  verifyAdminPassword,
} from "@/lib/admin-session";
import { jsonError, jsonOk, parseJsonBody } from "@/lib/api/response";

type LoginBody = {
  password: string;
};

export async function POST(request: Request) {
  const body = await parseJsonBody<LoginBody>(request);

  if (!body?.password) {
    return jsonError("Password is required.");
  }

  if (!process.env.ADMIN_PASSWORD) {
    return jsonError("Admin login is not configured.", 503);
  }

  if (!verifyAdminPassword(body.password)) {
    return jsonError("Invalid password.", 401);
  }

  const token = await createAdminSessionToken();
  const response = jsonOk({ success: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, token, {
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
  response.cookies.set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}
