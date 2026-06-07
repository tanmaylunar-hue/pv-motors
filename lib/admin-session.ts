import { prisma } from "@/lib/db";

export const ADMIN_SESSION_COOKIE = "admin_session";
export const SESSION_MAX_AGE = 60 * 60; // 1 hour in seconds

function getAuthSecret(): string {
  return process.env.AUTH_SECRET ?? process.env.ADMIN_PASSWORD ?? "";
}

async function hmacSha256(message: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqualStrings(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

export async function createAdminSessionToken(userId: string): Promise<string> {
  const secret = getAuthSecret();
  if (!secret) {
    throw new Error("AUTH_SECRET or ADMIN_PASSWORD must be set.");
  }

  const expiresAt = Date.now() + SESSION_MAX_AGE * 1000;
  const payload = `${userId}:${expiresAt}`;
  const signature = await hmacSha256(payload, secret);
  return `${payload}.${signature}`;
}

export async function verifyAdminSessionToken(
  token: string | undefined
): Promise<boolean> {
  if (!token) return false;

  const secret = getAuthSecret();
  if (!secret) return false;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  const expected = await hmacSha256(payload, secret);
  if (!timingSafeEqualStrings(expected, signature)) return false;

  const parts = payload.split(":");
  if (parts.length !== 2) return false;
  const [userId, expiresAtStr] = parts;
  const expiresAt = Number(expiresAtStr);
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) return false;

  // Verify database record
  try {
    const admin = await prisma.adminUser.findUnique({
      where: { id: userId },
    });
    return !!admin && !admin.disabled;
  } catch {
    return false;
  }
}

export function verifyAdminPassword(password: string): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return false;

  if (adminPassword.length !== password.length) return false;

  let mismatch = 0;
  for (let i = 0; i < adminPassword.length; i++) {
    mismatch |= adminPassword.charCodeAt(i) ^ password.charCodeAt(i);
  }
  return mismatch === 0;
}
