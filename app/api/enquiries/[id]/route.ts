import { prisma } from "@/lib/db";
import { AdminAuthError, requireAdmin } from "@/lib/admin-auth";
import { isValidPhone, normalizePhone } from "@/lib/enquiry";
import { handlePrismaError, jsonError, jsonOk, parseJsonBody } from "@/lib/api/response";
import { logAdminAction } from "@/lib/audit-logs";
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
  assignedToId?: string | null;
  notes?: string;
};

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    await requireAdmin();

    const enquiry = await prisma.enquiry.findUnique({
      where: { id },
      include: { variant: { include: { vehicle: true } } },
    });

    if (!enquiry) {
      return jsonError("Enquiry not found.", 404);
    }

    return jsonOk(enquiry);
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return jsonError("Unauthorized.", 401);
    }
    return handlePrismaError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  let admin;

  try {
    admin = await requireAdmin();
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return jsonError("Unauthorized.", 401);
    }
    throw error;
  }

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
    // 1. Fetch current state to track changes
    const currentEnquiry = await prisma.enquiry.findUnique({
      where: { id },
    });

    if (!currentEnquiry) {
      return jsonError("Enquiry not found.", 404);
    }

    let historyList: any[] = [];
    if (currentEnquiry.history && typeof currentEnquiry.history === "object") {
      if (Array.isArray(currentEnquiry.history)) {
        historyList = [...currentEnquiry.history];
      }
    } else if (typeof currentEnquiry.history === "string") {
      try {
        historyList = JSON.parse(currentEnquiry.history);
      } catch {
        historyList = [];
      }
    }

    let logNeeded = false;
    let transitionNotes = body.notes?.trim() || "";

    // 2. Track status changes
    if (body.status && body.status !== currentEnquiry.status) {
      historyList.push({
        status: body.status,
        timestamp: new Date().toISOString(),
        updatedBy: admin.username,
        notes: transitionNotes || `Status updated from ${currentEnquiry.status} to ${body.status}`,
      });
      logNeeded = true;
    }

    // 3. Track assignment changes
    if (body.assignedToId !== undefined && body.assignedToId !== currentEnquiry.assignedToId) {
      let assigneeName = "None";
      if (body.assignedToId) {
        const assigneeUser = await prisma.adminUser.findUnique({
          where: { id: body.assignedToId },
          select: { username: true },
        });
        if (assigneeUser) {
          assigneeName = assigneeUser.username;
        }
      }
      historyList.push({
        status: body.status || currentEnquiry.status,
        timestamp: new Date().toISOString(),
        updatedBy: admin.username,
        notes: `Assigned to: ${assigneeName}`,
      });
      logNeeded = true;
    }

    const updatedData: any = {
      name: body.name?.trim(),
      phone: body.phone,
      address: body.address?.trim(),
      city: body.city?.trim(),
      state: body.state?.trim(),
      vehicleName: body.vehicleName?.trim(),
      variantName: body.variantName?.trim(),
      variantId: body.variantId,
      status: body.status,
      assignedToId: body.assignedToId,
    };

    if (logNeeded) {
      updatedData.history = historyList;
    }

    const enquiry = await prisma.enquiry.update({
      where: { id },
      data: updatedData,
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
    });

    await logAdminAction(
      "Update Enquiry",
      `Updated enquiry for customer "${enquiry.name}" (status: ${enquiry.status}, assignedTo: ${enquiry.assignedTo?.username || "None"})`
    );

    return jsonOk(enquiry);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    await requireAdmin();
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return jsonError("Unauthorized.", 401);
    }
    throw error;
  }

  try {
    const target = await prisma.enquiry.findUnique({ where: { id } });
    await prisma.enquiry.delete({ where: { id } });
    if (target) {
      await logAdminAction(
        "Delete Enquiry",
        `Deleted enquiry from customer "${target.name}" for "${target.vehicleName} ${target.variantName}"`
      );
    }
    return jsonOk({ id });
  } catch (error) {
    return handlePrismaError(error);
  }
}
