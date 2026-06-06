"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Pencil, Plus, Trash2 } from "lucide-react";
import type { CatalogueItem } from "@/types/catalogue";
import { formatPrice, getPrimaryImage } from "@/lib/catalogue-format";
import { StockBadge } from "@/components/vehicles/StockBadge";
import { Button } from "@/components/ui/Button";
import { Numeric } from "@/components/ui/Numeric";

export function AdminVehicleTable() {
  const [items, setItems] = useState<CatalogueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadItems() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/catalogue");
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Failed to load vehicles.");
        return;
      }
      setItems(data);
    } catch {
      setError("Failed to load vehicles.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadItems();
  }, []);

  async function handleDelete(id: string, label: string) {
    if (!window.confirm(`Delete ${label}? This cannot be undone.`)) return;

    setDeletingId(id);
    try {
      const response = await fetch(`/api/admin/catalogue/${id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Delete failed.");
        return;
      }
      setItems((current) => current.filter((item) => item.id !== id));
    } catch {
      setError("Delete failed.");
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return <p className="text-sm text-muted">Loading vehicles...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-400">{error}</p>;
  }

  if (items.length === 0) {
    return (
      <div className="border border-dashed border-border p-10 text-center">
        <p className="text-sm text-muted">No vehicles yet. Add your first catalogue entry.</p>
        <Button href="/admin/vehicles/new" className="mt-4" size="sm">
          <Plus className="h-4 w-4" />
          Add Vehicle
        </Button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-border">
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead className="border-b border-border bg-surface">
          <tr>
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted">
              Image
            </th>
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted">
              Vehicle
            </th>
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted">
              Variant
            </th>
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted">
              Price
            </th>
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted">
              Stock
            </th>
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted">
              Specs
            </th>
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {items.map((item) => (
            <tr key={item.id} className="bg-background transition-colors hover:bg-surface/50">
              <td className="px-4 py-3">
                <div className="relative h-12 w-16 overflow-hidden border border-border bg-surface">
                  <Image
                    src={getPrimaryImage(item)}
                    alt={item.vehicle}
                    fill
                    className="object-contain p-1"
                    sizes="64px"
                  />
                </div>
              </td>
              <td className="px-4 py-3">
                <Link
                  href={`/vehicles/${item.slug}`}
                  className="font-medium text-foreground hover:underline"
                >
                  {item.vehicle}
                </Link>
                <p className="text-xs capitalize text-muted">{item.category}</p>
              </td>
              <td className="px-4 py-3 text-muted">{item.variant}</td>
              <td className="px-4 py-3">
                <Numeric className="font-medium text-foreground">
                  {formatPrice(item.price)}
                </Numeric>
              </td>
              <td className="px-4 py-3">
                <StockBadge status={item.stockStatus} />
              </td>
              <td className="px-4 py-3 text-xs text-muted">
                {item.specifications.length} fields
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1">
                  <Button href={`/admin/vehicles/${item.id}/edit`} variant="ghost" size="sm">
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={deletingId === item.id}
                    onClick={() => handleDelete(item.id, `${item.vehicle} ${item.variant}`)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
