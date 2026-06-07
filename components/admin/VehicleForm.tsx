"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  Plus, Trash2, Upload, X, ArrowLeft, ArrowRight, RefreshCw, 
  Lock, AlertCircle, History, Undo 
} from "lucide-react";
import type { Specification, StockStatus, VehicleCategory } from "@/types/catalogue";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

type VehicleFormValues = {
  vehicleName: string;
  category: VehicleCategory;
  variantName: string;
  price: string;
  description: string;
  specifications: Specification[];
  images: string[];
  images360: string[];
  sequence: string;
  stockStatus: StockStatus;
  stockQuantity: string;
  featured: boolean;
};

const defaultValues: VehicleFormValues = {
  vehicleName: "",
  category: "scooter",
  variantName: "",
  price: "",
  description: "",
  specifications: [{ label: "", value: "" }],
  images: [],
  images360: [],
  sequence: "0",
  stockStatus: "in_stock",
  stockQuantity: "6",
  featured: false,
};

type VehicleFormProps = {
  variantId?: string;
  initialValues?: Partial<VehicleFormValues>;
};

type LockState = {
  locked: boolean;
  username?: string;
  role?: string;
  acquiredAt?: string;
};

type HistoryEntry = {
  id: string;
  variantId: string;
  adminId: string | null;
  admin: { username: string; role: string } | null;
  data: any;
  createdAt: string;
};

