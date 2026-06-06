import { prisma } from "@/lib/db";
import { isValidPhone, normalizePhone } from "@/lib/enquiry";
import { handlePrismaError, jsonError, jsonOk, parseJsonBody } from "@/lib/api/response";
import type { EnquiryStatus } from "@/lib/generated/prisma/client";

type UpdateEnquiryBody = {
  name?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  vehicleName?: string;
  variantName?: string;
  variantId?: string | null;
  status?: EnquiryStatus;
};

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const enquiry = await prisma.enquiry.findUnique({
      where: { id },
      include: { variant: { include: { vehicle: true } } },
    });

    if (!enquiry) {
      return jsonError("Enquiry not found.", 404);
    }

    return jsonOk(enquiry);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const body = await parseJsonBody<UpdateEnquiryBody>(request);

  if (!body) {
    return jsonError("Request body is required.");
  }

  if (body.phone != null) {
    const phone = normalizePhone(body.phone);
    if (!isValidPhone(phone)) {
      return jsonError("Phone must be a valid 10-digit number.");
    }
    body.phone = phone;
  }

  try {
    const enquiry = await prisma.enquiry.update({
      where: { id },
      data: {
        name: body.name?.trim(),
        phone: body.phone,
        address: body.address?.trim(),
        city: body.city?.trim(),
        state: body.state?.trim(),
        vehicleName: body.vehicleName?.trim(),
        variantName: body.variantName?.trim(),
        variantId: body.variantId,
        status: body.status,
      },
      include: { variant: { include: { vehicle: true } } },
    });
    return jsonOk(enquiry);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    await prisma.enquiry.delete({ where: { id } });
    return jsonOk({ id });
  } catch (error) {
    return handlePrismaError(error);
  }
}
