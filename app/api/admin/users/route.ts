import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/crypto-hash";
import { logAdminAction } from "@/lib/audit-logs";
import { jsonError, jsonOk, parseJsonBody } from "@/lib/api/response";

type CreateUserBody = {
  username?: string;
  password?: string;
};

export async function GET() {
  try {
    await requireAdmin("owner");
    const users = await prisma.adminUser.findMany({
      select: {
        id: true,
        username: true,
        role: true,
        disabled: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return jsonOk(users);
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

export async function POST(request: Request) {
  try {
    await requireAdmin("owner");
    const body = await parseJsonBody<CreateUserBody>(request);
    const username = body?.username?.trim();
    const password = body?.password;

    if (!username || !password) {
      return jsonError("Username and password are required.");
    }

    if (username.length < 3) {
      return jsonError("Username must be at least 3 characters.");
    }

    if (password.length < 6) {
      return jsonError("Password must be at least 6 characters.");
    }

    // Check if username already exists
    const existing = await prisma.adminUser.findUnique({
      where: { username },
    });

    if (existing) {
      return jsonError("Username is already taken.");
    }

    const hashedPassword = hashPassword(password);
    const newUser = await prisma.adminUser.create({
      data: {
        username,
        password: hashedPassword,
        role: "manager",
      },
      select: {
        id: true,
        username: true,
        role: true,
        disabled: true,
        createdAt: true,
      },
    });

    await logAdminAction(
      "Create Manager",
      `Created manager account with username: ${username}`
    );

    return jsonOk(newUser, 201);
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
