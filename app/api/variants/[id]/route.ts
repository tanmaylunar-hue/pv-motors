import { prisma } from "@/lib/db";
import { handlePrismaError, jsonError, jsonOk, parseJsonBody } from "@/lib/api/response";
import type { Prisma, StockStatus } from "@/lib/generated/prisma/client";

type UpdateVariantBody = {
  vehicleId?: string;
  name?: string;
  slug?: string;
  tagline?: string;
  price?: number;
  specifications?: Prisma.InputJsonValue;
  images?: Prisma.InputJsonValue;
  stockStatus?: StockStatus;
  featured?: boolean;
  highlights?: Prisma.InputJsonValue;
};

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const variant = await prisma.variant.findUnique({
      where: { id },
      include: { vehicle: true },
    });

    if (!variant) {
      return jsonError("Variant not found.", 404);
    }

    return jsonOk(variant);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const body = await parseJsonBody<UpdateVariantBody>(request);

  if (!body) {
    return jsonError("Request body is required.");
  }

  try {
    const variant = await prisma.variant.update({
      where: { id },
      data: {
        vehicleId: body.vehicleId,
        name: body.name,
        slug: body.slug,
        tagline: body.tagline,
        price: body.price,
        specifications: body.specifications,
        images: body.images,
        stockStatus: body.stockStatus,
        featured: body.featured,
        highlights: body.highlights,
      },
      include: { vehicle: true },
    });
    return jsonOk(variant);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    await prisma.variant.delete({ where: { id } });
    return jsonOk({ id });
  } catch (error) {
    return handlePrismaError(error);
  }
}
