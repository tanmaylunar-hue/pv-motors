import { prisma } from "@/lib/db";
import { handlePrismaError, jsonError, jsonOk, parseJsonBody } from "@/lib/api/response";
import type { VehicleCategory } from "@/lib/generated/prisma/client";

type CreateVehicleBody = {
  name: string;
  category: VehicleCategory;
};

export async function GET() {
  try {
    const vehicles = await prisma.vehicle.findMany({
      include: { variants: true },
      orderBy: { createdAt: "desc" },
    });
    return jsonOk(vehicles);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function POST(request: Request) {
  const body = await parseJsonBody<CreateVehicleBody>(request);

  if (!body?.name || !body.category) {
    return jsonError("name and category are required.");
  }

  try {
    const vehicle = await prisma.vehicle.create({
      data: {
        name: body.name,
        category: body.category,
      },
      include: { variants: true },
    });
    return jsonOk(vehicle, 201);
  } catch (error) {
    return handlePrismaError(error);
  }
}
