import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin, AdminAuthError } from "@/lib/admin-auth";
import { jsonError, jsonOk, parseJsonBody } from "@/lib/api/response";
import { logAdminAction } from "@/lib/audit-logs";
import { syncCatalogueFile } from "@/lib/sync-catalogue";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id: variantId } = await context.params;

  try {
    await requireAdmin();
    const histories = await prisma.variantHistory.findMany({
      where: { variantId },
      include: {
        admin: {
          select: { username: true, role: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return jsonOk(histories);
  } catch (error) {
    if (error instanceof AdminAuthError) return jsonError("Unauthorized.", 401);
    console.error("Fetch history error:", error);
    return jsonError("Failed to fetch history.", 500);
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

  const body = await parseJsonBody<{ versionId: string }>(request);
  if (!body?.versionId) {
    return jsonError("versionId is required.");
  }

  try {
    const historyEntry = await prisma.variantHistory.findUnique({
      where: { id: body.versionId },
    });

    if (!historyEntry || historyEntry.variantId !== variantId) {
      return jsonError("Version history entry not found.", 404);
    }

    const data = historyEntry.data as any;

    const existing = await prisma.variant.findUnique({
      where: { id: variantId },
      include: { vehicle: true },
    });

    if (!existing) {
      return jsonError("Vehicle variant not found.", 404);
    }

    // Update variant using history data snapshot
    const restoredVariant = await prisma.variant.update({
      where: { id: variantId },
      data: {
        name: data.name,
        tagline: data.tagline,
        price: data.price,
        specifications: data.specifications,
        images: data.images,
        images360: data.images360,
        stockStatus: data.stockStatus,
        stockQuantity: data.stockQuantity,
        featured: data.featured,
        sequence: data.sequence,
      },
    });

    if (data.vehicleName || data.category) {
      await prisma.vehicle.update({
        where: { id: existing.vehicleId },
        data: {
          name: data.vehicleName ?? existing.vehicle.name,
          category: data.category ?? existing.vehicle.category,
        },
      });
    }

    // Save a new history version representing this restore action
    const snapshot = {
      name: restoredVariant.name,
      vehicleName: data.vehicleName ?? existing.vehicle.name,
      category: data.category ?? existing.vehicle.category,
      tagline: restoredVariant.tagline,
      price: restoredVariant.price,
      specifications: restoredVariant.specifications,
      images: restoredVariant.images,
      images360: restoredVariant.images360,
      stockStatus: restoredVariant.stockStatus,
      stockQuantity: restoredVariant.stockQuantity,
      featured: restoredVariant.featured,
      sequence: restoredVariant.sequence,
    };

    await prisma.variantHistory.create({
      data: {
        variantId,
        adminId: admin.id,
        data: snapshot,
      },
    });

    await logAdminAction(
      "Restore Vehicle Version",
      `Restored vehicle variant "${restoredVariant.name}" to version from ${new Date(historyEntry.createdAt).toLocaleString("en-IN")}`
    );

    // Create real-time notification
    await prisma.dashboardNotification.create({
      data: {
        role: admin.role,
        type: "catalogue",
        message: `${admin.role === "owner" ? "Owner" : "Manager"} updated catalogue.`,
      },
    });

    await syncCatalogueFile();
    revalidatePath("/", "layout"); // Revalidate main website cache

    return jsonOk({ success: true, variant: restoredVariant });
  } catch (error) {
    console.error("Restore version error:", error);
    return jsonError("Failed to restore version.", 500);
  }
}
