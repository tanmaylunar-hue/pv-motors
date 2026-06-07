"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Pencil, Plus, Trash2, Star, ArrowUp, ArrowDown, 
  Undo, RotateCcw, Save, Check, GripVertical, AlertCircle 
} from "lucide-react";
import type { CatalogueItem } from "@/types/catalogue";
import { formatPrice, getPrimaryImage } from "@/lib/catalogue-format";
import { StockBadge } from "@/components/vehicles/StockBadge";
import { Button } from "@/components/ui/Button";
import { Numeric } from "@/components/ui/Numeric";
import { useSearchParams } from "next/navigation";

type SavingState = "idle" | "saving" | "saved" | "error";

export function AdminVehicleTable() {
  const searchParams = useSearchParams();
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [items, setItems] = useState<CatalogueItem[]>([]);
  const [originalItems, setOriginalItems] = useState<CatalogueItem[]>([]);
  const [initialItems, setInitialItems] = useState<CatalogueItem[]>([]);
  const [undoStack, setUndoStack] = useState<CatalogueItem[][]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingFeaturedId, setUpdatingFeaturedId] = useState<string | null>(null);
  const [savingState, setSavingState] = useState<SavingState>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get("saved") === "true") {
      setShowSavedToast(true);
      const timer = setTimeout(() => setShowSavedToast(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  // Drag & Drop State
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [draggedOffset, setDraggedOffset] = useState<number>(0);
  
  const dragStartYRef = useRef<number>(0);
  const activeIndexRef = useRef<number | null>(null);
  const rowHeightRef = useRef<number>(76); // Estimated height of list row

  // Load items from API
  const loadItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/catalogue");
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Failed to load vehicles.");
        return;
      }
      // Sort initially by sequence ASC
      const sorted = [...data].sort((a, b) => a.sequence - b.sequence);
      setItems(sorted);
      setOriginalItems(sorted);
      setInitialItems(sorted);
      setUndoStack([]);
    } catch {
      setError("Failed to load vehicles.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadItems();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadItems]);

  // Poll for catalogue updates from other admins in real-time
  useEffect(() => {
    if (loading) return;

    const interval = setInterval(async () => {
      // Only refresh if not dragging and not currently saving
      if (draggedIndex !== null || savingState === "saving") return;

      try {
        const response = await fetch("/api/admin/catalogue");
        if (response.ok) {
          const data = await response.json();
          const sorted = [...data].sort((a, b) => a.sequence - b.sequence);
          
          // Compare with last saved list from database
          if (JSON.stringify(sorted) !== JSON.stringify(originalItems)) {
            setItems(sorted);
            setOriginalItems(sorted);
            if (undoStack.length === 0) {
              setInitialItems(sorted);
            }
          }
        }
      } catch (err) {
        console.error("Catalogue background poll failed:", err);
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [loading, draggedIndex, savingState, originalItems, undoStack.length]);

  // Persist sequence order in database
  const persistOrder = useCallback(async (newItems: CatalogueItem[]) => {
    setSavingState("saving");
    setError(null);
    try {
      // Map sequence numbers to correspond exactly with indices
      const updates = newItems.map((item, idx) => ({
        id: item.id,
        sequence: idx,
      }));

      const response = await fetch("/api/admin/catalogue", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to persist order.");
      }

      setSavingState("saved");
      setOriginalItems(newItems);
      setTimeout(() => setSavingState("idle"), 2000);
    } catch (err) {
      console.error("Sequence persistence failed:", err);
      setSavingState("error");
      setError("Failed to save sequence order. Reverting changes.");
      // Rollback to original database state
      setItems(originalItems);
    }
  }, [originalItems]);

  // Adjacent Swapping Logic
  const handleAdjacentMove = useCallback((idx: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= items.length) return;

    // Preserve scroll position
    const scrollY = window.scrollY;

    // Push current items to undo stack
    setUndoStack((prev) => [...prev, items]);

    const newItems = [...items];
    const temp = newItems[idx];
    newItems[idx] = newItems[targetIdx];
    newItems[targetIdx] = temp;

    setItems(newItems);
    persistOrder(newItems);

    // Keep scroll position stable
    setTimeout(() => {
      window.scrollTo(0, scrollY);
    }, 0);
  }, [items, persistOrder]);

  const handlePinToTop = useCallback((idx: number) => {
    if (idx === 0) return;

    const scrollY = window.scrollY;
    setUndoStack((prev) => [...prev, items]);

    const newItems = [...items];
    const [targetItem] = newItems.splice(idx, 1);
    newItems.unshift(targetItem);

    setItems(newItems);
    persistOrder(newItems);

    setTimeout(() => {
      window.scrollTo(0, scrollY);
    }, 0);
  }, [items, persistOrder]);

  // Undo and Reset handlers
  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    const scrollY = window.scrollY;
    
    const previous = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));
    setItems(previous);
    persistOrder(previous);

    setTimeout(() => {
      window.scrollTo(0, scrollY);
    }, 0);
  }, [undoStack, persistOrder]);

  const handleReset = useCallback(() => {
    if (!window.confirm("Reset list back to the saved database order?")) return;
    const scrollY = window.scrollY;
    
    setItems(initialItems);
    setUndoStack([]);
    persistOrder(initialItems);

    setTimeout(() => {
      window.scrollTo(0, scrollY);
    }, 0);
  }, [initialItems, persistOrder]);

  // Feature Toggle Action
  const handleToggleFeatured = useCallback(async (id: string, currentFeatured: boolean) => {
    setUpdatingFeaturedId(id);
    try {
      const response = await fetch(`/api/admin/catalogue/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: !currentFeatured }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Failed to update featured state.");
        return;
      }
      setItems((current) =>
        current.map((item) =>
          item.id === id ? { ...item, featured: !currentFeatured } : item
        )
      );
      setOriginalItems((current) =>
        current.map((item) =>
          item.id === id ? { ...item, featured: !currentFeatured } : item
        )
      );
    } catch {
      setError("Failed to update featured state.");
    } finally {
      setUpdatingFeaturedId(null);
    }
  }, []);

  // Delete Action
  const handleDelete = useCallback(async (id: string, label: string) => {
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
      setOriginalItems((current) => current.filter((item) => item.id !== id));
    } catch {
      setError("Delete failed.");
    } finally {
      setDeletingId(null);
    }
  }, []);

  // Drag and Drop (Pointer Event Handlers)
  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>, idx: number) => {
    // Only drag with left mouse click or touch
    if (e.button !== 0) return;
    
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStartYRef.current = e.clientY;
    activeIndexRef.current = idx;
    setDraggedIndex(idx);
    setDraggedOffset(0);

    // Save history prior to dragging
    setUndoStack((prev) => [...prev, items]);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (draggedIndex === null || activeIndexRef.current === null) return;
    
    const deltaY = e.clientY - dragStartYRef.current;
    setDraggedOffset(deltaY);

    const rowHeight = rowHeightRef.current;
    
    // Check if dragging down
    if (deltaY > rowHeight / 2 && activeIndexRef.current < items.length - 1) {
      const idx = activeIndexRef.current;
      setItems((current) => {
        const next = [...current];
        const temp = next[idx];
        next[idx] = next[idx + 1];
        next[idx + 1] = temp;
        return next;
      });
      activeIndexRef.current = idx + 1;
      dragStartYRef.current += rowHeight;
      setDraggedOffset((prev) => prev - rowHeight);
    } 
    // Check if dragging up
    else if (deltaY < -rowHeight / 2 && activeIndexRef.current > 0) {
      const idx = activeIndexRef.current;
      setItems((current) => {
        const next = [...current];
        const temp = next[idx];
        next[idx] = next[idx - 1];
        next[idx - 1] = temp;
        return next;
      });
      activeIndexRef.current = idx - 1;
      dragStartYRef.current -= rowHeight;
      setDraggedOffset((prev) => prev + rowHeight);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    setDraggedIndex(null);
    setDraggedOffset(0);
    activeIndexRef.current = null;
    persistOrder(items);
  };

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
      <div className="rounded border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm font-medium text-red-600 mb-4">{error}</p>
        <Button onClick={loadItems} size="sm">
          Retry Loading
        </Button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="border border-dashed border-border p-10 text-center bg-surface/30">
        <p className="text-sm text-muted">No vehicles available</p>
        <Button href="/admin/vehicles/new" className="mt-4" size="sm">
          <Plus className="h-4 w-4" />
          Add Vehicle
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showSavedToast && (
        <div className="flex items-center gap-2 border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800 rounded animate-in fade-in select-none">
          <Check className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>Vehicle variant saved successfully!</span>
        </div>
      )}
      {/* Top Reordering Controls Panel */}
      <div className="flex flex-wrap items-center justify-between gap-4 border border-border bg-surface px-4 py-3 select-none">
        <div className="flex items-center gap-2">
          {/* Status Feedback Indicator */}
          {savingState === "saving" && (
            <span className="inline-flex items-center gap-1.5 text-xs text-muted font-medium">
              <span className="h-2 w-2 animate-ping rounded-full bg-black" />
              Saving...
            </span>
          )}
          {savingState === "saved" && (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
              <Check className="h-4 w-4" />
              Saved ✓
            </span>
          )}
          {savingState === "error" && (
            <span className="inline-flex items-center gap-1 text-xs text-red-600 font-medium">
              <AlertCircle className="h-4 w-4" />
              Failed to save
            </span>
          )}
          {savingState === "idle" && (
            <span className="text-xs text-muted">
              Display sequence persists instantly on reorder.
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => persistOrder(items)}
            disabled={savingState === "saving" || JSON.stringify(items) === JSON.stringify(originalItems)}
            className="inline-flex items-center gap-1.5 border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-neutral-50 disabled:opacity-40"
          >
            <Save className="h-3.5 w-3.5" />
            Save Order
          </button>
          <button
            type="button"
            onClick={handleUndo}
            disabled={undoStack.length === 0}
            className="inline-flex items-center gap-1.5 border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-neutral-50 disabled:opacity-40"
          >
            <Undo className="h-3.5 w-3.5" />
            Undo Changes
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-neutral-50"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Order
          </button>
        </div>
      </div>

      {/* Reordering Grid (Behaves exactly like a table but enables smooth css animations) */}
      <div className="border border-border">
        {/* Table-like headers */}
        <div className="grid grid-cols-[40px_80px_1.5fr_1fr_1fr_140px_80px_100px_160px] gap-4 bg-surface border-b border-border px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted select-none">
          <div></div>
          <div>Image</div>
          <div>Vehicle</div>
          <div>Variant</div>
          <div>Price</div>
          <div className="text-center">Sequence Order</div>
          <div className="text-center">Featured</div>
          <div>Stock</div>
          <div>Actions</div>
        </div>

        {/* List Rows */}
        <div className="divide-y divide-border bg-background relative">
          {items.map((item, idx) => {
            const isDraggingThis = draggedIndex === idx;

            return (
              <div
                key={item.id}
                className={`grid grid-cols-[40px_80px_1.5fr_1fr_1fr_140px_80px_100px_160px] gap-4 items-center px-4 py-3 bg-background transition-all duration-200 ${
                  isDraggingThis
                    ? "z-10 shadow-lg scale-[1.02] border-y border-neutral-300 bg-neutral-50"
                    : ""
                }`}
                style={{
                  transform: isDraggingThis ? `translate3d(0, ${draggedOffset}px, 0)` : "none",
                  transition: isDraggingThis ? "none" : "transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.2s",
                }}
              >
                {/* Drag Handle */}
                <div className="flex items-center justify-center">
                  <button
                    type="button"
                    onPointerDown={(e) => handlePointerDown(e, idx)}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    className="cursor-grab active:cursor-grabbing p-1.5 text-muted hover:text-foreground hover:bg-surface border border-transparent rounded touch-none"
                    title="Drag to Reorder"
                  >
                    <GripVertical className="h-4.5 w-4.5" />
                  </button>
                </div>

                {/* Cover Image */}
                <div>
                  <div className="relative h-11 w-14 overflow-hidden border border-border bg-surface">
                    <Image
                      src={getPrimaryImage(item)}
                      alt={item.vehicle}
                      fill
                      className="object-contain p-1"
                      sizes="64px"
                    />
                  </div>
                </div>

                {/* Vehicle title */}
                <div className="truncate">
                  <Link
                    href={`/vehicles/${item.slug}`}
                    className="font-medium text-foreground hover:underline truncate block"
                  >
                    {item.vehicle}
                  </Link>
                  <p className="text-[10px] uppercase tracking-wider text-muted">{item.category}</p>
                </div>

                {/* Variant */}
                <div className="text-muted truncate">{item.variant}</div>

                {/* Price */}
                <div>
                  <Numeric className="font-semibold text-foreground">
                    {formatPrice(item.price)}
                  </Numeric>
                </div>

                {/* Sequence Controls */}
                <div className="flex items-center justify-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleAdjacentMove(idx, "up")}
                    disabled={idx === 0 || draggedIndex !== null}
                    className="p-1 border border-border text-muted hover:text-foreground disabled:opacity-30 rounded hover:bg-neutral-50 transition-all active:scale-90"
                    title="Move Up"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-8 text-center text-xs font-mono font-medium text-foreground select-none">
                    {idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleAdjacentMove(idx, "down")}
                    disabled={idx === items.length - 1 || draggedIndex !== null}
                    className="p-1 border border-border text-muted hover:text-foreground disabled:opacity-30 rounded hover:bg-neutral-50 transition-all active:scale-90"
                    title="Move Down"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePinToTop(idx)}
                    disabled={idx === 0 || draggedIndex !== null}
                    className="ml-1 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-muted hover:text-foreground border border-border hover:bg-neutral-50 transition-all"
                    title="Pin to Top"
                  >
                    Pin
                  </button>
                </div>

                {/* Featured Star toggle */}
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => handleToggleFeatured(item.id, item.featured)}
                    disabled={updatingFeaturedId === item.id || draggedIndex !== null}
                    className="flex items-center justify-center p-1 text-muted transition-colors hover:text-foreground disabled:opacity-50"
                    title={item.featured ? "Remove from Featured" : "Mark as Featured"}
                  >
                    <Star
                      className={`h-4.5 w-4.5 transition-all ${
                        item.featured
                          ? "text-amber-500 fill-amber-500 scale-110"
                          : "text-muted hover:text-foreground"
                      }`}
                    />
                  </button>
                </div>

                {/* Stock badge */}
                <div>
                  <StockBadge status={item.stockStatus} />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5">
                  <Button
                    href={`/admin/vehicles/${item.id}/edit`}
                    variant="ghost"
                    size="sm"
                    className={draggedIndex !== null ? "pointer-events-none opacity-40" : ""}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={deletingId === item.id || draggedIndex !== null}
                    onClick={() => handleDelete(item.id, `${item.vehicle} ${item.variant}`)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
