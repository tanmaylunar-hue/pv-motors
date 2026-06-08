import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { AdminAuthError, requireAdmin } from "@/lib/admin-auth";
import { jsonError, jsonOk, parseJsonBody } from "@/lib/api/response";
import { logAdminAction } from "@/lib/audit-logs";
import { getHomepageSettings, updateHomepageSettings, HomepageSettings } from "@/lib/homepage-settings";

export async function GET() {
  try {
    await requireAdmin();
    const settings = await getHomepageSettings();
    return jsonOk(settings);
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return jsonError("Unauthorized.", 401);
    }
    return jsonError("Failed to fetch settings.", 500);
  }
}

export async function PUT(request: Request) {
  let admin;
  try {
    admin = await requireAdmin();
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return jsonError("Unauthorized.", 401);
    }
    return jsonError("Unauthorized.", 401);
  }

  try {
    const body = await parseJsonBody<HomepageSettings>(request);
    if (!body || !body.whyChooseUs || !body.ourAdvantages || !body.trustBuilders) {
      return jsonError("Invalid homepage settings payload.");
    }

    const success = await updateHomepageSettings(body);
    if (!success) {
      return jsonError("Failed to save settings to disk.", 500);
    }

    // Create real-time notification
    await prisma.dashboardNotification.create({
      data: {
        role: admin.role,
        type: "settings",
        message: `${admin.role === "owner" ? "Owner" : "Manager"} updated homepage settings.`,
      },
    });

    // Log administrative action
    await logAdminAction(
      "Update Homepage Settings",
      `Modified Trust Builders and Why Choose Us counters/cards.`
    );

    // Revalidate paths to reflect changes immediately
    revalidatePath("/", "layout");
    revalidatePath("/vehicles", "layout");

    return jsonOk({ success: true });
  } catch (error) {
    console.error("[PUT /api/admin/homepage-settings] Error:", error);
    return jsonError("Failed to save settings.", 500);
  }
}
