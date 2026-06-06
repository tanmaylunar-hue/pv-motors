import { redirect } from "next/navigation";

export default function AdminCatalogueRedirect() {
  redirect("/admin/vehicles");
}
