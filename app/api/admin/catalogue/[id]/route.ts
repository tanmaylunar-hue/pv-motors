import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { AdminAuthError, requireAdmin } from "@/lib/admin-auth";
import { handlePrismaError, jsonError, jsonOk, parseJsonBody } from "@/lib/api/response";
import { buildVariantSlug } from "@/lib/slug";
import { syncCatalogueFile } from "@/lib/sync-catalogue";
import { logAdminAction } from "@/lib/audit-logs";
import type { Prisma, StockStatus, VehicleCategory } from "@/lib/generated/prisma/client";

type UpdateCatalogueBody = {
  vehicleName?: string;
  category?: VehicleCategory;
  variantName?: string;
  price?: number;
  description?: string;
  specifications?: Prisma.InputJsonValue;
  images?: string[];
  images360?: string[];
  sequence?: number;
  stockStatus?: StockStatus;
  stockQuantity?: number;
  featured?: boolean;
  overwrite?: boolean;
  lastLoadedUpdatedAt?: string;
};

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    await requireAdmin();

    const variant = await prisma.variant.findUnique({
      where: { id },
      include: { vehicle: true },
    });

    if (!variant) {
      return jsonError("Vehicle entry not found.", 404);
    }

    return jsonOk(variant);
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return jsonError("Unauthorized.", 401);
    }
    return handlePrismaError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;

  let admin;
  try {
    admin = await requireAdmin();
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return jsonError("Unauthorized.", 401);
    }
    throw error;
  }

  const body = await parseJsonBody<UpdateCatalogueBody>(request);

  if (!body) {
    return jsonError("Request body is required.");
  }

  try {
    const existing = await prisma.variant.findUnique({
      where: { id },
      include: { vehicle: true },
    });

    if (!existing) {
      return jsonError("Vehicle entry not found.", 404);
    }

    // Overwrite check (conflict detection)
    if (body.lastLoadedUpdatedAt) {
      const dbTime = new Date(existing.updatedAt).getTime();
      const clientTime = new Date(body.lastLoadedUpdatedAt).getTime();
      // Allow 1 second tolerance for timezone or precision rounding
      if (dbTime - clientTime > 1000 && !body.overwrite) {
        return NextResponse.json(
          { error: "conflict", message: "This vehicle has been modified by another admin. Overwriting will lose their changes." },
          { status: 409 }
        );
      }
    }

    // Save Variant Snapshot to VariantHistory
    const snapshot = {
      name: existing.name,
      vehicleName: existing.vehicle.name,
      category: existing.vehicle.category,
      tagline: existing.tagline,
      price: existing.price,
      specifications: existing.specifications,
      images: existing.images,
      images360: existing.images360,
      stockStatus: existing.stockStatus,
      stockQuantity: existing.stockQuantity,
      featured: existing.featured,
      sequence: existing.sequence,
    };

    await prisma.variantHistory.create({
      data: {
        variantId: id,
        adminId: admin.id,
        data: snapshot,
      },
    });

    const vehicleName = body.vehicleName?.trim() ?? existing.vehicle.name;
    const variantName = body.variantName?.trim() ?? existing.name;
    const slug = buildVariantSlug(vehicleName, variantName);

    if (body.vehicleName || body.category) {
      await prisma.vehicle.update({
        where: { id: existing.vehicleId },
        data: {
          name: vehicleName,
          category: body.category ?? existing.vehicle.category,
        },
      });
    }

    const stockQuantity = body.stockQuantity !== undefined ? body.stockQuantity : existing.stockQuantity;
    let stockStatus = body.stockStatus ?? existing.stockStatus;
    if (stockStatus !== "pre_order") {
      if (stockQuantity === 0) {
        stockStatus = "out_of_stock";
      } else if (stockQuantity <= 5) {
        stockStatus = "low_stock";
      } else {
        stockStatus = "in_stock";
      }
    }

    const variant = await prisma.variant.update({
      where: { id },
      data: {
        name: variantName,
        slug,
        tagline: body.description?.trim() ?? existing.tagline,
        price: body.price ?? existing.price,
        specifications: (body.specifications ?? existing.specifications) as Prisma.InputJsonValue,
        images: (body.images ?? existing.images) as Prisma.InputJsonValue,
        images360: (body.images360 ?? existing.images360) as Prisma.InputJsonValue,
        sequence: body.sequence !== undefined ? body.sequence : existing.sequence,
        stockStatus,
        stockQuantity,
        featured: body.featured ?? existing.featured,
      },
      include: { vehicle: true },
    });

    // Delete autosave draft
    await prisma.vehicleDraft.deleteMany({
      where: {
        adminId: admin.id,
        variantId: id,
      },
    });

    // Create real-time notification
    await prisma.dashboardNotification.create({
      data: {
        role: admin.role,
        type: "catalogue",
        message: `${admin.role === "owner" ? "Owner" : "Manager"} updated catalogue.`,
      },
    });

    const catalogue = await syncCatalogueFile();
    revalidatePath("/", "layout"); // Revalidate main website cache

    await logAdminAction(
      "Update Vehicle",
      `Updated details for vehicle variant "${variant.vehicle.name} ${variant.name}"`
    );
    return jsonOk({ variant, catalogueCount: catalogue.length });
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  let admin;
  try {
    admin = await requireAdmin();
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return jsonError("Unauthorized.", 401);
    }
    throw error;
  }

  try {
    const existing = await prisma.variant.findUnique({
      where: { id },
      select: { id: true, vehicleId: true },
    });

    if (!existing) {
      return jsonError("Vehicle entry not found.", 404);
    }

    await prisma.variant.delete({ where: { id } });

    const remaining = await prisma.variant.count({
      where: { vehicleId: existing.vehicleId },
    });

    if (remaining === 0) {
      await prisma.vehicle.delete({ where: { id: existing.vehicleId } });
    }

    // Create real-time notification
    await prisma.dashboardNotification.create({
      data: {
        role: admin.role,
        type: "catalogue",
        message: `${admin.role === "owner" ? "Owner" : "Manager"} updated catalogue.`,
      },
    });

    const catalogue = await syncCatalogueFile();
    revalidatePath("/", "layout"); // Revalidate main website cache

    await logAdminAction(
      "Delete Vehicle",
      `Deleted vehicle entry with ID: ${id}`
    );
    return jsonOk({ id, catalogueCount: catalogue.length });
  } catch (error) {
    return handlePrismaError(error);
  }
}
