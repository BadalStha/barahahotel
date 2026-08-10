import type { Metadata } from "next";

import { JsonLd } from "@/components/public/JsonLd";
import { PageHero } from "@/components/public/PageHero";
import { RoomCard } from "@/components/public/RoomCard";
import { Container } from "@/components/ui/Container";
import { db } from "@/lib/db";
import { breadcrumbJsonLd, socialMetadata } from "@/lib/seo";

// ISR: cached for an hour, revalidated immediately by admin room edits.
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const firstRoom = await db.roomType.findFirst({
    where: { isActive: true },
    orderBy: { basePrice: "asc" },
    select: {
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
    },
  });

  const title = "Rooms & Suites";
  const description =
    "Standard, deluxe and family rooms at Baraha Hotel and Lodge in Bhedetar, Dhankuta — prices per night, max occupancy and amenities.";

  return {
    title,
    description,
    ...socialMetadata({
      title,
      description,
      path: "/rooms",
      image: firstRoom?.images[0]?.url,
    }),
  };
}

export default async function PublicRoomsPage() {
  const roomTypes = await db.roomType.findMany({
    where: { isActive: true },
    orderBy: { basePrice: "asc" },
    include: {
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
    },
  });

  return (
    <div>
      <PageHero
        title="Rooms & suites"
        subtitle="Simple, warm rooms with mountain air and hill-station quiet — pick the one that fits your stay."
      />

      <Container className="py-12">
        {roomTypes.length === 0 ? (
          <p className="py-16 text-center text-charcoal/50">
            Rooms are being prepared — check back soon.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {roomTypes.map((roomType) => (
              <RoomCard
                key={roomType.id}
                room={{
                  slug: roomType.slug,
                  name: roomType.name,
                  description: roomType.description,
                  basePrice: Number(roomType.basePrice),
                  maxOccupancy: roomType.maxOccupancy,
                  sizeSqft: roomType.sizeSqft,
                  amenities: roomType.amenities,
                  imageUrl: roomType.images[0]?.url,
                  imageAlt: roomType.images[0]?.altText,
                }}
              />
            ))}
          </div>
        )}
      </Container>

      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Rooms & Suites", path: "/rooms" },
        ])}
      />
    </div>
  );
}
