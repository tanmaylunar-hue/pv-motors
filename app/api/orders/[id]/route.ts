import { prisma } from "@/lib/db";
import { handlePrismaError, jsonError, jsonOk, parseJsonBody } from "@/lib/api/response";
import type { OrderStatus } from "@/lib/generated/prisma/client";

type UpdateOrderBody = {
  variantId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  status?: OrderStatus;
  notes?: string | null;
};

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: { variant: { include: { vehicle: true } } },
    });

    if (!order) {
      return jsonError("Order not found.", 404);
    }

    return jsonOk(order);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const body = await parseJsonBody<UpdateOrderBody>(request);

  if (!body) {
    return jsonError("Request body is required.");
  }

  try {
    const order = await prisma.order.update({
      where: { id },
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
    return jsonOk(order);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    await prisma.order.delete({ where: { id } });
    return jsonOk({ id });
  } catch (error) {
    return handlePrismaError(error);
  }
}
