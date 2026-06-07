"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Trash2, Phone, Mail, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

type Order = {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: "pending" | "confirmed" | "fulfilled" | "cancelled";
  notes: string | null;
  createdAt: string;
  variant: {
    name: string;
    vehicle: {
      name: string;
    };
  };
};

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending", color: "bg-amber-500" },
  { value: "confirmed", label: "Confirmed", color: "bg-blue-500" },
  { value: "fulfilled", label: "Fulfilled", color: "bg-emerald-500" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-500" },
];

export function AdminOrderTable() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadOrders() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/orders");
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Failed to load orders.");
        return;
      }
      setOrders(data);
    } catch {
      setError("Failed to load orders.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function handleStatusChange(id: string, newStatus: string) {
    setUpdatingId(id);
    try {
      const response = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await response.json();
      if (!response.ok) {
        alert(data.error ?? "Failed to update status.");
        return;
      }
      setOrders((current) =>
        current.map((item) => (item.id === id ? { ...item, status: newStatus as any } : item))
      );
    } catch {
      alert("Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!window.confirm(`Delete booking from ${name}?`)) return;

    setDeletingId(id);
    try {
      const response = await fetch(`/api/orders/${id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Delete failed.");
        return;
      }
      setOrders((current) => current.filter((item) => item.id !== id));
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

  if (orders.length === 0) {
    return (
      <div className="border border-dashed border-border p-12 text-center">
        <FileText className="mx-auto h-8 w-8 text-muted/50" />
        <p className="mt-4 text-sm text-muted">No booking orders received yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-border bg-background">
      <table className="w-full min-w-[1000px] text-left text-sm">
        <thead className="border-b border-border bg-surface/50 text-xs font-medium uppercase tracking-wider text-muted">
          <tr>
            <th className="px-6 py-4">Customer Details</th>
            <th className="px-6 py-4">Vehicle Booking</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4">Special Notes</th>
            <th className="px-6 py-4">Date</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {orders.map((order) => {
            const dateStr = new Date(order.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });

            return (
              <tr
                key={order.id}
                className="group bg-background transition-colors hover:bg-surface/30"
              >
                <td className="px-6 py-4">
                  <div className="font-semibold text-foreground">{order.customerName}</div>
                  <div className="flex flex-col gap-0.5 mt-1 text-xs text-muted">
                    <span className="flex items-center gap-1.5">
                      <Phone className="h-3 w-3" />
                      +91 {order.customerPhone}
                    </span>
                    <span className="flex items-center gap-1.5 mt-0.5">
                      <Mail className="h-3 w-3" />
                      {order.customerEmail}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-foreground">{order.variant.vehicle.name}</div>
                  <div className="text-xs text-muted">{order.variant.name}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <select
                      value={order.status}
                      disabled={updatingId === order.id}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
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
                        STATUS_OPTIONS.find((o) => o.value === order.status)?.color ??
                        "bg-zinc-500"
                      }`}
                    />
                  </div>
                </td>
                <td className="px-6 py-4 text-muted text-xs max-w-[200px] truncate">
                  {order.notes || <span className="italic text-muted/65">No notes</span>}
                </td>
                <td className="px-6 py-4 text-muted text-xs">{dateStr}</td>
                <td className="px-6 py-4 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={deletingId === order.id}
                    onClick={() => handleDelete(order.id, order.customerName)}
                    className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
