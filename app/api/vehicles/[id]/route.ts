import { prisma } from "@/lib/db";
import { handlePrismaError, jsonError, jsonOk, parseJsonBody } from "@/lib/api/response";
import type { VehicleCategory } from "@/lib/generated/prisma/client";

type UpdateVehicleBody = {
  name?: string;
  category?: VehicleCategory;
};

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: { variants: true },
    });

    if (!vehicle) {
      return jsonError("Vehicle not found.", 404);
    }

    return jsonOk(vehicle);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const body = await parseJsonBody<UpdateVehicleBody>(request);

  if (!body || (body.name == null && body.category == null)) {
    return jsonError("At least one field (name or category) is required.");
  }

  try {
    const vehicle = await prisma.vehicle.update({
      where: { id },
      data: {
        name: body.name,
        category: body.category,
      },
      include: { variants: true },
    });
    return jsonOk(vehicle);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    await prisma.vehicle.delete({ where: { id } });
    return jsonOk({ id });
  } catch (error) {
    return handlePrismaError(error);
  }
}
