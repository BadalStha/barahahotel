import { GalleryManager } from "@/components/admin/gallery/GalleryManager";
import { db } from "@/lib/db";

export default async function AdminGalleryPage() {
  const images = await db.galleryImage.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-2xl text-charcoal sm:text-3xl">Gallery</h1>
        <p className="mt-1 text-sm text-charcoal/60">
          {images.length} photo{images.length === 1 ? "" : "s"} — upload, tag, and
          reorder what guests see.
        </p>
      </header>

      <GalleryManager
        images={images.map((image) => ({
          id: image.id,
          url: image.url,
          altText: image.altText,
          category: image.category,
        }))}
      />
    </div>
  );
}
