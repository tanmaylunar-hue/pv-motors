"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <Card className="text-center">
        <div className="py-8">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center border border-border">
            <Send className="h-5 w-5 text-foreground" />
          </div>
          <h3 className="font-display text-xl font-medium text-foreground">
            Message Sent
          </h3>
          <p className="mt-2 text-sm text-muted">
            Our team will contact you within 24 hours.
          </p>
          <Button
            variant="outline"
            className="mt-6"
            onClick={() => setSubmitted(false)}
          >
            Send Another
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Input label="Full Name" name="name" placeholder="John Doe" required />
          <Input
            label="Phone"
            name="phone"
            type="tel"
            placeholder="+91 98765 43210"
            required
          />
        </div>
        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="john@example.com"
          required
        />
        <Input label="Model" name="model" placeholder="KOMAKI Ranger" />
        <Textarea
          label="Message"
          name="message"
          rows={4}
          placeholder="I'd like to book a test ride..."
          required
        />
        <Button type="submit" className="w-full sm:w-auto">
          Send Message
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </Card>
  );
}
