import { prisma } from "@/lib/db";
import { AdminAuthError, requireAdmin } from "@/lib/admin-auth";
import {
  buildAdminWhatsAppUrl,
  isValidPhone,
  normalizePhone,
  type EnquiryPayload,
} from "@/lib/enquiry";
import { handlePrismaError, jsonError, jsonOk, parseJsonBody } from "@/lib/api/response";
import type { EnquiryStatus } from "@/lib/generated/prisma/client";

type CreateEnquiryBody = EnquiryPayload & {
  status?: EnquiryStatus;
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
  const status = searchParams.get("status") as EnquiryStatus | null;
  const variantId = searchParams.get("variantId");

  try {
    const enquiries = await prisma.enquiry.findMany({
      where: {
        status: status ?? undefined,
        variantId: variantId ?? undefined,
      },
      include: { variant: { include: { vehicle: true } } },
      orderBy: { createdAt: "desc" },
    });
    return jsonOk(enquiries);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function POST(request: Request) {
  const body = await parseJsonBody<CreateEnquiryBody>(request);

  if (
    !body?.name ||
    !body.phone ||
    !body.address ||
    !body.city ||
    !body.state ||
    !body.vehicleName ||
    !body.variantName
  ) {
    return jsonError(
      "name, phone, address, city, state, vehicleName, and variantName are required."
    );
  }

  const phone = normalizePhone(body.phone);

  if (!isValidPhone(phone)) {
    return jsonError("Phone must be a valid 10-digit number.");
  }

  try {
    const enquiry = await prisma.enquiry.create({
      data: {
        name: body.name.trim(),
        phone,
        address: body.address.trim(),
        city: body.city.trim(),
        state: body.state.trim(),
        vehicleName: body.vehicleName.trim(),
        variantName: body.variantName.trim(),
        variantId: body.variantId,
        status: body.status,
      },
      include: { variant: { include: { vehicle: true } } },
    });

    const whatsappUrl = buildAdminWhatsAppUrl({
      name: enquiry.name,
      phone: enquiry.phone,
      address: enquiry.address,
      city: enquiry.city,
      state: enquiry.state,
      vehicleName: enquiry.vehicleName,
      variantName: enquiry.variantName,
    });

    return jsonOk({ enquiry, whatsappUrl }, 201);
  } catch (error) {
    return handlePrismaError(error);
  }
}
