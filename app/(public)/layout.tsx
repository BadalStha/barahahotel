import type { Metadata } from "next";

import { Footer } from "@/components/public/Footer";
import { Header } from "@/components/public/Header";
import { getSetting, getSiteSettings } from "@/lib/settings";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Baraha Hotel and Lodge — Bhedetar, Dhankuta",
    template: "%s — Baraha Hotel and Lodge",
  },
  description:
    "A Himalayan hill-station retreat in Bhedetar, Dhankuta, Nepal — quiet rooms, mountain views, and home-style food.",
  openGraph: {
    type: "website",
    siteName: "Baraha Hotel and Lodge",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The layout is rendered as part of each ISR page (build-time prerender
  // + hourly revalidation); admin edits reach it immediately via
  // revalidatePublicSite() in the server actions.
  const settings = await getSiteSettings();
  const str = (key: string, fallback = "") => getSetting(settings, key, fallback);

  const hotelName = str("hotel_name", "Baraha Hotel and Lodge");

  return (
    <div className="flex min-h-screen flex-col bg-stone text-charcoal">
      <Header hotelName={hotelName} />
      <main className="flex-1">{children}</main>
      <Footer
        settings={{
          hotelName,
          tagline: str("tagline"),
          location: str("location"),
          phone: str("phone"),
          email: str("email"),
          businessHours: str("business_hours"),
          socialFacebook: str("social_facebook"),
          socialInstagram: str("social_instagram"),
          socialTwitter: str("social_twitter"),
          socialYoutube: str("social_youtube"),
        }}
      />
    </div>
  );
}
