import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";

import { ContactForm } from "@/components/public/ContactForm";
import { JsonLd } from "@/components/public/JsonLd";
import { PageHero } from "@/components/public/PageHero";
import { Container } from "@/components/ui/Container";
import { breadcrumbJsonLd, socialMetadata } from "@/lib/seo";
import { getSetting, getSiteSettings } from "@/lib/settings";

// ISR: cached for an hour, revalidated immediately by admin settings edits.
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const str = (key: string, fallback = "") => getSetting(settings, key, fallback);
  const title = str("contact_page_title", "Contact");
  const description =
    str(
      "contact_page_subtitle",
      "Get in touch with Baraha Hotel and Lodge in Bhedetar, Dhankuta — call, email, or send us a message.",
    ) || undefined;
  return {
    title,
    description,
    ...socialMetadata({
      title,
      description,
      path: "/contact",
      image: getSetting(settings, "homepage_hero_image") || null,
    }),
  };
}

export default async function ContactPage() {
  const settings = await getSiteSettings();
  const str = (key: string, fallback = "") => getSetting(settings, key, fallback);

  const location = str("location", "Bhedetar, Dhankuta, Nepal");
  const phone = str("phone");
  const email = str("email");
  const businessHours = str("business_hours");

  // Exact Google Maps listing for Baraha Hotel and Lodge.
  // Resolved from https://maps.app.goo.gl/k6vuVepioCLQKxSV7
  // → 26.8570158, 87.321886 (Bhedetar, Dhankuta).
  const mapsUrl = "https://maps.app.goo.gl/k6vuVepioCLQKxSV7";
  const mapSrc =
    "https://www.google.com/maps?q=26.8570158,87.321886+(Baraha+Hotel+and+Lodge)&z=18&output=embed";

  const details = [
    { icon: MapPin, label: "Address", value: location, href: mapsUrl },
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
        title={str("contact_page_title", "Contact us")}
        subtitle={
          str(
            "contact_page_subtitle",
            "Questions, requests, or just saying hello — we'd love to hear from you.",
          ) || undefined
        }
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
                        {...(href.startsWith("http")
                          ? {
                              target: "_blank",
                              rel: "noopener noreferrer",
                            }
                          : {})}
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
                {str("contact_form_title", "Send us a message")}
              </h2>
              <p className="mt-1 text-sm text-charcoal/60">
                {str("contact_form_text", "We usually reply within a day.")}
              </p>
              <div className="mt-5">
                <ContactForm />
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="flex flex-col overflow-hidden rounded-2xl border border-pine/15 bg-white shadow-[0_14px_32px_-16px_rgba(43,38,32,0.32)]">
            <iframe
              title={`Map of Baraha Hotel and Lodge — ${location}`}
              src={mapSrc}
              className="h-full min-h-[420px] w-full border-0 lg:min-h-[480px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-pine/15 p-4">
              <p className="text-sm font-medium text-charcoal/70">
                Baraha Hotel and Lodge — {location}
              </p>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-pine px-4 py-2 text-sm font-semibold text-cream transition-colors hover:bg-pine/90"
              >
                <MapPin className="size-4" />
                Get Directions
              </a>
            </div>
          </div>
        </div>
      </Container>

      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" },
        ])}
      />
    </div>
  );
}
