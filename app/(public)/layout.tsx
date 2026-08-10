import type { Metadata } from "next";

import { Footer } from "@/components/public/Footer";
import { Header } from "@/components/public/Header";
import { getSetting, getSiteSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "Baraha Hotel and Lodge — Bhedetar, Dhankuta",
    template: "%s — Baraha Hotel and Lodge",
  },
  description:
    "A Himalayan hill-station retreat in Bhedetar, Dhankuta, Nepal — quiet rooms, mountain views, and home-style food.",
};

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
