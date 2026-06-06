import { NextResponse } from "next/server";
import { Prisma } from "@/lib/generated/prisma/client";

export function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function parseJsonBody<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}

export function handlePrismaError(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2025") {
      return jsonError("Record not found.", 404);
    }
    if (error.code === "P2002") {
      return jsonError("A record with this unique field already exists.", 409);
    }
    if (error.code === "P2003") {
      return jsonError("Related record not found.", 400);
    }
  }

  console.error(error);
  return jsonError("Internal server error.", 500);
}
