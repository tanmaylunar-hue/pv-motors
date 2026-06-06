import { Suspense } from "react";
import { LoginForm } from "@/components/admin/LoginForm";

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<p className="py-20 text-center text-sm text-muted">Loading...</p>}>
      <LoginForm />
    </Suspense>
  );
}