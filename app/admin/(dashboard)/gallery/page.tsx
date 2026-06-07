"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Plus, Trash2, Upload, Eye, EyeOff, ArrowUp, ArrowDown, Save, ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/Section";

type GalleryImageItem = {
  id: string;
  url: string;
  publicId: string | null;
  category: string;
  title: string | null;
  tagline: string | null;
  published: boolean;
  sequence: number;
};

const categories = ["Customer Delivery", "Vehicle Collection", "Showroom", "Events", "Reviews"];

export default function AdminGalleryPage() {
  const [images, setImages] = useState<GalleryImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filter category
  const [activeCategory, setActiveCategory] = useState<string>("all");

  // New Image Form state
  const [newUrl, setNewUrl] = useState("");
  const [newPublicId, setNewPublicId] = useState("");
  const [newCategory, setNewCategory] = useState("Showroom");
  const [newTitle, setNewTitle] = useState("");
  const [newTagline, setNewTagline] = useState("");
  const [newSequence, setNewSequence] = useState("0");

  // Set document title
  useEffect(() => {
    document.title = "Homepage Gallery Management — Admin";
  }, []);

  async function loadImages() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/gallery");
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Failed to load gallery images.");
        return;
      }
      setImages(data);
    } catch {
      setError("Failed to load gallery images.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadImages();
  }, []);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
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
        setError(data.error ?? "Upload failed.");
        return;
      }

      setNewUrl(data.url);
      setNewPublicId(data.publicId);
    } catch {
      setError("Upload failed.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newUrl) {
      setError("Please upload an image first.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const payload = {
      url: newUrl,
      publicId: newPublicId || null,
      category: newCategory,
      title: newTitle.trim() || null,
      tagline: newTagline.trim() || null,
      published: true,
      sequence: Number(newSequence || 0),
    };

    try {
      const response = await fetch("/api/admin/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Failed to save gallery entry.");
        return;
      }

      // Reset form
      setNewUrl("");
      setNewPublicId("");
      setNewTitle("");
      setNewTagline("");
      setNewSequence("0");
      
      // Reload list
      await loadImages();
    } catch {
      setError("Failed to save gallery entry.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this gallery image? This cannot be undone.")) return;

    setError(null);
    try {
      const response = await fetch(`/api/admin/gallery/${id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Failed to delete.");
        return;
      }
      setImages((current) => current.filter((item) => item.id !== id));
    } catch {
      setError("Failed to delete.");
    }
  }

  async function handleTogglePublish(id: string, currentPublished: boolean) {
    setError(null);
    try {
      const response = await fetch(`/api/admin/gallery/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !currentPublished }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Failed to update status.");
        return;
      }
      setImages((current) =>
        current.map((item) =>
          item.id === id ? { ...item, published: !currentPublished } : item
        )
      );
    } catch {
      setError("Failed to update status.");
    }
  }

  async function handleUpdateField(id: string, fields: Partial<GalleryImageItem>) {
    setError(null);
    try {
      const response = await fetch(`/api/admin/gallery/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Failed to update image details.");
        return;
      }
      setImages((current) =>
        current
          .map((item) => (item.id === id ? { ...item, ...fields } : item))
          .sort((a, b) => a.sequence - b.sequence)
      );
    } catch {
      setError("Failed to update image details.");
    }
  }

  async function handleMove(id: string, direction: "up" | "down") {
    // Filter active category items since move operates in visible list
    const visibleItems = images.filter(
      (item) => activeCategory === "all" || item.category === activeCategory
    );
    const currentIndex = visibleItems.findIndex((item) => item.id === id);
    if (currentIndex === -1) return;

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= visibleItems.length) return;

    const currentItem = visibleItems[currentIndex];
    const targetItem = visibleItems[targetIndex];

    const currentSeq = currentItem.sequence;
    const targetSeq = targetItem.sequence;

    let newCurrentSeq = targetSeq;
    let newTargetSeq = currentSeq;
    if (currentSeq === targetSeq) {
      newCurrentSeq = direction === "up" ? currentSeq - 1 : currentSeq + 1;
      newTargetSeq = currentSeq;
    }

    try {
      await Promise.all([
        fetch(`/api/admin/gallery/${currentItem.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sequence: newCurrentSeq }),
        }),
        fetch(`/api/admin/gallery/${targetItem.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sequence: newTargetSeq }),
        }),
      ]);
      await loadImages();
    } catch {
      setError("Failed to reorder images.");
    }
  }

  // Filter visible items
  const filteredImages = images.filter(
    (item) => activeCategory === "all" || item.category === activeCategory
  );

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <SectionHeader
        eyebrow="Admin"
        title="Showroom Gallery Management"
        description="Upload and customize images appearing in the public gallery. Sort by category and reorder for the homepage showcase."
        className="mb-0"
      />

      {/* Error Message */}
      {error && (
        <div className="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Grid: Form on left, Items List on right */}
      <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
        
        {/* Upload Form */}
        <Card className="h-fit">
          <h3 className="font-display text-lg font-semibold text-foreground mb-4">
            Upload New Showroom Image
          </h3>
          <form onSubmit={handleCreate} className="space-y-4">
            
            {/* Image Box */}
            <div className="relative aspect-[4/3] w-full overflow-hidden border border-dashed border-border bg-surface flex flex-col items-center justify-center text-muted">
              {newUrl ? (
                <>
                  <Image src={newUrl} alt="New upload preview" fill className="object-contain p-2" sizes="340px" />
                  <button
                    type="button"
                    onClick={() => {
                      setNewUrl("");
                      setNewPublicId("");
                    }}
                    className="absolute right-2 top-2 rounded-full bg-background/90 p-1.5 hover:text-foreground shadow"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <label className="flex flex-col items-center justify-center cursor-pointer p-6 text-center hover:bg-neutral-100 transition-colors w-full h-full">
                  <Upload className="h-8 w-8 text-neutral-400 mb-2" />
                  <span className="text-xs font-semibold text-foreground">
                    {uploading ? "Uploading file..." : "Click to Upload Image"}
                  </span>
                  <span className="text-[10px] text-neutral-400 mt-1 block">
                    Under 5 MB (WebP/PNG/JPG)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                </label>
              )}
            </div>

            {/* Category selection */}
            <Select
              label="Gallery Category"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              required
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </Select>

            {/* Optional Title & Tagline */}
            <Input
              label="Title (Optional)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Modern Commuting"
            />
            
            <Input
              label="Subtitle / Tagline (Optional)"
              value={newTagline}
              onChange={(e) => setNewTagline(e.target.value)}
              placeholder="e.g. Elegant design for cities."
            />

            <Input
              label="Sequence Order"
              type="number"
              min={0}
              value={newSequence}
              onChange={(e) => setNewSequence(e.target.value)}
            />

            <Button
              type="submit"
              className="w-full justify-center"
              disabled={submitting || uploading || !newUrl}
            >
              {submitting ? "Publishing..." : "Add to Gallery"}
            </Button>
          </form>
        </Card>

        {/* Gallery Items Panel */}
        <div className="space-y-6">
          
          {/* Category Filter Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-border pb-4">
            <button
              onClick={() => setActiveCategory("all")}
              className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all border ${
                activeCategory === "all"
                  ? "bg-black text-white border-black"
                  : "bg-background text-muted border-border hover:bg-surface hover:text-foreground"
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all border ${
                  activeCategory === cat
                    ? "bg-black text-white border-black"
                    : "bg-background text-muted border-border hover:bg-surface hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Loader */}
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="aspect-[4/3] w-full animate-pulse border border-border bg-surface/30" />
              ))}
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="border border-dashed border-border py-16 text-center">
              <ImageIcon className="mx-auto mb-4 h-8 w-8 text-neutral-400" />
              <p className="text-sm font-medium text-foreground">No images found</p>
              <p className="mt-1 text-xs text-muted">Upload images to this category to showcase them on the homepage.</p>
            </div>
          ) : (
            /* Images List */
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredImages.map((item, index) => (
                <Card
                  key={item.id}
                  className={`flex flex-col p-3 transition-all ${
                    !item.published ? "opacity-60 border-dashed border-neutral-300" : ""
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden border border-border bg-surface">
                    <Image src={item.url} alt={item.title ?? "Gallery"} fill className="object-cover" sizes="260px" />
                    
                    {/* Category overlay */}
                    <span className="absolute left-2 top-2 bg-black/70 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 border border-white/10 rounded">
                      {item.category}
                    </span>
                  </div>

                  {/* Fields editor */}
                  <div className="mt-3 flex-1 space-y-2">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <input
                          type="text"
                          defaultValue={item.title ?? ""}
                          onBlur={(e) => handleUpdateField(item.id, { title: e.target.value.trim() || null })}
                          className="w-full border-b border-border/80 py-0.5 text-xs font-semibold text-foreground focus:outline-none focus:border-black"
                          placeholder="Title"
                          title="Click to Edit Title"
                        />
                      </div>
                      <div className="w-14">
                        <input
                          type="number"
                          defaultValue={item.sequence}
                          onBlur={(e) => handleUpdateField(item.id, { sequence: Number(e.target.value || 0) })}
                          className="w-full border-b border-border/80 py-0.5 text-xs text-muted text-center focus:outline-none focus:border-black"
                          placeholder="Order"
                          title="Display Sequence"
                        />
                      </div>
                    </div>
                    <div>
                      <input
                        type="text"
                        defaultValue={item.tagline ?? ""}
                        onBlur={(e) => handleUpdateField(item.id, { tagline: e.target.value.trim() || null })}
                        className="w-full border-b border-border/60 py-0.5 text-[10px] text-muted focus:outline-none focus:border-black"
                        placeholder="Tagline / Description"
                        title="Click to Edit Subtitle"
                      />
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => handleMove(item.id, "up")}
                        disabled={index === 0}
                        className="p-1 border border-border text-muted hover:text-foreground disabled:opacity-30 rounded hover:bg-neutral-50"
                        title="Move Up"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMove(item.id, "down")}
                        disabled={index === filteredImages.length - 1}
                        className="p-1 border border-border text-muted hover:text-foreground disabled:opacity-30 rounded hover:bg-neutral-50"
                        title="Move Down"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleTogglePublish(item.id, item.published)}
                        className={`flex h-7 w-7 items-center justify-center border rounded transition-colors ${
                          item.published
                            ? "border-emerald-200 text-emerald-600 bg-emerald-50 hover:bg-emerald-100"
                            : "border-neutral-200 text-neutral-400 bg-neutral-50 hover:bg-neutral-100"
                        }`}
                        title={item.published ? "Published (Click to Hide)" : "Hidden (Click to Publish)"}
                      >
                        {item.published ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="flex h-7 w-7 items-center justify-center border border-red-100 text-red-500 bg-red-50 hover:bg-red-100 rounded transition-colors"
                        title="Delete Image"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
