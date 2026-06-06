import { AdminAuthError, requireAdmin } from "@/lib/admin-auth";
import { isCloudinaryConfigured, uploadImage } from "@/lib/cloudinary";
import { jsonError, jsonOk } from "@/lib/api/response";

export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return jsonError("Unauthorized.", 401);
    }
    throw error;
  }

  if (!isCloudinaryConfigured()) {
    return jsonError("Cloudinary is not configured.", 503);
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return jsonError("Image file is required.");
  }

  if (!file.type.startsWith("image/")) {
    return jsonError("Only image files are allowed.");
  }

  if (file.size > 5 * 1024 * 1024) {
    return jsonError("Image must be under 5 MB.");
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const upload = await uploadImage(buffer, file.name);
    return jsonOk(upload, 201);
  } catch (error) {
    console.error(error);
    return jsonError("Image upload failed.", 500);
  }
}
