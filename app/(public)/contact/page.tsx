import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";

import { ContactForm } from "@/components/public/ContactForm";
import { PageHero } from "@/components/public/PageHero";
import { Container } from "@/components/ui/Container";
import { getSetting, getSiteSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Baraha Hotel and Lodge in Bhedetar, Dhankuta — call, email, or send us a message.",
};

export default async function ContactPage() {
  const settings = await getSiteSettings();
  const str = (key: string, fallback = "") => getSetting(settings, key, fallback);

  const location = str("location", "Bhedetar, Dhankuta, Nepal");
  const phone = str("phone");
  const email = str("email");
  const businessHours = str("business_hours");

  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(location)}&output=embed`;

  const details = [
    { icon: MapPin, label: "Address", value: location, href: undefined },
    phone
      ? {
          icon: Phone,
          label: "Phone",
          value: phone,
          href: `tel:${phone.replace(/\s/g, "")}`,
        }
      : null,
    email
      ? { icon: Mail, label: "Email", value: email, href: `mailto:${email}` }
      : null,
    businessHours
      ? { icon: Clock, label: "Hours", value: businessHours, href: undefined }
      : null,
  ].filter(Boolean) as {
    icon: typeof MapPin;
    label: string;
    value: string;
    href?: string;
  }[];

  return (
    <div>
      <PageHero
        title="Contact us"
        subtitle="Questions, requests, or just saying hello — we'd love to hear from you."
      />

      <Container className="py-12">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Contact details + form */}
          <div className="flex flex-col gap-8">
            <div className="grid gap-4 sm:grid-cols-2">
              {details.map(({ icon: Icon, label, value, href }) => (
                <div
                  key={label}
                  className="flex items-start gap-3 rounded-2xl border border-pine/15 bg-white p-4 shadow-[0_14px_32px_-16px_rgba(43,38,32,0.32)]"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-pine/10 text-pine">
                    <Icon className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-charcoal/50">
                      {label}
                    </p>
                    {href ? (
                      <a
                        href={href}
                        className="mt-0.5 block break-words text-sm font-medium text-charcoal transition-colors hover:text-pine"
                      >
                        {value}
                      </a>
                    ) : (
                      <p className="mt-0.5 text-sm font-medium text-charcoal">
                        {value}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-pine/15 bg-white p-6 shadow-[0_14px_32px_-16px_rgba(43,38,32,0.32)] sm:p-8">
              <h2 className="font-display text-2xl text-charcoal">
                Send us a message
              </h2>
              <p className="mt-1 text-sm text-charcoal/60">
                We usually reply within a day.
              </p>
              <div className="mt-5">
                <ContactForm />
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="overflow-hidden rounded-2xl border border-pine/15 shadow-[0_14px_32px_-16px_rgba(43,38,32,0.32)]">
            <iframe
              title={`Map of ${location}`}
              src={mapSrc}
              className="h-full min-h-[420px] w-full border-0 lg:min-h-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </div>
      </Container>
    </div>
  );
}
