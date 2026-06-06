import { prisma } from "@/lib/db";
import { handlePrismaError, jsonError, jsonOk, parseJsonBody } from "@/lib/api/response";
import type { Prisma, StockStatus } from "@/lib/generated/prisma/client";

type CreateVariantBody = {
  vehicleId: string;
  name: string;
  slug: string;
  tagline: string;
  price: number;
  specifications?: Prisma.InputJsonValue;
  images?: Prisma.InputJsonValue;
  stockStatus?: StockStatus;
  featured?: boolean;
  highlights?: Prisma.InputJsonValue;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const vehicleId = searchParams.get("vehicleId");

  try {
    const variants = await prisma.variant.findMany({
      where: vehicleId ? { vehicleId } : undefined,
      include: { vehicle: true },
      orderBy: { createdAt: "desc" },
    });
    return jsonOk(variants);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function POST(request: Request) {
  const body = await parseJsonBody<CreateVariantBody>(request);

  if (!body?.vehicleId || !body.name || !body.slug || !body.tagline || body.price == null) {
    return jsonError("vehicleId, name, slug, tagline, and price are required.");
  }

  try {
    const variant = await prisma.variant.create({
      data: {
        vehicleId: body.vehicleId,
        name: body.name,
        slug: body.slug,
        tagline: body.tagline,
        price: body.price,
        specifications: body.specifications ?? [],
        images: body.images ?? [],
        stockStatus: body.stockStatus,
        featured: body.featured,
        highlights: body.highlights ?? [],
      },
      include: { vehicle: true },
    });
    return jsonOk(variant, 201);
  } catch (error) {
    return handlePrismaError(error);
  }
}
