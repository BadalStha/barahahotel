import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { SettingsForm } from "@/components/admin/content/SettingsForm";
import {
  DEFAULT_TAX_RATE,
  getSetting,
  getSiteSettings,
} from "@/lib/settings";

export default async function AdminContentSettingsPage() {
  const settings = await getSiteSettings();

  const str = (key: string, fallback = "") => getSetting(settings, key, fallback);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div>
        <Link
          href="/admin/content"
          className="inline-flex items-center gap-1.5 text-sm text-charcoal/60 transition-colors hover:text-pine"
        >
          <ArrowLeft className="size-4" />
          Content
        </Link>
        <h1 className="mt-2 font-display text-2xl text-charcoal sm:text-3xl">
          Site settings
        </h1>
        <p className="mt-1 text-sm text-charcoal/60">
          These power the public site, invoices, and contact details.
        </p>
      </div>

      <div className="rounded-xl border border-charcoal/10 bg-white p-6 shadow-sm sm:p-8">
        <SettingsForm
          settings={{
            hotelName: str("hotel_name", "Baraha Hotel and Lodge"),
            tagline: str("tagline"),
            location: str("location"),
            phone: str("phone"),
            email: str("email"),
            socialFacebook: str("social_facebook"),
            socialInstagram: str("social_instagram"),
            socialTwitter: str("social_twitter"),
            socialYoutube: str("social_youtube"),
            businessHours: str("business_hours"),
            checkInTime: str("check_in_time"),
            checkOutTime: str("check_out_time"),
            taxRate:
              typeof settings.invoice_tax_rate === "number"
                ? String(settings.invoice_tax_rate)
                : String(DEFAULT_TAX_RATE),
            heroTitle: str("homepage_hero_title"),
            heroSubtitle: str("homepage_hero_subtitle"),
            heroImage: str("homepage_hero_image"),
            uspTitle: str("homepage_usp_title"),
            uspSubtitle: str("homepage_usp_subtitle"),
            usp1Title: str("homepage_usp_1_title"),
            usp1Text: str("homepage_usp_1_text"),
            usp2Title: str("homepage_usp_2_title"),
            usp2Text: str("homepage_usp_2_text"),
            usp3Title: str("homepage_usp_3_title"),
            usp3Text: str("homepage_usp_3_text"),
            viewpointTitle: str("homepage_viewpoint_title"),
            viewpointText: str("homepage_viewpoint_text"),
            viewpointImage: str("homepage_viewpoint_image"),
          }}
        />
      </div>
    </div>
  );
}
