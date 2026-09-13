import type { Metadata } from "next";

import { GalleryGrid } from "@/components/public/GalleryGrid";
import { JsonLd } from "@/components/public/JsonLd";
import { PageHero } from "@/components/public/PageHero";
import { Container } from "@/components/ui/Container";
import { db } from "@/lib/db";
import { breadcrumbJsonLd, socialMetadata } from "@/lib/seo";
import { getSetting, getSiteSettings } from "@/lib/settings";

// ISR: cached for an hour, revalidated immediately by admin gallery edits.
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const [firstPhoto, settings] = await Promise.all([
    db.galleryImage.findFirst({
      orderBy: { sortOrder: "asc" },
      select: { url: true },
    }),
    getSiteSettings(),
  ]);
  const str = (key: string, fallback = "") => getSetting(settings, key, fallback);

  const title = str("gallery_page_title", "Gallery");
  const description =
    str(
      "gallery_page_subtitle",
      "Photos of Baraha Hotel and Lodge — rooms, dining, and the Dhankuta hills.",
    ) || undefined;

  return {
    title,
    description,
    ...socialMetadata({
      title,
      description,
      path: "/gallery",
      image:
        firstPhoto?.url || getSetting(settings, "homepage_hero_image") || null,
    }),
  };
}

export default async function GalleryPage() {
  const [photos, settings] = await Promise.all([
    db.galleryImage.findMany({
      orderBy: { sortOrder: "asc" },
    }),
    getSiteSettings(),
  ]);
  const str = (key: string, fallback = "") => getSetting(settings, key, fallback);

  return (
    <div>
      <PageHero
        title={str("gallery_page_title", "Gallery")}
        subtitle={
          str(
            "gallery_page_subtitle",
            "A glimpse of the hotel, the food, and the hills around Bhedetar.",
          ) || undefined
        }
      />

      <Container className="py-12">
        <GalleryGrid
          photos={photos.map((photo) => ({
            id: photo.id,
            url: photo.url,
            altText: photo.altText,
            category: photo.category,
          }))}
        />
      </Container>

      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Gallery", path: "/gallery" },
        ])}
      />
    </div>
  );
}
