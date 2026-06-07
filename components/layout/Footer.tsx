import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin } from "lucide-react";
import {
  CONTACT_INFO,
  NAV_LINKS,
  SITE_NAME,
  SITE_TAGLINE,
  SOCIAL_LINKS,
} from "@/lib/constants";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block transition-opacity hover:opacity-90">
              <div className="relative h-11 w-23">
                <Image
                  src="/logo.jpg"
                  alt="PV Motors Logo"
                  fill
                  className="object-contain"
                />
              </div>
            </Link>
            <p className="mt-2.5 text-[10px] font-bold uppercase tracking-[0.18em] text-foreground">
              Authorised Dealer of KOMAKI
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Premium KOMAKI electric vehicles. Expert guidance, transparent
              pricing, and dedicated after-sales support.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-foreground">
              Navigation
            </h3>
            <ul className="space-y-3">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted transition-colors duration-300 hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-foreground">
              Contact
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-muted">
                <Phone className="mt-0.5 h-4 w-4 shrink-0" />
                <a
                  href={`tel:${CONTACT_INFO.phone.replace(/\s/g, "")}`}
                  className="transition-colors hover:text-foreground"
                >
                  {CONTACT_INFO.phone}
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-muted">
                <Mail className="mt-0.5 h-4 w-4 shrink-0" />
                <a
                  href={`mailto:${CONTACT_INFO.email}`}
                  className="transition-colors hover:text-foreground"
                >
                  {CONTACT_INFO.email}
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-muted">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{CONTACT_INFO.address}</span>
              </li>
            </ul>
            <p className="mt-6 text-xs text-muted">{CONTACT_INFO.hours}</p>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-foreground">
              Our Location
            </h3>
            <div className="overflow-hidden border border-border bg-surface-elevated rounded-sm h-[140px] w-full relative">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3504.2811467475143!2d77.32095531508087!3d28.56887568244243!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce43764839cf9%3A0x6b7473788bdcdcf9!2sSector%2018%2C%20Noida%2C%20Uttar%20Pradesh!5e0!3m2!1sen!2sin!4v1654631234567!5m2!1sen!2sin"
                width="100%"
                height="140"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="PV Motors Location Map"
              ></iframe>
            </div>
            <div className="mt-4 flex gap-4">
              {SOCIAL_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted transition-colors duration-300 hover:text-foreground"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-xs text-muted">
            &copy; {currentYear} {SITE_NAME}. All rights reserved.
          </p>
          <p className="text-[10px] uppercase tracking-wider text-muted">
            Authorized KOMAKI EV Dealer
          </p>
        </div>
      </div>
    </footer>
  );
}

