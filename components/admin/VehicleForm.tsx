"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Upload, X } from "lucide-react";
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
  stockStatus: StockStatus;
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
  stockStatus: "in_stock",
  featured: false,
};

type VehicleFormProps = {
  variantId?: string;
  initialValues?: Partial<VehicleFormValues>;
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
  });
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!variantId) return;

    async function loadVariant() {
      try {
        const response = await fetch(`/api/admin/catalogue/${variantId}`);
        const data = await response.json();
        if (!response.ok) {
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
          stockStatus: data.stockStatus,
          featured: data.featured,
        });
      } catch {
        setError("Failed to load vehicle.");
      } finally {
        setLoading(false);
      }
    }

    loadVariant();
  }, [variantId]);

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const price = Number(form.price);
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

    const payload = {
      vehicleName: form.vehicleName.trim(),
      category: form.category,
      variantName: form.variantName.trim(),
      price,
      description: form.description.trim(),
      specifications,
      images: form.images,
      stockStatus: form.stockStatus,
      featured: form.featured,
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

      if (!response.ok) {
        setError(data.error ?? "Save failed.");
        return;
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
    <Card>
      <form onSubmit={handleSubmit} className="space-y-6">
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
            <Button type="button" variant="outline" size="sm" onClick={addSpecRow}>
              <Plus className="h-3.5 w-3.5" />
              Add Row
            </Button>
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

        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-muted">
            Images
          </p>
          <div className="flex flex-wrap gap-3">
            {form.images.map((url) => (
              <div
                key={url}
                className="relative h-24 w-32 overflow-hidden border border-border bg-surface"
              >
                <Image src={url} alt="Vehicle" fill className="object-contain p-1" sizes="128px" />
                <button
                  type="button"
                  onClick={() => removeImage(url)}
                  className="absolute right-1 top-1 bg-background/90 p-1 text-muted hover:text-foreground"
                  aria-label="Remove image"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
          <label className="inline-flex cursor-pointer items-center gap-2 border border-border px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-surface">
            <Upload className="h-4 w-4" />
            {uploading ? "Uploading..." : "Upload Image"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
              disabled={uploading}
            />
          </label>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
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
          <label className="flex items-center gap-3 pt-7 text-sm text-foreground">
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

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={submitting || uploading}>
            {submitting ? "Saving..." : isEditing ? "Update Vehicle" : "Create Vehicle"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/vehicles")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}
