import { prisma } from "@/lib/db";
import { AdminAuthError, requireAdmin } from "@/lib/admin-auth";
import { handlePrismaError, jsonError, jsonOk, parseJsonBody } from "@/lib/api/response";
import { buildVariantSlug } from "@/lib/slug";
import { syncCatalogueFile } from "@/lib/sync-catalogue";
import type { Prisma, StockStatus, VehicleCategory } from "@/lib/generated/prisma/client";

type UpdateCatalogueBody = {
  vehicleName?: string;
  category?: VehicleCategory;
  variantName?: string;
  price?: number;
  description?: string;
  specifications?: Prisma.InputJsonValue;
  images?: string[];
  stockStatus?: StockStatus;
  featured?: boolean;
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

  try {
    await requireAdmin();
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

    const variant = await prisma.variant.update({
      where: { id },
      data: {
        name: variantName,
        slug,
        tagline: body.description?.trim() ?? existing.tagline,
        price: body.price ?? existing.price,
        specifications: (body.specifications ?? existing.specifications) as Prisma.InputJsonValue,
        images: (body.images ?? existing.images) as Prisma.InputJsonValue,
        stockStatus: body.stockStatus ?? existing.stockStatus,
        featured: body.featured ?? existing.featured,
      },
      include: { vehicle: true },
    });

    const catalogue = await syncCatalogueFile();
    return jsonOk({ variant, catalogueCount: catalogue.length });
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    await requireAdmin();
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

    const catalogue = await syncCatalogueFile();
    return jsonOk({ id, catalogueCount: catalogue.length });
  } catch (error) {
    return handlePrismaError(error);
  }
}
