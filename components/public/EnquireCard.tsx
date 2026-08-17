import { Phone, Mail } from "lucide-react";

import { getSiteSettings } from "@/lib/settings";
import { cn } from "@/lib/utils";

type EnquireCardProps = {
  className?: string;
};

export async function EnquireCard({ className }: EnquireCardProps) {
  const settings = await getSiteSettings();
  const phone = typeof settings.phone === "string" ? settings.phone : "";
  const email = typeof settings.email === "string" ? settings.email : "";
  const whatsapp = phone.replace(/[^0-9+]/g, "");

  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-2xl border border-pine/15 bg-white p-5 shadow-[0_14px_32px_-16px_rgba(43,38,32,0.32)]",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <Mail className="size-5 text-pine" />
        <h3 className="font-display text-lg text-charcoal">Enquire</h3>
      </div>
      <p className="text-sm text-charcoal/70">
        Call, WhatsApp, or email us to check availability and plan your stay.
      </p>
      <div className="flex flex-col gap-2.5">
        {phone ? (
          <a
            href={`tel:${phone.replace(/\s/g, "")}`}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-pine px-5 text-sm font-medium text-stone transition-colors hover:bg-pine/90"
          >
            <Phone className="size-4" />
            Call now
          </a>
        ) : null}
        {whatsapp ? (
          <a
            href={`https://wa.me/${whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-pine/40 px-5 text-sm font-medium text-pine transition-colors hover:bg-pine/10"
          >
            <Phone className="size-4" />
            WhatsApp
          </a>
        ) : null}
        {email ? (
          <a
            href={`mailto:${email}`}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-charcoal/15 px-5 text-sm font-medium text-charcoal transition-colors hover:bg-charcoal/5"
          >
            <Mail className="size-4" />
            Email us
          </a>
        ) : null}
      </div>
    </div>
  );
}
