"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Trash2, Phone, ChevronDown, ChevronUp, Search, User, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";

type Enquiry = {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  vehicleName: string;
  variantName: string;
  status: "new" | "contacted" | "interested" | "negotiation" | "booked" | "closed" | "scheduled";
  message?: string | null;
  preferredTime?: string | null;
  source?: string | null;
  assignedToId?: string | null;
  assignedTo?: { id: string; username: string; role: string } | null;
  history?: any;
  createdAt: string;
};

type UserOption = {
  id: string;
  username: string;
  role: string;
};

const STATUS_OPTIONS = [
  { value: "new", label: "New", color: "bg-emerald-500" },
  { value: "contacted", label: "Contacted", color: "bg-blue-500" },
  { value: "interested", label: "Interested", color: "bg-indigo-500" },
  { value: "negotiation", label: "Negotiation", color: "bg-purple-500" },
  { value: "booked", label: "Booked", color: "bg-teal-500" },
  { value: "closed", label: "Closed", color: "bg-zinc-500" },
];

export function AdminEnquiryTable() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

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

  async function loadUsers() {
    try {
      const response = await fetch("/api/admin/users");
      const data = await response.json();
      if (response.ok && Array.isArray(data)) {
        setUsers(data);
      }
    } catch {
      console.error("Failed to load potential lead assignees.");
    }
  }

  useEffect(() => {
    loadEnquiries();
    loadUsers();
  }, []);

  async function handleStatusChange(id: string, newStatus: string) {
    const transitionNotes = window.prompt("Enter status update notes (optional):") || "";
    setUpdatingId(id);
    try {
      const response = await fetch(`/api/enquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, notes: transitionNotes }),
      });
      const data = await response.json();
      if (!response.ok) {
        alert(data.error ?? "Failed to update status.");
        return;
      }
      setEnquiries((current) =>
        current.map((item) =>
          item.id === id
            ? { ...item, status: newStatus as any, history: data.history }
            : item
        )
      );
    } catch {
      alert("Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleAssigneeChange(id: string, newAssigneeId: string | null) {
    try {
      const response = await fetch(`/api/enquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedToId: newAssigneeId }),
      });
      const data = await response.json();
      if (!response.ok) {
        alert(data.error ?? "Failed to update assignee.");
        return;
      }
      setEnquiries((current) =>
        current.map((item) =>
          item.id === id
            ? {
                ...item,
                assignedToId: newAssigneeId,
                assignedTo: data.assignedTo,
                history: data.history,
              }
            : item
        )
      );
    } catch {
      alert("Failed to update assignee.");
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
      if (expandedId === id) setExpandedId(null);
    } catch {
      setError("Delete failed.");
    } finally {
      setDeletingId(null);
    }
  }

  const filteredEnquiries = enquiries.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.vehicleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.variantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

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

  return (
    <div className="space-y-6">
      {/* Search and Filters Controls */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 bg-surface/35 border border-border p-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <input
            type="text"
            placeholder="Search leads by name, phone, vehicle, variant, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-background border border-border pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted/65 focus:outline-none focus:border-foreground transition-colors"
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs uppercase font-semibold text-muted tracking-wider">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-background border border-border px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-foreground"
          >
            <option value="all">All Enquiries</option>
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
            <option value="scheduled">Scheduled (Legacy)</option>
          </select>
        </div>
      </div>

      {/* Leads Table */}
      {filteredEnquiries.length === 0 ? (
        <div className="border border-dashed border-border p-12 text-center">
          <MessageSquare className="mx-auto h-8 w-8 text-muted/50" />
          <p className="mt-4 text-sm text-muted">No matching enquiries found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-border bg-background">
          <table className="w-full min-w-[1000px] text-left text-sm">
            <thead className="border-b border-border bg-surface/50 text-xs font-medium uppercase tracking-wider text-muted">
              <tr>
                <th className="px-6 py-4">Customer Details</th>
                <th className="px-6 py-4">Vehicle & Variant</th>
                <th className="px-6 py-4">Assignee</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredEnquiries.map((enquiry) => {
                const dateStr = new Date(enquiry.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                });

                const isExpanded = expandedId === enquiry.id;

                // Prefilled WhatsApp message
                const whatsappText = `Hi ${enquiry.name}, thank you for contacting PV Motors regarding the KOMAKI ${enquiry.vehicleName} (${enquiry.variantName}). We received your enquiry and our support executive will connect with you shortly.`;
                const waUrl = `https://wa.me/91${enquiry.phone}?text=${encodeURIComponent(whatsappText)}`;

                return (
                  <tr key={enquiry.id} className="group transition-colors bg-background">
                    <td colSpan={6} className="p-0">
                      {/* Main Data Row */}
                      <div className="flex items-center justify-between w-full hover:bg-surface/20 transition-colors border-b border-border last:border-0">
                        {/* Cell 1: Customer Details */}
                        <div className="px-6 py-4 min-w-[220px] flex items-start gap-2.5">
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : enquiry.id)}
                            className="p-1 hover:bg-surface border border-border rounded transition-colors text-muted mt-0.5 shrink-0"
                            title="Toggle logs & details"
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-3.5 w-3.5" />
                            ) : (
                              <ChevronDown className="h-3.5 w-3.5" />
                            )}
                          </button>
                          <div>
                            <div className="font-semibold text-foreground flex items-center gap-1.5">
                              {enquiry.name}
                              {enquiry.source && enquiry.source !== "website" && (
                                <span className="inline-block px-1.5 py-0.5 bg-neutral-200 text-neutral-800 text-[8px] font-bold uppercase rounded-sm tracking-wider">
                                  {enquiry.source}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted">
                              <Phone className="h-3 w-3" />
                              <span>+91 {enquiry.phone}</span>
                            </div>
                            <div className="text-[10px] font-mono text-muted mt-1 select-all">
                              ID: {enquiry.id}
                            </div>
                          </div>
                        </div>

                        {/* Cell 2: Vehicle & Variant */}
                        <div className="px-6 py-4 min-w-[200px] flex-1">
                          <div className="font-medium text-foreground">{enquiry.vehicleName}</div>
                          <div className="text-xs text-muted">{enquiry.variantName}</div>
                        </div>

                        {/* Cell 3: Assignee */}
                        <div className="px-6 py-4 min-w-[180px]">
                          <div className="flex items-center gap-1.5">
                            <select
                              value={enquiry.assignedToId || ""}
                              onChange={(e) =>
                                handleAssigneeChange(enquiry.id, e.target.value || null)
                              }
                              className="border border-border bg-surface text-foreground text-xs px-2.5 py-1.5 rounded focus:border-foreground focus:outline-none transition-colors"
                            >
                              <option value="">Unassigned</option>
                              {users.map((u) => (
                                <option key={u.id} value={u.id}>
                                  {u.username}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Cell 4: Status Selector */}
                        <div className="px-6 py-4 min-w-[180px]">
                          <div className="flex items-center gap-2">
                            <select
                              value={enquiry.status}
                              disabled={updatingId === enquiry.id}
                              onChange={(e) => handleStatusChange(enquiry.id, e.target.value)}
                              className="border border-border bg-surface text-foreground text-xs px-2.5 py-1.5 rounded focus:border-foreground focus:outline-none disabled:opacity-50 transition-colors"
                            >
                              {STATUS_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                              {enquiry.status === "scheduled" && (
                                <option value="scheduled">Scheduled (Legacy)</option>
                              )}
                            </select>
                            <span
                              className={`h-2.5 w-2.5 rounded-full ${
                                STATUS_OPTIONS.find((o) => o.value === enquiry.status)?.color ??
                                "bg-amber-500"
                              }`}
                            />
                          </div>
                        </div>

                        {/* Cell 5: Date */}
                        <div className="px-6 py-4 text-muted text-xs min-w-[120px]">{dateStr}</div>

                        {/* Cell 6: Actions */}
                        <div className="px-6 py-4 text-right min-w-[200px]">
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
                        </div>
                      </div>

                      {/* Expandable Details Area */}
                      {isExpanded && (
                        <div className="bg-surface/10 p-6 border-b border-border/80 text-xs">
                          <div className="grid gap-8 md:grid-cols-2">
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-display font-bold uppercase tracking-wider text-muted text-[10px] mb-2">
                                  Lead Metadata
                                </h4>
                                <div className="space-y-2 border border-border/40 p-4 bg-surface/30">
                                  <div className="flex justify-between items-center border-b border-border/20 pb-1.5">
                                    <span className="text-muted font-medium">Referral Source:</span>
                                    <span className="font-semibold text-foreground uppercase tracking-wide">
                                      {enquiry.source || "Website"}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center border-b border-border/20 pb-1.5">
                                    <span className="text-muted font-medium">Preferred Contact Time:</span>
                                    <span className="font-semibold text-foreground">
                                      {enquiry.preferredTime || "Anytime"}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-start">
                                    <span className="text-muted font-medium shrink-0">Address:</span>
                                    <span className="font-semibold text-foreground text-right ml-4">
                                      {enquiry.address}, {enquiry.city}, {enquiry.state}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <h4 className="font-display font-bold uppercase tracking-wider text-muted text-[10px] mb-2">
                                  Customer Message
                                </h4>
                                <blockquote className="border-l-2 border-border/80 pl-3.5 py-2.5 italic text-muted bg-surface/25 text-[11px] leading-relaxed">
                                  {enquiry.message || "No message provided."}
                                </blockquote>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-display font-bold uppercase tracking-wider text-muted text-[10px] mb-3 flex items-center gap-1.5">
                                <Clock className="h-3 w-3 text-neutral-400" />
                                Audit Log & Status History
                              </h4>
                              <div className="space-y-4 relative before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[1px] before:bg-border/60 pl-1">
                                {Array.isArray(enquiry.history) && enquiry.history.length > 0 ? (
                                  (enquiry.history as any[]).map((log: any, idx: number) => (
                                    <div key={idx} className="flex gap-4 relative pl-5">
                                      <div className="absolute left-[3px] top-[4px] h-2 w-2 rounded-full bg-accent border border-background ring-1 ring-border" />
                                      <div className="flex-1 space-y-0.5">
                                        <div className="flex items-center gap-2">
                                          <span className="font-bold text-foreground capitalize">
                                            {log.status}
                                          </span>
                                          <span className="text-[10px] text-muted font-medium">
                                            by {log.updatedBy || "System"}
                                          </span>
                                        </div>
                                        <p className="text-muted text-[10px] leading-tight">
                                          {log.notes || "No details recorded."}
                                        </p>
                                        <div className="text-[9px] text-neutral-400 font-mono">
                                          {new Date(log.timestamp).toLocaleString("en-IN", {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            second: "2-digit",
                                          })}
                                        </div>
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <p className="text-muted pl-4 italic">No history logged yet.</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
