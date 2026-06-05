import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { CONTACT_INFO } from "@/lib/constants";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";

const items = [
  { icon: Phone, label: "Phone", value: CONTACT_INFO.phone, href: `tel:${CONTACT_INFO.phone.replace(/\s/g, "")}` },
  { icon: Mail, label: "Email", value: CONTACT_INFO.email, href: `mailto:${CONTACT_INFO.email}` },
  { icon: MapPin, label: "Address", value: CONTACT_INFO.address },
  { icon: Clock, label: "Hours", value: CONTACT_INFO.hours },
];

export function ContactInfo() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Get in Touch</CardTitle>
      </CardHeader>
      <ul className="space-y-5">
        {items.map((item) => (
          <li key={item.label} className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent">
              <item.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{item.label}</p>
              {item.href ? (
                <a href={item.href} className="text-sm text-muted hover:text-accent transition-colors">
                  {item.value}
                </a>
              ) : (
                <p className="text-sm text-muted">{item.value}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
