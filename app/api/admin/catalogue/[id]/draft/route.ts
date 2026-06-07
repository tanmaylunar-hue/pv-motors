import { prisma } from "@/lib/db";
import { requireAdmin, AdminAuthError } from "@/lib/admin-auth";
import { jsonError, jsonOk, parseJsonBody } from "@/lib/api/response";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id: variantId } = await context.params;

  let admin;
  try {
    admin = await requireAdmin();
  } catch (error) {
    if (error instanceof AdminAuthError) return jsonError("Unauthorized.", 401);
    throw error;
  }

  try {
    const draft = await prisma.vehicleDraft.findUnique({
      where: {
        adminId_variantId: {
          adminId: admin.id,
          variantId,
        },
      },
    });

    return jsonOk({ success: true, draft: draft ? draft.data : null, updatedAt: draft?.updatedAt });
  } catch (error) {
    console.error("Get draft error:", error);
    return jsonError("Failed to retrieve draft.", 500);
  }
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id: variantId } = await context.params;

  let admin;
  try {
    admin = await requireAdmin();
  } catch (error) {
    if (error instanceof AdminAuthError) return jsonError("Unauthorized.", 401);
    throw error;
  }

  const body = await parseJsonBody<any>(request);
  if (!body) {
    return jsonError("Draft data is required.");
  }

  try {
    const draft = await prisma.vehicleDraft.upsert({
      where: {
        adminId_variantId: {
          adminId: admin.id,
          variantId,
        },
      },
      update: {
        data: body,
        updatedAt: new Date(),
      },
      create: {
        adminId: admin.id,
        variantId,
        data: body,
      },
    });

    return jsonOk({ success: true, draft });
  } catch (error) {
    console.error("Save draft error:", error);
    return jsonError("Failed to save draft.", 500);
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
    await prisma.vehicleDraft.deleteMany({
      where: {
        adminId: admin.id,
        variantId,
      },
    });
    return jsonOk({ success: true });
  } catch (error) {
    console.error("Delete draft error:", error);
    return jsonError("Failed to delete draft.", 500);
  }
}
