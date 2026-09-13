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
            heroBadge: str("homepage_hero_badge"),
            uspTitle: str("homepage_usp_title"),
            uspSubtitle: str("homepage_usp_subtitle"),
            usp1Title: str("homepage_usp_1_title"),
            usp1Text: str("homepage_usp_1_text"),
            usp2Title: str("homepage_usp_2_title"),
            usp2Text: str("homepage_usp_2_text"),
            usp3Title: str("homepage_usp_3_title"),
            usp3Text: str("homepage_usp_3_text"),
            viewpointLabel: str("homepage_viewpoint_label"),
            viewpointTitle: str("homepage_viewpoint_title"),
            viewpointText: str("homepage_viewpoint_text"),
            viewpointImage: str("homepage_viewpoint_image"),
            homeRoomsTitle: str("homepage_rooms_title", "Rooms & suites"),
            homeRoomsSubtitle: str(
              "homepage_rooms_subtitle",
              "Simple, warm rooms with mountain air — pick the one that fits your stay.",
            ),
            homeTestimonialsTitle: str(
              "homepage_testimonials_title",
              "What our guests say",
            ),
            homeTestimonialsSubtitle: str(
              "homepage_testimonials_subtitle",
              "Real words from real stays.",
            ),
            homeCtaTitle: str("homepage_cta_title", "Ready for the hills?"),
            homeCtaText: str(
              "homepage_cta_text",
              "Call, WhatsApp, or email us to check availability and plan your stay.",
            ),
            roomsTitle: str("rooms_page_title", "Rooms & suites"),
            roomsSubtitle: str(
              "rooms_page_subtitle",
              "Simple, warm rooms with mountain air and hill-station quiet — pick the one that fits your stay.",
            ),
            diningTitle: str("dining_page_title", "Dining"),
            diningSubtitle: str(
              "dining_page_subtitle",
              "Food cooked the way we cook at home — dal bhat, gundruk soup, and Dhankuta specialities.",
            ),
            galleryTitle: str("gallery_page_title", "Gallery"),
            gallerySubtitle: str(
              "gallery_page_subtitle",
              "A glimpse of the hotel, the food, and the hills around Bhedetar.",
            ),
            blogTitle: str("blog_page_title", "From the hills"),
            blogSubtitle: str(
              "blog_page_subtitle",
              "Travel notes, food stories, and tips from around Bhedetar and Dhankuta.",
            ),
            contactTitle: str("contact_page_title", "Contact us"),
            contactSubtitle: str(
              "contact_page_subtitle",
              "Questions, requests, or just saying hello — we'd love to hear from you.",
            ),
            contactFormTitle: str("contact_form_title", "Send us a message"),
            contactFormText: str("contact_form_text", "We usually reply within a day."),
            diningIntroTitle: str("dining_intro_title", "Our food"),
            diningIntroText: str(
              "dining_intro_text",
              "We serve simple, home-style meals made with local ingredients. Breakfast means sel roti and milk tea. Lunch and dinner feature dal bhat, gundruk soup, and seasonal vegetables. Ask us about packed trekking lunches and evening snacks.",
            ),
            diningMenuTitle: str("dining_menu_title", "Our menu"),
            diningCtaTitle: str("dining_cta_title", "Hungry outside menu hours?"),
            diningCtaText: str(
              "dining_cta_text",
              "Ask our team about seasonal specials, packed treks lunches, and late-evening chiya.",
            ),
          }}
        />
      </div>
    </div>
  );
}
