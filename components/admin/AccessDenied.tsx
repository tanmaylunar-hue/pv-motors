import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function AccessDenied() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center border border-dashed border-red-200 bg-red-50/30 p-8 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
        <ShieldAlert className="h-6 w-6 text-red-600" />
      </div>
      <h2 className="font-display text-xl font-medium text-foreground">
        Access Denied
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted">
        Your administrator account does not have permission to view this section. Restricted sections are available to the Owner role only.
      </p>
      <div className="mt-6">
        <Button href="/admin/dashboard" size="sm">
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
}
