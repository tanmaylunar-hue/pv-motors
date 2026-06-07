import { prisma } from "@/lib/db";
import { jsonError, jsonOk, parseJsonBody } from "@/lib/api/response";

export async function POST(request: Request) {
  try {
    const body = await parseJsonBody<{
      name: string;
      email: string;
      phone: string;
      vehicleName: string;
      variantName: string;
    }>(request);

    if (
      !body?.name ||
      !body?.email ||
      !body?.phone ||
      !body?.vehicleName ||
      !body?.variantName
    ) {
      return jsonError("name, email, phone, vehicleName, and variantName are required.");
    }

    // Log the stock alert request as a real-time notification for owners & managers
    const notification = await prisma.dashboardNotification.create({
      data: {
        role: "owner", // Sent to dashboard panel
        type: "stock_alert",
        message: `Stock Request: ${body.name.trim()} (+91 ${body.phone.trim()}) requested stock alert for ${body.vehicleName.trim()} — ${body.variantName.trim()}`,
      },
    });

    return jsonOk({ success: true, notification }, 201);
  } catch (error) {
    console.error("[POST /api/notifications/stock-alert] Error:", error);
    return jsonError("Failed to register stock notification request.", 500);
  }
}
