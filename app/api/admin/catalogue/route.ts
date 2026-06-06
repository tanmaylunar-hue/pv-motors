import { prisma } from "@/lib/db";
import { AdminAuthError, requireAdmin } from "@/lib/admin-auth";
import { handlePrismaError, jsonError, jsonOk, parseJsonBody } from "@/lib/api/response";
import { buildVariantSlug } from "@/lib/slug";
import { syncCatalogueFile, getCatalogueFromDatabase } from "@/lib/sync-catalogue";
import type { Prisma, StockStatus, VehicleCategory } from "@/lib/generated/prisma/client";

type AdminCatalogueBody = {
  vehicleName: string;
  category: VehicleCategory;
  variantName: string;
  price: number;
  description: string;
  specifications?: Prisma.InputJsonValue;
  images?: string[];
  stockStatus?: StockStatus;
  featured?: boolean;
};

export async function GET() {
  try {
    await requireAdmin();
    const catalogue = await getCatalogueFromDatabase();
    return jsonOk(catalogue);
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return jsonError("Unauthorized.", 401);
    }
    return handlePrismaError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
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

    const variant = await prisma.variant.create({
      data: {
        vehicleId: vehicle.id,
        name: body.variantName.trim(),
        slug,
        tagline: body.description.trim(),
        price: body.price,
        specifications: body.specifications ?? [],
        images: body.images ?? [],
        stockStatus: body.stockStatus ?? "in_stock",
        featured: body.featured ?? false,
        highlights: [],
      },
      include: { vehicle: true },
    });

    const catalogue = await syncCatalogueFile();
    return jsonOk({ variant, catalogueCount: catalogue.length }, 201);
  } catch (error) {
    return handlePrismaError(error);
  }
}