export function VehicleForm({ variantId, initialValues }: VehicleFormProps) {
  const router = useRouter();
  const isEditing = Boolean(variantId);
  const [form, setForm] = useState<VehicleFormValues>({
    ...defaultValues,
    ...initialValues,
    specifications:
      initialValues?.specifications?.length
        ? initialValues.specifications
        : defaultValues.specifications,
    images: initialValues?.images ?? [],
    images360: initialValues?.images360 ?? [],
    sequence: initialValues?.sequence ?? "0",
  });
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Concurrency & Lock States
  const [lockState, setLockState] = useState<LockState | null>(null);
  const [lockMode, setLockMode] = useState<"edit" | "view_only" | "waiting" | null>(isEditing ? "waiting" : "edit");
  const [pollingActive, setPollingActive] = useState(false);

  // Autosave & Draft States
  const [draftBannerVisible, setDraftBannerVisible] = useState(false);
  const [draftData, setDraftData] = useState<VehicleFormValues | null>(null);
  const [draftTime, setDraftTime] = useState<string | null>(null);

  // Overwrite Warning State
  const [showConflictWarning, setShowConflictWarning] = useState(false);
  const [lastLoadedUpdatedAt, setLastLoadedUpdatedAt] = useState<string | null>(null);

  // History States
  const [historyList, setHistoryList] = useState<HistoryEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Fetch lock status on mount
  useEffect(() => {
    if (!variantId) return;
    checkLock();

    async function checkLock(force = false) {
      try {
        const response = await fetch(`/api/admin/catalogue/${variantId}/lock`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ force }),
        });
        const data = await response.json();
        
        if (data.locked) {
          setLockState({
            locked: true,
            username: data.username,
            role: data.role,
            acquiredAt: data.acquiredAt,
          });
          setLockMode("waiting");
        } else {
          setLockState({ locked: false });
          setLockMode("edit");
        }
      } catch (err) {
        console.error("Lock error:", err);
      }
    }
  }, [variantId]);

  // Polling for lock when in Waiting mode
  useEffect(() => {
    if (!variantId || lockMode !== "waiting" || !pollingActive) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/admin/catalogue/${variantId}/lock`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        const data = await response.json();
        if (!data.locked) {
          clearInterval(interval);
          setLockState({ locked: false });
          setLockMode("edit");
          setPollingActive(false);
        }
      } catch (err) {
        console.error("Lock polling error:", err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [variantId, lockMode, pollingActive]);

  // Heartbeat interval when lock is active
  useEffect(() => {
    if (!variantId || lockMode !== "edit" || loading) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/admin/catalogue/${variantId}/lock/heartbeat`, {
          method: "POST",
        });
        if (!response.ok) {
          // If heartbeat fails because lock was lost/stolen, re-acquire
          const responseCheck = await fetch(`/api/admin/catalogue/${variantId}/lock`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          });
          const data = await responseCheck.json();
          if (data.locked) {
            setLockState({
              locked: true,
              username: data.username,
              role: data.role,
              acquiredAt: data.acquiredAt,
            });
            setLockMode("waiting");
          }
        }
      } catch (err) {
        console.error("Heartbeat error:", err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [variantId, lockMode, loading]);

  // Release lock on unmount
  useEffect(() => {
    return () => {
      if (variantId && lockMode === "edit") {
        fetch(`/api/admin/catalogue/${variantId}/lock`, { method: "DELETE" }).catch(() => {});
      }
    };
  }, [variantId, lockMode]);

  // Load variant details, history list, and check for drafts
  useEffect(() => {
    if (!variantId) return;

    async function loadVariantData() {
      try {
        // 1. Fetch Variant details
        const variantResponse = await fetch(`/api/admin/catalogue/${variantId}`);
        const data = await variantResponse.json();
        if (!variantResponse.ok) {
          setError(data.error ?? "Failed to load vehicle.");
          return;
        }

        setForm({
          vehicleName: data.vehicle.name,
          category: data.vehicle.category,
          variantName: data.name,
          price: String(data.price),
          description: data.tagline,
          specifications:
            (data.specifications as Specification[]).length > 0
              ? (data.specifications as Specification[])
              : [{ label: "", value: "" }],
          images: (data.images as string[]) ?? [],
          images360: (data.images360 as string[]) ?? [],
          sequence: String(data.sequence ?? 0),
          stockStatus: data.stockStatus,
          stockQuantity: String(data.stockQuantity ?? 6),
          featured: data.featured,
        });

        // Store updatedAt for concurrency overwrite checks
        setLastLoadedUpdatedAt(data.updatedAt);

        // 2. Fetch Autosaved Draft (if exists)
        const draftResponse = await fetch(`/api/admin/catalogue/${variantId}/draft`);
        const draftDataRes = await draftResponse.json();
        if (draftResponse.ok && draftDataRes.draft) {
          setDraftData(draftDataRes.draft);
          setDraftTime(draftDataRes.updatedAt);
          setDraftBannerVisible(true);
        }

        // 3. Fetch Version History
        loadHistory();
      } catch {
        setError("Failed to load vehicle.");
      } finally {
        setLoading(false);
      }
    }

    loadVariantData();
  }, [variantId]);

  // Autosave Draft interval when changes occur
  useEffect(() => {
    if (!variantId || lockMode !== "edit" || loading) return;

    const timer = setTimeout(async () => {
      try {
        await fetch(`/api/admin/catalogue/${variantId}/draft`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      } catch (err) {
        console.error("Autosave draft failed:", err);
      }
    }, 2000); // 2s debounce

    return () => clearTimeout(timer);
  }, [form, variantId, lockMode, loading]);

  async function loadHistory() {
    if (!variantId) return;
    setHistoryLoading(true);
    try {
      const historyResponse = await fetch(`/api/admin/catalogue/${variantId}/history`);
      const data = await historyResponse.json();
      if (historyResponse.ok) {
        setHistoryList(data);
      }
    } catch (err) {
      console.error("Failed to load history:", err);
    } finally {
      setHistoryLoading(false);
    }
  }

  // Waiting lock handler
  function startWaitingLock() {
    setPollingActive(true);
  }

  // Take over lock handler
  async function handleTakeOver() {
    if (!variantId) return;
    try {
      const response = await fetch(`/api/admin/catalogue/${variantId}/lock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ force: true }),
      });
      const data = await response.json();
      if (!data.locked) {
        setLockState({ locked: false });
        setLockMode("edit");
        setPollingActive(false);
      } else {
        alert("Could not take over editing lock. Please try again.");
      }
    } catch {
      alert("Take over failed.");
    }
  }

  // View only lock handler
  function handleViewOnly() {
    setLockMode("view_only");
  }

  // Draft actions
  function restoreDraft() {
    if (draftData) {
      setForm(draftData);
      setDraftBannerVisible(false);
    }
  }

  async function discardDraft() {
    if (!variantId) return;
    try {
      await fetch(`/api/admin/catalogue/${variantId}/draft`, {
        method: "DELETE",
      });
      setDraftBannerVisible(false);
    } catch {
      alert("Failed to discard draft.");
    }
  }

  // Revert/Undo history snapshot
  function handleRestoreHistory(entry: HistoryEntry) {
    const data = entry.data;
    setForm({
      vehicleName: data.vehicleName,
      category: data.category,
      variantName: data.name,
      price: String(data.price),
      description: data.tagline,
      specifications: data.specifications.length > 0 ? data.specifications : [{ label: "", value: "" }],
      images: data.images ?? [],
      images360: data.images360 ?? [],
      sequence: String(data.sequence ?? 0),
      stockStatus: data.stockStatus,
      stockQuantity: String(data.stockQuantity ?? 6),
      featured: data.featured,
    });
  }

  function handleUndoHistory() {
    if (historyList.length === 0) return;
    // The immediately preceding version is historyList[0]
    handleRestoreHistory(historyList[0]);
  }

  // Quantity Change Badge logic
  function handleQuantityChange(qtyStr: string) {
    const qty = Number(qtyStr);
    setForm((current) => {
      let nextStatus = current.stockStatus;
      if (nextStatus !== "pre_order") {
        if (!qtyStr || isNaN(qty) || qty === 0) {
          nextStatus = "out_of_stock";
        } else if (qty <= 5) {
          nextStatus = "low_stock";
        } else {
          nextStatus = "in_stock";
        }
      }
      return {
        ...current,
        stockQuantity: qtyStr,
        stockStatus: nextStatus,
      };
    });
  }

  function updateSpec(index: number, field: keyof Specification, value: string) {
    setForm((current) => ({
      ...current,
      specifications: current.specifications.map((spec, i) =>
        i === index ? { ...spec, [field]: value } : spec
      ),
    }));
  }

  function addSpecRow() {
    setForm((current) => ({
      ...current,
      specifications: [...current.specifications, { label: "", value: "" }],
    }));
  }

  function removeSpecRow(index: number) {
    setForm((current) => ({
      ...current,
      specifications: current.specifications.filter((_, i) => i !== index),
    }));
  }

  function removeImage(url: string) {
    setForm((current) => ({
      ...current,
      images: current.images.filter((image) => image !== url),
    }));
  }

  function removeImage360(url: string) {
    setForm((current) => ({
      ...current,
      images360: current.images360.filter((image) => image !== url),
    }));
  }

  function moveImage(index: number, direction: "left" | "right") {
    setForm((current) => {
      const newImages = [...current.images];
      const targetIndex = direction === "left" ? index - 1 : index + 1;
      if (targetIndex >= 0 && targetIndex < newImages.length) {
        const temp = newImages[index];
        newImages[index] = newImages[targetIndex];
        newImages[targetIndex] = temp;
      }
      return { ...current, images: newImages };
    });
  }

  function moveImage360(index: number, direction: "left" | "right") {
    setForm((current) => {
      const newImages = [...current.images360];
      const targetIndex = direction === "left" ? index - 1 : index + 1;
      if (targetIndex >= 0 && targetIndex < newImages.length) {
        const temp = newImages[index];
        newImages[index] = newImages[targetIndex];
        newImages[targetIndex] = temp;
      }
      return { ...current, images360: newImages };
    });
  }

  async function handleReplaceImage(index: number, e: React.ChangeEvent<HTMLInputElement>, is360 = false) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Image upload failed.");
        return;
      }

      setForm((current) => {
        const field = is360 ? "images360" : "images";
        const arr = [...current[field]];
        arr[index] = data.url;
        return { ...current, [field]: arr };
      });
    } catch {
      setError("Image upload failed.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Image upload failed.");
        return;
      }

      setForm((current) => ({
        ...current,
        images: [...current.images, data.url],
      }));
    } catch {
      setError("Image upload failed.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleImage360Upload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      const urls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });
        const data = await response.json();

        if (!response.ok) {
          setError(data.error ?? "Image upload failed.");
          break;
        }
        urls.push(data.url);
      }

      setForm((current) => ({
        ...current,
        images360: [...current.images360, ...urls],
      }));
    } catch {
      setError("Image upload failed.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  // Main save action
  async function handleSubmit(e: React.FormEvent, forceOverwrite = false) {
    if (e) e.preventDefault();
    setSubmitting(true);
    setError(null);

    const price = Number(form.price);
    const stockQuantity = Number(form.stockQuantity);
    const specifications = form.specifications.filter(
      (spec) => spec.label.trim() && spec.value.trim()
    );

    if (!form.vehicleName.trim() || !form.variantName.trim() || !form.description.trim()) {
      setError("Vehicle name, variant, and description are required.");
      setSubmitting(false);
      return;
    }

    if (!Number.isFinite(price) || price <= 0) {
      setError("Enter a valid price.");
      setSubmitting(false);
      return;
    }

    if (isNaN(stockQuantity) || stockQuantity < 0) {
      setError("Enter a valid stock quantity.");
      setSubmitting(false);
      return;
    }

    const payload = {
      vehicleName: form.vehicleName.trim(),
      category: form.category,
      variantName: form.variantName.trim(),
      price,
      description: form.description.trim(),
      specifications,
      images: form.images,
      images360: form.images360,
      sequence: Number(form.sequence || 0),
      stockStatus: form.stockStatus,
      stockQuantity,
      featured: form.featured,
      overwrite: forceOverwrite,
      lastLoadedUpdatedAt,
    };

    try {
      const response = await fetch(
        isEditing ? `/api/admin/catalogue/${variantId}` : "/api/admin/catalogue",
        {
          method: isEditing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await response.json();

      if (response.status === 409 && data.error === "conflict") {
        setShowConflictWarning(true);
        setSubmitting(false);
        return;
      }

      if (!response.ok) {
        setError(data.error ?? "Save failed.");
        return;
      }

      // If we saved successfully, release lock
      if (variantId && lockMode === "edit") {
        await fetch(`/api/admin/catalogue/${variantId}/lock`, { method: "DELETE" });
      }

      router.push("/admin/vehicles");
      router.refresh();
    } catch {
      setError("Save failed.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-muted">Loading vehicle...</p>;
  }

  return (
    <div className="relative">
      {/* Editing Lock Overlay Modal */}
      {isEditing && lockState?.locked && lockMode === "waiting" && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm px-4 select-none">
          <Card className="w-full max-w-md p-6 text-center shadow-2xl border border-border bg-surface">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center border border-amber-200 bg-amber-50 text-amber-600">
              <Lock className="h-5 w-5" />
            </div>
            <h3 className="font-display text-lg font-bold text-foreground mb-2">Currently being edited</h3>
            <p className="text-sm text-muted mb-6">
              This vehicle entry is currently being edited by <strong>{lockState.username}</strong> ({lockState.role}).
            </p>
            <div className="flex flex-col gap-3">
              <Button 
                type="button" 
                variant="primary" 
                onClick={startWaitingLock} 
                className="w-full"
                disabled={pollingActive}
              >
                {pollingActive ? "Waiting for lock release..." : "Wait"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleTakeOver} 
                className="w-full text-red-500 hover:text-red-700 hover:bg-red-50 hover:border-red-200"
              >
                Take Over
              </Button>
              <Button type="button" variant="ghost" onClick={handleViewOnly} className="w-full">
                View Only (Read Only Mode)
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Overwrite Prevention Dialog Modal */}
      {showConflictWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm px-4 select-none">
          <Card className="w-full max-w-md p-6 text-center shadow-2xl border border-border bg-surface">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center border border-red-200 bg-red-50 text-red-600">
              <AlertCircle className="h-5 w-5" />
            </div>
            <h3 className="font-display text-lg font-bold text-foreground mb-2">Overwrite changes?</h3>
            <p className="text-sm text-muted mb-6">
              Another admin has modified this entry since you loaded it. Saving now will overwrite their changes. Do you want to proceed anyway?
            </p>
            <div className="flex gap-3">
              <Button 
                type="button" 
                variant="primary" 
                onClick={() => handleSubmit(undefined as any, true)} 
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                Yes, Overwrite
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowConflictWarning(false)} 
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Grid: Form + Revision History Side-by-Side */}
      <div className={isEditing ? "grid gap-6 lg:grid-cols-[1fr_320px]" : "space-y-6"}>
        {/* Left column: main form card */}
        <div className="space-y-6">
          {/* Draft recovery banner */}
          {draftBannerVisible && (
            <div className="flex flex-wrap items-center justify-between gap-4 border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-800">
              <div className="flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
                <span>You have an autosaved draft from {draftTime ? new Date(draftTime).toLocaleTimeString("en-IN") : "earlier"}. Reapply changes?</span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  type="button" 
                  onClick={restoreDraft} 
                  className="bg-amber-600 text-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider hover:bg-amber-700"
                >
                  Restore
                </button>
                <button 
                  type="button" 
                  onClick={discardDraft} 
                  className="border border-amber-300 text-amber-700 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider hover:bg-amber-100"
                >
                  Discard
                </button>
              </div>
            </div>
          )}

          <Card>
            {/* View only banner */}
            {lockMode === "view_only" && (
              <div className="mb-6 flex items-center gap-2 border border-blue-200 bg-blue-50 px-4 py-3 text-xs font-semibold text-blue-800">
                <Lock className="h-4 w-4 text-blue-600 shrink-0" />
                <span>Viewing in View-Only mode. You cannot save changes because another user holds the editing lock.</span>
              </div>
            )}

            <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
              <fieldset disabled={lockMode === "view_only" || submitting || uploading} className="space-y-6 border-0 p-0 m-0">
                <div className="grid gap-5 sm:grid-cols-2">
                  <Input
                    label="Vehicle Name"
                    value={form.vehicleName}
                    onChange={(e) => setForm((current) => ({ ...current, vehicleName: e.target.value }))}
                    placeholder="KOMAKI Ranger"
                    required
                  />
                  <Select
                    label="Category"
                    value={form.category}
                    onChange={(e) =>
                      setForm((current) => ({
                        ...current,
                        category: e.target.value as VehicleCategory,
                      }))
                    }
                    required
                  >
                    <option value="scooter">Scooter</option>
                    <option value="motorcycle">Motorcycle</option>
                    <option value="loader">Loader</option>
                  </Select>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Input
                    label="Variant"
                    value={form.variantName}
                    onChange={(e) => setForm((current) => ({ ...current, variantName: e.target.value }))}
                    placeholder="Pro 3.2 kWh"
                    required
                  />
                  <Input
                    label="Price (INR)"
                    type="number"
                    min={1}
                    value={form.price}
                    onChange={(e) => setForm((current) => ({ ...current, price: e.target.value }))}
                    placeholder="129999"
                    required
                  />
                </div>

                <Textarea
                  label="Description"
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))}
                  placeholder="Urban agility meets long-range comfort"
                  required
                />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium uppercase tracking-[0.15em] text-muted">
                      Specifications
                    </p>
                    {lockMode !== "view_only" && (
                      <Button type="button" variant="outline" size="sm" onClick={addSpecRow}>
                        <Plus className="h-3.5 w-3.5" />
                        Add Row
                      </Button>
                    )}
                  </div>
                  {form.specifications.map((spec, index) => (
                    <div key={index} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                      <Input
                        label={index === 0 ? "Label" : undefined}
                        value={spec.label}
                        onChange={(e) => updateSpec(index, "label", e.target.value)}
                        placeholder="Range"
                      />
                      <Input
                        label={index === 0 ? "Value" : undefined}
                        value={spec.value}
                        onChange={(e) => updateSpec(index, "value", e.target.value)}
                        placeholder="180 km"
                      />
                      <div className={index === 0 ? "pt-7" : ""}>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSpecRow(index)}
                          disabled={form.specifications.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Showroom Images */}
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted">
                      Showroom Gallery Images
                    </p>
                    <p className="text-xs text-muted mt-1">
                      Add showroom quality images. The first image will be used as the Main Cover Hero image.
                    </p>
                  </div>
                  {form.images.length > 0 && (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                      {form.images.map((url, index) => {
                        let label = "Detail Image";
                        if (index === 0) label = "1: Hero / Cover";
                        else if (index === 1) label = "2: Front View";
                        else if (index === 2) label = "3: Side View";
                        else if (index === 3) label = "4: Dashboard";

                        return (
                          <div
                            key={url}
                            className="group relative flex flex-col border border-border bg-surface p-2 transition-all hover:border-black/30"
                          >
                            <div className="relative aspect-[4/3] w-full overflow-hidden border border-border bg-background">
                              <Image src={url} alt={`Showroom image ${index + 1}`} fill className="object-contain p-1" sizes="200px" />
                            </div>
                            <div className="mt-2 text-[10px] font-medium text-muted uppercase text-center truncate">
                              {label}
                            </div>
                            
                            {/* Action controls */}
                            <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-2">
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => moveImage(index, "left")}
                                  disabled={index === 0}
                                  className="p-1 text-muted hover:text-foreground disabled:opacity-30"
                                  title="Move Left"
                                >
                                  <ArrowLeft className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => moveImage(index, "right")}
                                  disabled={index === form.images.length - 1}
                                  className="p-1 text-muted hover:text-foreground disabled:opacity-30"
                                  title="Move Right"
                                >
                                  <ArrowRight className="h-3.5 w-3.5" />
                                </button>
                              </div>
                              <div className="flex items-center gap-1">
                                <label className="cursor-pointer p-1 text-muted hover:text-foreground" title="Replace Image">
                                  <RefreshCw className="h-3.5 w-3.5" />
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handleReplaceImage(index, e, false)}
                                  />
                                </label>
                                <button
                                  type="button"
                                  onClick={() => removeImage(url)}
                                  className="p-1 text-red-500 hover:text-red-700"
                                  title="Delete Image"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {lockMode !== "view_only" && (
                    <label className="inline-flex cursor-pointer items-center gap-2 border border-border px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-surface bg-background">
                      <Upload className="h-4 w-4" />
                      {uploading ? "Uploading..." : "Upload Showroom Image"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={uploading}
                      />
                    </label>
                  )}
                </div>

                {/* 360° Rotational Images */}
                <div className="space-y-4 border-t border-border pt-6">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted">
                      360° Rotational View Frames
                    </p>
                    <p className="text-xs text-muted mt-1">
                      Upload multiple sequential frames taken from different angles to form the 360-degree rotational spin. Drag-to-rotate utilizes the order below.
                    </p>
                  </div>
                  {form.images360.length > 0 && (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
                      {form.images360.map((url, index) => (
                        <div
                          key={url}
                          className="group relative flex flex-col border border-border bg-surface p-1.5 transition-all hover:border-black/30"
                        >
                          <div className="relative aspect-square w-full overflow-hidden border border-border bg-background">
                            <Image src={url} alt={`360 image ${index + 1}`} fill className="object-contain p-0.5" sizes="120px" />
                          </div>
                          <div className="mt-1.5 text-[9px] font-mono text-muted text-center">
                            F{index + 1} ({Math.round((index / form.images360.length) * 360)}°)
                          </div>
                          <div className="mt-2 flex items-center justify-between border-t border-border/40 pt-1">
                            <div className="flex gap-0.5">
                              <button
                                type="button"
                                onClick={() => moveImage360(index, "left")}
                                disabled={index === 0}
                                className="p-0.5 text-muted hover:text-foreground disabled:opacity-30"
                              >
                                <ArrowLeft className="h-3 w-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => moveImage360(index, "right")}
                                disabled={index === form.images360.length - 1}
                                className="p-0.5 text-muted hover:text-foreground disabled:opacity-30"
                              >
                                <ArrowRight className="h-3 w-3" />
                              </button>
                            </div>
                            <div className="flex gap-0.5">
                              <label className="cursor-pointer p-0.5 text-muted hover:text-foreground">
                                <RefreshCw className="h-3 w-3" />
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => handleReplaceImage(index, e, true)}
                                />
                              </label>
                              <button
                                type="button"
                                onClick={() => removeImage360(url)}
                                className="p-0.5 text-red-500 hover:text-red-700"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {lockMode !== "view_only" && (
                    <label className="inline-flex cursor-pointer items-center gap-2 border border-border px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-surface bg-background">
                      <Upload className="h-4 w-4" />
                      {uploading ? "Uploading..." : "Upload 360° Frames (Multi-Select)"}
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleImage360Upload}
                        disabled={uploading}
                      />
                    </label>
                  )}
                </div>

                {/* Configuration settings */}
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 border-t border-border pt-6">
                  <Input
                    label="Stock Quantity"
                    type="number"
                    min={0}
                    value={form.stockQuantity}
                    onChange={(e) => handleQuantityChange(e.target.value)}
                    required
                  />
                  <Select
                    label="Stock Status"
                    value={form.stockStatus}
                    onChange={(e) =>
                      setForm((current) => ({
                        ...current,
                        stockStatus: e.target.value as StockStatus,
                      }))
                    }
                  >
                    <option value="in_stock">In Stock</option>
                    <option value="low_stock">Low Stock</option>
                    <option value="out_of_stock">Out of Stock</option>
                    <option value="pre_order">Pre-Order</option>
                  </Select>
                  <Input
                    label="Display Sequence Number"
                    type="number"
                    min={0}
                    value={form.sequence}
                    onChange={(e) => setForm((current) => ({ ...current, sequence: e.target.value }))}
                    required
                  />
                  <label className="flex items-center gap-3 pt-7 text-sm text-foreground select-none">
                    <input
                      type="checkbox"
                      checked={form.featured}
                      onChange={(e) =>
                        setForm((current) => ({ ...current, featured: e.target.checked }))
                      }
                      className="h-4 w-4 border border-border"
                    />
                    Featured on homepage
                  </label>
                </div>
              </fieldset>

              {error && <p className="text-sm text-red-400">{error}</p>}

              <div className="flex flex-wrap gap-3">
                {lockMode !== "view_only" && (
                  <Button type="submit" disabled={submitting || uploading}>
                    {submitting ? "Saving..." : isEditing ? "Update Vehicle" : "Create Vehicle"}
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/admin/vehicles")}
                >
                  {lockMode === "view_only" ? "Go Back" : "Cancel"}
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Right column: Version History panel (Only visible when editing existing records) */}
        {isEditing && (
          <Card className="h-fit">
            <div className="border-b border-border pb-3 mb-4 flex items-center justify-between">
              <h3 className="font-display text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2 select-none">
                <History className="h-4 w-4 text-neutral-500" />
                History Versions
              </h3>
              {lockMode === "edit" && historyList.length > 0 && (
                <button
                  type="button"
                  onClick={handleUndoHistory}
                  className="inline-flex items-center gap-1 border border-border hover:bg-surface px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-foreground transition-all"
                  title="Undo to last version"
                >
                  <Undo className="h-3 w-3" />
                  Undo
                </button>
              )}
            </div>

            {historyLoading ? (
              <div className="py-8 text-center text-xs text-muted">Loading version list...</div>
            ) : historyList.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted select-none">No edits recorded yet.</div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {historyList.map((entry, index) => {
                  const dateStr = new Date(entry.createdAt).toLocaleString("en-IN", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <div 
                      key={entry.id} 
                      className="border border-border p-2.5 text-xs hover:border-black/20 transition-all bg-background"
                    >
                      <div className="flex items-center justify-between font-semibold text-foreground">
                        <span className="truncate max-w-[120px]">{entry.admin?.username ?? "System"}</span>
                        <span className="font-mono text-[10px] text-muted">{dateStr}</span>
                      </div>
                      <p className="text-[10px] text-muted mt-0.5 capitalize">Role: {entry.admin?.role ?? "system"}</p>
                      
                      {lockMode === "edit" && (
                        <div className="mt-2 border-t border-border/50 pt-2 flex items-center justify-end">
                          <button
                            type="button"
                            onClick={() => handleRestoreHistory(entry)}
                            className="bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 px-2 py-0.5 font-bold uppercase tracking-wider text-[9px] text-neutral-800 transition-all"
                            title="Load these values in the form"
                          >
                            Revert Form to This
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
