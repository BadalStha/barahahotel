import Link from "next/link";
import { Clock, Globe, Mail, MapPin, Mountain, Phone } from "lucide-react";

import { Container } from "@/components/ui/Container";

import { PUBLIC_NAV } from "./nav";

export type FooterSettings = {
  hotelName: string;
  tagline: string;
  location: string;
  phone: string;
  email: string;
  businessHours: string;
  socialFacebook: string;
  socialInstagram: string;
  socialTwitter: string;
  socialYoutube: string;
};

const SOCIALS: {
  key: keyof Pick<
    FooterSettings,
    "socialFacebook" | "socialInstagram" | "socialTwitter" | "socialYoutube"
  >;
  label: string;
}[] = [
  { key: "socialFacebook", label: "Facebook" },
  { key: "socialInstagram", label: "Instagram" },
  { key: "socialTwitter", label: "X (Twitter)" },
  { key: "socialYoutube", label: "YouTube" },
];

export function Footer({ settings }: { settings: FooterSettings }) {
  const socials = SOCIALS.filter((s) => settings[s.key]);

  return (
    <footer className="mt-16 border-t border-pine/10 bg-pine text-stone">
      <Container className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2">
            <Mountain className="size-5 text-saffron" />
            <p className="font-display text-base">{settings.hotelName}</p>
          </div>
          {settings.tagline ? (
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-stone/70">
              {settings.tagline}
            </p>
          ) : null}
          {socials.length > 0 ? (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {socials.map(({ key, label }) => (
                <a
                  key={key}
                  href={settings[key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-stone/80 transition-colors hover:bg-white/20 hover:text-white"
                >
                  <Globe className="size-3.5" />
                  {label}
                </a>
              ))}
            </div>
          ) : null}
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-stone/40">
            Contact
          </h3>
          <ul className="mt-3 space-y-2.5 text-sm text-stone/80">
            {settings.location ? (
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 size-4 shrink-0 text-saffron" />
                {settings.location}
              </li>
            ) : null}
            {settings.phone ? (
              <li className="flex items-center gap-2.5">
                <Phone className="size-4 shrink-0 text-saffron" />
                <a
                  href={`tel:${settings.phone.replace(/\s/g, "")}`}
                  className="transition-colors hover:text-white"
                >
                  {settings.phone}
                </a>
              </li>
            ) : null}
            {settings.email ? (
              <li className="flex items-center gap-2.5">
                <Mail className="size-4 shrink-0 text-saffron" />
                <a
                  href={`mailto:${settings.email}`}
                  className="transition-colors hover:text-white"
                >
                  {settings.email}
                </a>
              </li>
            ) : null}
            {settings.businessHours ? (
              <li className="flex items-start gap-2.5">
                <Clock className="mt-0.5 size-4 shrink-0 text-saffron" />
                {settings.businessHours}
              </li>
            ) : null}
          </ul>
        </div>

        {/* Quick links */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-stone/40">
            Explore
          </h3>
          <ul className="mt-3 grid grid-cols-2 gap-2.5 text-sm text-stone/80">
            {PUBLIC_NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="transition-colors hover:text-white"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <div className="flex flex-col items-start gap-4">
          <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-stone/40">
            Ready to visit?
          </h3>
          <p className="text-sm leading-relaxed text-stone/70">
            Call, WhatsApp, or email us to check availability and plan your stay.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-1.5 rounded-full bg-saffron px-5 py-2.5 text-sm font-semibold text-charcoal transition-colors hover:bg-saffron/90"
          >
            Enquire now
          </Link>
        </div>
      </Container>

      <div className="border-t border-white/10">
        <Container className="flex flex-wrap items-center justify-between gap-2 py-5 text-xs text-stone/50">
          <p>
            © {new Date().getFullYear()} {settings.hotelName}. All rights
            reserved.
          </p>
          <Link
            href="/admin/login"
            className="transition-colors hover:text-stone/80"
          >
            Admin
          </Link>
        </Container>
      </div>
    </footer>
  );
}
