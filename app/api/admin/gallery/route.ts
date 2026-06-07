import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { AdminAuthError, requireAdmin } from "@/lib/admin-auth";
import { handlePrismaError, jsonError, jsonOk, parseJsonBody } from "@/lib/api/response";
import { logAdminAction } from "@/lib/audit-logs";

type CreateGalleryImageBody = {
  url: string;
  publicId?: string;
  category: string;
  title?: string;
  tagline?: string;
  published?: boolean;
  sequence?: number;
};

export async function GET() {
  try {
    await requireAdmin();
    const images = await prisma.galleryImage.findMany({
      orderBy: [
        { sequence: "asc" },
        { createdAt: "desc" }
      ],
    });
    return jsonOk(images);
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return jsonError("Unauthorized.", 401);
    }
    return handlePrismaError(error);
  }
}

export async function POST(request: Request) {
  let admin;
  try {
    admin = await requireAdmin();
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return jsonError("Unauthorized.", 401);
    }
    throw error;
  }

  const body = await parseJsonBody<CreateGalleryImageBody>(request);

  if (!body?.url || !body?.category) {
    return jsonError("Image URL and category are required.");
  }

  const validCategories = ["Customer Delivery", "Vehicle Collection", "Showroom", "Events", "Reviews"];
  if (!validCategories.includes(body.category)) {
    return jsonError(`Invalid category. Must be one of: ${validCategories.join(", ")}`);
  }

  try {
    const galleryImage = await prisma.galleryImage.create({
      data: {
        url: body.url,
        publicId: body.publicId ?? null,
        category: body.category,
        title: body.title ?? null,
        tagline: body.tagline ?? null,
        published: body.published ?? true,
        sequence: body.sequence ?? 0,
      },
    });

    // Create real-time notification
    await prisma.dashboardNotification.create({
      data: {
        role: admin.role,
        type: "gallery",
        message: `${admin.role === "owner" ? "Owner" : "Manager"} updated gallery.`,
      },
    });

    await logAdminAction(
      "Create Gallery Image",
      `Added image to category "${body.category}" (title: ${body.title || "Untitled"})`
    );
    
    revalidatePath("/", "layout");
    return jsonOk(galleryImage, 201);
  } catch (error) {
    return handlePrismaError(error);
  }
}
