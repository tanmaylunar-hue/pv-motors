import { prisma } from "@/lib/db";
import { AdminAuthError, requireAdmin } from "@/lib/admin-auth";
import { handlePrismaError, jsonError, jsonOk, parseJsonBody } from "@/lib/api/response";
import type { OrderStatus } from "@/lib/generated/prisma/client";

type CreateOrderBody = {
  variantId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status?: OrderStatus;
  notes?: string;
};

export async function GET(request: Request) {
  try {
    await requireAdmin();
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return jsonError("Unauthorized.", 401);
    }
    throw error;
  }

  const { searchParams } = new URL(request.url);
  const variantId = searchParams.get("variantId");
  const status = searchParams.get("status") as OrderStatus | null;

  try {
    const orders = await prisma.order.findMany({
      where: {
        variantId: variantId ?? undefined,
        status: status ?? undefined,
      },
      include: { variant: { include: { vehicle: true } } },
      orderBy: { createdAt: "desc" },
    });
    return jsonOk(orders);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function POST(request: Request) {
  const body = await parseJsonBody<CreateOrderBody>(request);

  if (
    !body?.variantId ||
    !body.customerName ||
    !body.customerEmail ||
    !body.customerPhone
  ) {
    return jsonError("variantId, customerName, customerEmail, and customerPhone are required.");
  }

  try {
    const order = await prisma.order.create({
      data: {
        variantId: body.variantId,
        customerName: body.customerName,
        customerEmail: body.customerEmail,
        customerPhone: body.customerPhone,
        status: body.status,
        notes: body.notes,
      },
      include: { variant: { include: { vehicle: true } } },
    });
    return jsonOk(order, 201);
  } catch (error) {
    return handlePrismaError(error);
  }
}
