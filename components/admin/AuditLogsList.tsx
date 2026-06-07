"use client";

import { useEffect, useState } from "react";
import { ClipboardList, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";

type AuditLog = {
  id: string;
  actorName: string;
  action: string;
  details: string;
  timestamp: string;
};

export function AuditLogsList() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadLogs() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/audit-logs");
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Failed to load audit logs.");
        return;
      }
      setLogs(data);
    } catch {
      setError("Failed to load audit logs.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      loadLogs();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 w-full animate-pulse border border-border bg-surface/30" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm font-medium text-red-600 mb-4">{error}</p>
        <Button onClick={loadLogs} size="sm">
          Retry Loading
        </Button>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="border border-dashed border-border p-12 text-center bg-surface/30">
        <ClipboardList className="mx-auto h-8 w-8 text-muted/50" />
        <p className="mt-4 text-sm text-muted">No audit logs recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={loadLogs}
          className="inline-flex items-center gap-1.5 border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-neutral-50"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Refresh Logs
        </button>
      </div>

      <div className="border border-border overflow-x-auto">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="border-b border-border bg-surface text-xs font-bold uppercase tracking-wider text-muted select-none">
            <tr>
              <th className="px-6 py-4">Timestamp</th>
              <th className="px-6 py-4">Actor</th>
              <th className="px-6 py-4">Action</th>
              <th className="px-6 py-4">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-background">
            {logs.map((log) => {
              const dateStr = new Date(log.timestamp).toLocaleString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              });

              return (
                <tr key={log.id} className="hover:bg-surface/10 transition-colors">
                  <td className="px-6 py-4 text-xs font-mono text-muted whitespace-nowrap">
                    {dateStr}
                  </td>
                  <td className="px-6 py-4 font-semibold text-foreground whitespace-nowrap">
                    {log.actorName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center bg-neutral-100 border border-neutral-200 px-2 py-0.5 text-xs font-semibold text-neutral-800 rounded">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted break-words max-w-[400px]">
                    {log.details}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
