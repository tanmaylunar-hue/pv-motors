"use client";

import { useEffect, useMemo, useState } from "react";
import { MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { isValidPhone, normalizePhone } from "@/lib/enquiry";

type VariantOption = {
  id?: string;
  name: string;
};

type VehicleOption = {
  id?: string;
  name: string;
  variants: VariantOption[];
};

type FormState = {
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  vehicleName: string;
  variantName: string;
  variantId: string;
};

const initialForm: FormState = {
  name: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  vehicleName: "",
  variantName: "",
  variantId: "",
};

export function ContactForm() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [vehicles, setVehicles] = useState<VehicleOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOptions() {
      try {
        const response = await fetch("/api/enquiries/options");
        const data = await response.json();
        if (response.ok && Array.isArray(data.vehicles)) {
          setVehicles(data.vehicles);
        }
      } catch {
        setSubmitError("Could not load vehicle options. Please refresh and try again.");
      } finally {
        setLoadingOptions(false);
      }
    }

    loadOptions();
  }, []);

  const selectedVehicle = useMemo(
    () => vehicles.find((vehicle) => vehicle.name === form.vehicleName),
    [vehicles, form.vehicleName]
  );

  const variantOptions = selectedVehicle?.variants ?? [];

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setSubmitError(null);
  }

  function validate(): Partial<Record<keyof FormState, string>> {
    const nextErrors: Partial<Record<keyof FormState, string>> = {};

    if (!form.name.trim()) nextErrors.name = "Name is required.";
    if (!isValidPhone(form.phone)) {
      nextErrors.phone = "Enter a valid 10-digit mobile number.";
    }
    if (!form.address.trim()) nextErrors.address = "Address is required.";
    if (!form.city.trim()) nextErrors.city = "City is required.";
    if (!form.state.trim()) nextErrors.state = "State is required.";
    if (!form.vehicleName) nextErrors.vehicleName = "Select a vehicle.";
    if (!form.variantName) nextErrors.variantName = "Select a variant.";

    return nextErrors;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          phone: normalizePhone(form.phone),
          address: form.address.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          vehicleName: form.vehicleName,
          variantName: form.variantName,
          variantId: form.variantId || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setSubmitError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setSubmitted(true);
      setWhatsappUrl(data.whatsappUrl ?? null);

      if (data.whatsappUrl) {
        window.open(data.whatsappUrl, "_blank", "noopener,noreferrer");
      }
    } catch {
      setSubmitError("Could not submit enquiry. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleReset() {
    setForm(initialForm);
    setSubmitted(false);
    setWhatsappUrl(null);
    setErrors({});
    setSubmitError(null);
  }

  if (submitted) {
    return (
      <Card className="text-center">
        <div className="py-8">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center border border-border">
            <Send className="h-5 w-5 text-foreground" />
          </div>
          <h3 className="font-display text-xl font-medium text-foreground">
            Enquiry Submitted
          </h3>
          <p className="mt-2 text-sm text-muted">
            Our team will contact you within 24 hours.
          </p>
          {whatsappUrl && (
            <Button
              variant="outline"
              className="mt-6"
              onClick={() => window.open(whatsappUrl, "_blank", "noopener,noreferrer")}
            >
              <MessageCircle className="h-4 w-4" />
              Send via WhatsApp
            </Button>
          )}
          <Button variant="outline" className="mt-3" onClick={handleReset}>
            Submit Another Enquiry
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Name"
          name="name"
          placeholder="Rahul Sharma"
          value={form.name}
          onChange={(e) => updateField("name", e.target.value)}
          error={errors.name}
          required
        />

        <Input
          label="Phone"
          name="phone"
          type="tel"
          inputMode="numeric"
          maxLength={10}
          placeholder="9876543210"
          value={form.phone}
          onChange={(e) => updateField("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
          error={errors.phone}
          required
        />

        <Input
          label="Address"
          name="address"
          placeholder="House no., street, locality"
          value={form.address}
          onChange={(e) => updateField("address", e.target.value)}
          error={errors.address}
          required
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="City"
            name="city"
            placeholder="Noida"
            value={form.city}
            onChange={(e) => updateField("city", e.target.value)}
            error={errors.city}
            required
          />
          <Input
            label="State"
            name="state"
            placeholder="Uttar Pradesh"
            value={form.state}
            onChange={(e) => updateField("state", e.target.value)}
            error={errors.state}
            required
          />
        </div>

        <Select
          label="Vehicle"
          name="vehicleName"
          value={form.vehicleName}
          onChange={(e) => {
            updateField("vehicleName", e.target.value);
            updateField("variantName", "");
            updateField("variantId", "");
          }}
          error={errors.vehicleName}
          disabled={loadingOptions}
          required
        >
          <option value="">
            {loadingOptions ? "Loading vehicles..." : "Select a vehicle"}
          </option>
          {vehicles.map((vehicle) => (
            <option key={vehicle.id ?? vehicle.name} value={vehicle.name}>
              {vehicle.name}
            </option>
          ))}
        </Select>

        <Select
          label="Variant"
          name="variantName"
          value={form.variantName}
          onChange={(e) => {
            const variant = variantOptions.find((item) => item.name === e.target.value);
            updateField("variantName", e.target.value);
            updateField("variantId", variant?.id ?? "");
          }}
          error={errors.variantName}
          disabled={!form.vehicleName || loadingOptions}
          required
        >
          <option value="">
            {form.vehicleName ? "Select a variant" : "Select a vehicle first"}
          </option>
          {variantOptions.map((variant) => (
            <option key={variant.id ?? variant.name} value={variant.name}>
              {variant.name}
            </option>
          ))}
        </Select>

        {submitError && <p className="text-sm text-red-400">{submitError}</p>}

        <Button type="submit" className="w-full sm:w-auto" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit Enquiry"}
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </Card>
  );
}
