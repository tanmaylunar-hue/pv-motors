"use client";

import { useEffect, useMemo, useState } from "react";
import { MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Input";
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
  message: string;
  preferredTime: string;
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
  message: "",
  preferredTime: "",
};

export function ContactForm() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [vehicles, setVehicles] = useState<VehicleOption[]>([]);
  const [previousEnquiries, setPreviousEnquiries] = useState<any[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedEnquiry, setSubmittedEnquiry] = useState<any | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("previous_enquiries");
    if (saved) {
      try {
        setPreviousEnquiries(JSON.parse(saved));
      } catch {
        // ignore
      }
    }

    async function loadOptions() {
      try {
        const response = await fetch("/api/enquiries/options");
        const data = await response.json();
        if (response.ok && Array.isArray(data.vehicles)) {
          setVehicles(data.vehicles);

          const params = new URLSearchParams(window.location.search);
          const qVehicle = params.get("vehicle");
          const qVariant = params.get("variant");
          const qAction = params.get("action");

          let matchedVehicle = null;
          let matchedVariantId = "";
          let matchedVariantName = "";

          if (qVehicle) {
            matchedVehicle = data.vehicles.find(
              (v: any) => v.name.toLowerCase() === qVehicle.toLowerCase()
            );
            if (matchedVehicle && qVariant) {
              const mv = matchedVehicle.variants.find(
                (v: any) => v.name.toLowerCase() === qVariant.toLowerCase()
              );
              if (mv) {
                matchedVariantId = mv.id ?? "";
                matchedVariantName = mv.name;
              }
            }
          }

          let prefilledMessage = "";
          let prefilledPreferredTime = "";
          if (qAction === "callback") {
            prefilledMessage = `Please call me back to discuss the ${qVehicle || ""} ${qVariant || ""}.`;
            prefilledPreferredTime = "Anytime";
          } else if (qAction === "test-ride") {
            prefilledMessage = `I'd like to book a test ride for the ${qVehicle || ""} ${qVariant || ""}.`;
            prefilledPreferredTime = "Evening (4 PM - 7 PM)";
          } else if (qAction === "enquire") {
            prefilledMessage = `I am interested in the ${qVehicle || ""} ${qVariant || ""} and would like more details.`;
            prefilledPreferredTime = "Anytime";
          }

          setForm((current) => ({
            ...current,
            vehicleName: matchedVehicle ? matchedVehicle.name : current.vehicleName,
            variantName: matchedVariantName || current.variantName,
            variantId: matchedVariantId || current.variantId,
            message: prefilledMessage || current.message,
            preferredTime: prefilledPreferredTime || current.preferredTime,
          }));
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

    const params = new URLSearchParams(window.location.search);
    const source = params.get("action") || "website";

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
          message: form.message.trim() || undefined,
          preferredTime: form.preferredTime || undefined,
          source,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setSubmitError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setSubmitted(true);
      setSubmittedEnquiry(data.enquiry);
      setWhatsappUrl(data.whatsappUrl ?? null);

      const newEnquiryRecord = {
        id: data.enquiry.id,
        name: form.name.trim(),
        phone: normalizePhone(form.phone),
        vehicleName: form.vehicleName,
        variantName: form.variantName,
        status: data.enquiry.status ?? "new",
        createdAt: data.enquiry.createdAt || new Date().toISOString(),
      };

      const savedList = localStorage.getItem("previous_enquiries");
      let currentList = [];
      if (savedList) {
        try {
          currentList = JSON.parse(savedList);
        } catch {
          // ignore
        }
      }
      const updatedList = [newEnquiryRecord, ...currentList];
      setPreviousEnquiries(updatedList);
      localStorage.setItem("previous_enquiries", JSON.stringify(updatedList));

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
    setSubmittedEnquiry(null);
    setWhatsappUrl(null);
    setErrors({});
    setSubmitError(null);
  }

  if (submitted && submittedEnquiry) {
    const responseTime =
      submittedEnquiry.preferredTime && submittedEnquiry.preferredTime !== "Anytime"
        ? `During your preferred slot (${submittedEnquiry.preferredTime})`
        : "Under 2 hours";

    return (
      <Card className="text-center">
        <div className="py-8">
          <div className="mx-auto mb-6 relative h-16 w-16">
            <img
              src="/emblem.png"
              alt="PV Motors Logo"
              className="h-full w-full object-contain"
            />
          </div>
          <h3 className="font-display text-xl font-medium text-foreground">
            Enquiry Submitted Successfully
          </h3>
          <p className="mt-2 text-sm text-muted">
            Thank you for choosing PV Motors. We have received your booking enquiry.
          </p>
          
          <div className="my-6 p-5 border border-border bg-surface-elevated/40 text-left max-w-sm mx-auto space-y-3">
            <div className="flex justify-between items-baseline text-xs border-b border-border/50 pb-2">
              <span className="text-muted uppercase tracking-wider font-semibold">Enquiry ID</span>
              <span className="font-mono text-foreground font-semibold select-all">{submittedEnquiry.id}</span>
            </div>
            <div className="flex justify-between items-baseline text-xs border-b border-border/50 pb-2">
              <span className="text-muted uppercase tracking-wider font-semibold">Expected Response</span>
              <span className="text-foreground font-semibold">{responseTime}</span>
            </div>
            <div className="flex justify-between items-baseline text-xs">
              <span className="text-muted uppercase tracking-wider font-semibold">Email Confirmation</span>
              <span className="text-emerald-500 font-semibold font-mono">Logged & Queued</span>
            </div>
          </div>

          {whatsappUrl && (
            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => window.open(whatsappUrl, "_blank", "noopener,noreferrer")}
              >
                <MessageCircle className="h-4 w-4" />
                Send via WhatsApp
              </Button>
              <Button variant="outline" onClick={handleReset}>
                Submit Another
              </Button>
            </div>
          )}
          {!whatsappUrl && (
            <Button variant="outline" className="mt-3" onClick={handleReset}>
              Submit Another Enquiry
            </Button>
          )}
        </div>
      </Card>
    );
  }

  return (
    <>
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

          <Select
            label="Preferred Contact Time (Optional)"
            name="preferredTime"
            value={form.preferredTime}
            onChange={(e) => updateField("preferredTime", e.target.value)}
          >
            <option value="">Anytime</option>
            <option value="Morning (9 AM - 12 PM)">Morning (9 AM - 12 PM)</option>
            <option value="Afternoon (12 PM - 4 PM)">Afternoon (12 PM - 4 PM)</option>
            <option value="Evening (4 PM - 7 PM)">Evening (4 PM - 7 PM)</option>
          </Select>

          <Textarea
            label="Message (Optional)"
            name="message"
            placeholder="Type your message here..."
            value={form.message}
            onChange={(e) => updateField("message", e.target.value)}
            rows={4}
          />

          {submitError && <p className="text-sm text-red-400">{submitError}</p>}

          <Button type="submit" className="w-full sm:w-auto" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Enquiry"}
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </Card>

      {previousEnquiries.length > 0 && (
        <div className="mt-8 space-y-4">
          <h3 className="font-display text-lg font-medium text-foreground">
            Your Recent Enquiries
          </h3>
          <div className="grid gap-4">
            {previousEnquiries.map((enq) => (
              <div
                key={enq.id}
                className="flex items-center gap-4 border border-border bg-surface p-4 transition-colors hover:border-foreground/20"
              >
                {/* Brand Logo Emblem */}
                <div className="relative h-11 w-11 shrink-0 border border-border bg-background p-1.5 rounded-sm">
                  <img
                    src="/emblem.png"
                    alt="PV Motors Logo"
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <p className="font-semibold text-foreground truncate">
                        {enq.vehicleName}{" "}
                        <span className="font-normal text-muted text-xs">
                          — {enq.variantName}
                        </span>
                      </p>
                      <p className="text-xs text-muted mt-1">
                        Submitted on{" "}
                        {new Date(enq.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-center">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          enq.status === "new"
                            ? "bg-emerald-500"
                            : enq.status === "contacted"
                            ? "bg-blue-500"
                            : enq.status === "interested"
                            ? "bg-indigo-500"
                            : enq.status === "negotiation"
                            ? "bg-purple-500"
                            : enq.status === "booked"
                            ? "bg-teal-500"
                            : enq.status === "closed"
                            ? "bg-zinc-500"
                            : "bg-amber-500"
                        }`}
                      />
                      <span className="text-xs font-semibold capitalize text-foreground">
                        {enq.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
