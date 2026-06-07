import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { AdminAuthError, requireAdmin } from "@/lib/admin-auth";
import { handlePrismaError, jsonError, jsonOk, parseJsonBody } from "@/lib/api/response";
import { deleteImage } from "@/lib/cloudinary";
import { logAdminAction } from "@/lib/audit-logs";

type UpdateGalleryImageBody = {
  url?: string;
  publicId?: string;
  category?: string;
  title?: string;
  tagline?: string;
  published?: boolean;
  sequence?: number;
};

type RouteContext = {
  params: Promise<{ id: string }>;
};

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

  const body = await parseJsonBody<UpdateGalleryImageBody>(request);
  if (!body) {
    return jsonError("Request body is required.");
  }

  try {
    const existing = await prisma.galleryImage.findUnique({
      where: { id },
    });

    if (!existing) {
      return jsonError("Gallery image not found.", 404);
    }

    if (body.category) {
      const validCategories = ["Customer Delivery", "Vehicle Collection", "Showroom", "Events", "Reviews"];
      if (!validCategories.includes(body.category)) {
        return jsonError(`Invalid category. Must be one of: ${validCategories.join(", ")}`);
      }
    }

    if (body.url && body.url !== existing.url && existing.publicId) {
      try {
        await deleteImage(existing.publicId);
      } catch (err) {
        console.error("Failed to delete old Cloudinary image:", err);
      }
    }

    const updated = await prisma.galleryImage.update({
      where: { id },
      data: {
        url: body.url ?? existing.url,
        publicId: body.publicId !== undefined ? body.publicId : existing.publicId,
        category: body.category ?? existing.category,
        title: body.title !== undefined ? body.title : existing.title,
        tagline: body.tagline !== undefined ? body.tagline : existing.tagline,
        published: body.published !== undefined ? body.published : existing.published,
        sequence: body.sequence !== undefined ? body.sequence : existing.sequence,
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
      "Update Gallery Image",
      `Updated gallery image "${updated.title || "Untitled"}" (category: "${updated.category}")`
    );

    revalidatePath("/", "layout");
    return jsonOk(updated);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
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

  try {
    const existing = await prisma.galleryImage.findUnique({
      where: { id },
    });

    if (!existing) {
      return jsonError("Gallery image not found.", 404);
    }

    if (existing.publicId) {
      try {
        await deleteImage(existing.publicId);
      } catch (err) {
        console.error("Failed to delete Cloudinary image on destroy:", err);
      }
    }

    await prisma.variant.findUnique({
      where: { id },
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
      "Delete Gallery Image",
      `Deleted gallery image "${existing.title || "Untitled"}" (category: "${existing.category}")`
    );

    await prisma.galleryImage.delete({ where: { id } });

    revalidatePath("/", "layout");
    return jsonOk({ id });
  } catch (error) {
    return handlePrismaError(error);
  }
}
