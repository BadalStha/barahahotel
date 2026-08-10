import type { Metadata } from "next";

import { GalleryGrid } from "@/components/public/GalleryGrid";
import { PageHero } from "@/components/public/PageHero";
import { Container } from "@/components/ui/Container";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Photos of Baraha Hotel and Lodge — rooms, dining, and the Dhankuta hills.",
};

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
    </div>
  );
}
