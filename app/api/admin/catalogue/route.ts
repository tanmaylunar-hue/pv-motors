import { prisma } from "@/lib/db";
import { AdminAuthError, requireAdmin } from "@/lib/admin-auth";
import { handlePrismaError, jsonError, jsonOk, parseJsonBody } from "@/lib/api/response";
import { buildVariantSlug } from "@/lib/slug";
import { syncCatalogueFile, getCatalogueFromDatabase } from "@/lib/sync-catalogue";
import { logAdminAction } from "@/lib/audit-logs";
import type { Prisma, StockStatus, VehicleCategory } from "@/lib/generated/prisma/client";

type AdminCatalogueBody = {
  vehicleName: string;
  category: VehicleCategory;
  variantName: string;
  price: number;
  description: string;
  specifications?: Prisma.InputJsonValue;
  images?: string[];
  images360?: string[];
  sequence?: number;
  stockStatus?: StockStatus;
  stockQuantity?: number;
  featured?: boolean;
};

export async function GET() {
  try {
    await requireAdmin();
    const catalogue = await getCatalogueFromDatabase();
    return jsonOk(catalogue);
  } catch (error) {
    console.error("[GET /api/admin/catalogue] Server error:", error);
    if (error instanceof AdminAuthError) {
      return jsonError("Unauthorized.", 401);
    }
    return handlePrismaError(error);
  }
}

export async function POST(request: Request) {
  let admin;
  try {
    admin = await requireAdmin();
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return jsonError("Unauthorized.", 401);
    }
    throw error;
  }

  const body = await parseJsonBody<AdminCatalogueBody>(request);

  if (
    !body?.vehicleName ||
    !body.category ||
    !body.variantName ||
    body.price == null ||
    !body.description
  ) {
    return jsonError(
      "vehicleName, category, variantName, price, and description are required."
    );
  }

  const slug = buildVariantSlug(body.vehicleName, body.variantName);

  try {
    let vehicle = await prisma.vehicle.findFirst({
      where: { name: { equals: body.vehicleName.trim(), mode: "insensitive" } },
    });

    if (!vehicle) {
      vehicle = await prisma.vehicle.create({
        data: {
          name: body.vehicleName.trim(),
          category: body.category,
        },
      });
    } else if (vehicle.category !== body.category) {
      vehicle = await prisma.vehicle.update({
        where: { id: vehicle.id },
        data: { category: body.category },
      });
    }

    let stockStatus = body.stockStatus ?? "in_stock";
    const stockQuantity = body.stockQuantity ?? 6;
    if (stockStatus !== "pre_order") {
      if (stockQuantity === 0) {
        stockStatus = "out_of_stock";
      } else if (stockQuantity <= 5) {
        stockStatus = "low_stock";
      } else {
        stockStatus = "in_stock";
      }
    }

    const variant = await prisma.variant.create({
      data: {
        vehicleId: vehicle.id,
        name: body.variantName.trim(),
        slug,
        tagline: body.description.trim(),
        price: body.price,
        specifications: body.specifications ?? [],
        images: body.images ?? [],
        images360: body.images360 ?? [],
        sequence: body.sequence ?? 0,
        stockStatus,
        stockQuantity,
        featured: body.featured ?? false,
        highlights: [],
      },
      include: { vehicle: true },
    });

    // Send notification
    await prisma.dashboardNotification.create({
      data: {
        role: admin.role,
        type: "catalogue",
        message: `${admin.role === "owner" ? "Owner" : "Manager"} updated catalogue.`,
      },
    });

    const catalogue = await syncCatalogueFile();
    await logAdminAction(
      "Create Vehicle",
      `Created vehicle variant "${body.vehicleName} ${body.variantName}"`
    );
    return jsonOk({ variant, catalogueCount: catalogue.length }, 201);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function PATCH(request: Request) {
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
    const body = await parseJsonBody<{ updates: { id: string; sequence: number }[] }>(request);
    if (!body?.updates || !Array.isArray(body.updates)) {
      return jsonError("updates array is required.");
    }

    await prisma.$transaction(
      body.updates.map((u) =>
        prisma.variant.update({
          where: { id: u.id },
          data: { sequence: u.sequence },
        })
      )
    );

    // Send notification
    await prisma.dashboardNotification.create({
      data: {
        role: admin.role,
        type: "catalogue",
        message: `${admin.role === "owner" ? "Owner" : "Manager"} updated catalogue.`,
      },
    });

    const catalogue = await syncCatalogueFile();
    await logAdminAction(
      "Reorder Catalogue",
      `Bulk updated sequencing order for ${body.updates.length} vehicles`
    );
    return jsonOk({ success: true, catalogueCount: catalogue.length });
  } catch (error) {
    console.error("[PATCH /api/admin/catalogue] Bulk reorder failed:", error);
    return handlePrismaError(error);
  }
}
