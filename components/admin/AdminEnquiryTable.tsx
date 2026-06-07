"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Trash2, Phone, Calendar, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

type Enquiry = {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  vehicleName: string;
  variantName: string;
  status: "new" | "contacted" | "scheduled" | "closed";
  createdAt: string;
};

const STATUS_OPTIONS = [
  { value: "new", label: "New", color: "bg-emerald-500" },
  { value: "contacted", label: "Contacted", color: "bg-blue-500" },
  { value: "scheduled", label: "Scheduled", color: "bg-amber-500" },
  { value: "closed", label: "Closed", color: "bg-zinc-500" },
];

export function AdminEnquiryTable() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadEnquiries() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/enquiries");
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Failed to load enquiries.");
        return;
      }
      setEnquiries(data);
    } catch {
      setError("Failed to load enquiries.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEnquiries();
  }, []);

  async function handleStatusChange(id: string, newStatus: string) {
    setUpdatingId(id);
    try {
      const response = await fetch(`/api/enquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await response.json();
      if (!response.ok) {
        alert(data.error ?? "Failed to update status.");
        return;
      }
      setEnquiries((current) =>
        current.map((item) => (item.id === id ? { ...item, status: newStatus as any } : item))
      );
    } catch {
      alert("Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!window.confirm(`Delete enquiry from ${name}?`)) return;

    setDeletingId(id);
    try {
      const response = await fetch(`/api/enquiries/${id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Delete failed.");
        return;
      }
      setEnquiries((current) => current.filter((item) => item.id !== id));
    } catch {
      setError("Delete failed.");
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 w-full animate-pulse border border-border bg-surface/30" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
        {error}
      </div>
    );
  }

  if (enquiries.length === 0) {
    return (
      <div className="border border-dashed border-border p-12 text-center">
        <MessageSquare className="mx-auto h-8 w-8 text-muted/50" />
        <p className="mt-4 text-sm text-muted">No enquiries received yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-border bg-background">
      <table className="w-full min-w-[1000px] text-left text-sm">
        <thead className="border-b border-border bg-surface/50 text-xs font-medium uppercase tracking-wider text-muted">
          <tr>
            <th className="px-6 py-4">Customer Details</th>
            <th className="px-6 py-4">Address</th>
            <th className="px-6 py-4">Vehicle Interested</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4">Date</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {enquiries.map((enquiry) => {
            const dateStr = new Date(enquiry.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });

            // Customer WhatsApp Link
            const whatsappText = `Hi ${enquiry.name}, thank you for your interest in the KOMAKI ${enquiry.vehicleName} (${enquiry.variantName}) at PV Motors. We received your enquiry and would love to assist you further.`;
            const waUrl = `https://wa.me/91${enquiry.phone}?text=${encodeURIComponent(whatsappText)}`;

            return (
              <tr
                key={enquiry.id}
                className="group bg-background transition-colors hover:bg-surface/30"
              >
                <td className="px-6 py-4">
                  <div className="font-semibold text-foreground">{enquiry.name}</div>
                  <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted">
                    <Phone className="h-3 w-3" />
                    <span>+91 {enquiry.phone}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-muted text-xs">
                  <div>{enquiry.address}</div>
                  <div className="mt-0.5 font-medium">
                    {enquiry.city}, {enquiry.state}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-foreground">{enquiry.vehicleName}</div>
                  <div className="text-xs text-muted">{enquiry.variantName}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <select
                      value={enquiry.status}
                      disabled={updatingId === enquiry.id}
                      onChange={(e) => handleStatusChange(enquiry.id, e.target.value)}
                      className="border border-border bg-surface text-foreground text-xs px-2.5 py-1 rounded transition-colors focus:border-foreground focus:outline-none disabled:opacity-50"
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <span
                      className={`h-2 w-2 rounded-full ${
                        STATUS_OPTIONS.find((o) => o.value === enquiry.status)?.color ??
                        "bg-zinc-500"
                      }`}
                    />
                  </div>
                </td>
                <td className="px-6 py-4 text-muted text-xs">{dateStr}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      href={waUrl}
                      target="_blank"
                      variant="ghost"
                      size="sm"
                      className="text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10"
                    >
                      <MessageSquare className="h-4 w-4" />
                      WhatsApp
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={deletingId === enquiry.id}
                      onClick={() => handleDelete(enquiry.id, enquiry.name)}
                      className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
