import { Suspense } from "react";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export default async function AdminLoginPage() {
  if (await isAdminAuthenticated()) {
    redirect("/admin/dashboard");
  }

  return (
    <Suspense fallback={<p className="py-20 text-center text-sm text-muted">Loading...</p>}>
      <LoginForm />
    </Suspense>
  );
}