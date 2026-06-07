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
      include: {
        variant: { include: { vehicle: true } },
        assignedTo: {
          select: {
            id: true,
            username: true,
            role: true,
          },
        },
      },
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

  // 1. Spam/Duplicate prevention (Check last 5 minutes)
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  try {
    const existing = await prisma.enquiry.findFirst({
      where: {
        phone,
        vehicleName: body.vehicleName.trim(),
        variantName: body.variantName.trim(),
        createdAt: {
          gte: fiveMinutesAgo,
        },
      },
    });

    if (existing) {
      return jsonError(
        "An enquiry for this vehicle variant was already submitted recently. We will contact you soon.",
        400
      );
    }
  } catch (error) {
    return handlePrismaError(error);
  }

  // 2. Prepare initial history log
  const source = body.source?.trim() || "website";
  const initialHistory = [
    {
      status: "new",
      timestamp: new Date().toISOString(),
      updatedBy: "System",
      notes: `Enquiry submitted via website (source: ${source}).`,
    },
  ];

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
        variantId: body.variantId || null,
        status: body.status || "new",
        message: body.message?.trim() || null,
        preferredTime: body.preferredTime?.trim() || null,
        source,
        history: initialHistory,
      },
      include: { variant: { include: { vehicle: true } } },
    });

    // Create dashboard notification for admins/managers
    try {
      await prisma.dashboardNotification.create({
        data: {
          role: "manager",
          type: "enquiry",
          message: `New Enquiry from ${enquiry.name} for ${enquiry.vehicleName} (${enquiry.variantName})`,
        },
      });
    } catch (err) {
      console.error("Failed to create dashboard notification:", err);
    }

    const whatsappUrl = buildAdminWhatsAppUrl({
      name: enquiry.name,
      phone: enquiry.phone,
      address: enquiry.address,
      city: enquiry.city,
      state: enquiry.state,
      vehicleName: enquiry.vehicleName,
      variantName: enquiry.variantName,
      message: enquiry.message || undefined,
      preferredTime: enquiry.preferredTime || undefined,
      source: enquiry.source || undefined,
    });

    return jsonOk({ enquiry, whatsappUrl }, 201);
  } catch (error) {
    return handlePrismaError(error);
  }
}
