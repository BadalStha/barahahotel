import type { Metadata } from "next";

import { GalleryGrid } from "@/components/public/GalleryGrid";
import { JsonLd } from "@/components/public/JsonLd";
import { PageHero } from "@/components/public/PageHero";
import { Container } from "@/components/ui/Container";
import { db } from "@/lib/db";
import { breadcrumbJsonLd, socialMetadata } from "@/lib/seo";

// ISR: cached for an hour, revalidated immediately by admin gallery edits.
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const firstPhoto = await db.galleryImage.findFirst({
    orderBy: { sortOrder: "asc" },
    select: { url: true },
  });

  const title = "Gallery";
  const description =
    "Photos of Baraha Hotel and Lodge — rooms, dining, and the Dhankuta hills.";

  return {
    title,
    description,
    ...socialMetadata({
      title,
      description,
      path: "/gallery",
      image: firstPhoto?.url,
    }),
  };
}

export default async function GalleryPage() {
  const photos = await db.galleryImage.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div>
      <PageHero
        title="Gallery"
        subtitle="A glimpse of the hotel, the food, and the hills around Bhedetar."
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
