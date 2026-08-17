import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, BedDouble, Ruler, Users } from "lucide-react";

import { EnquireCard } from "@/components/public/EnquireCard";
import { CmsImage } from "@/components/public/CmsImage";
import { JsonLd } from "@/components/public/JsonLd";
import { RoomCard } from "@/components/public/RoomCard";
import { Container } from "@/components/ui/Container";
import { MountainDivider } from "@/components/ui/SectionHeading";
import { db } from "@/lib/db";
import { formatNPR } from "@/lib/format";
import {
  absoluteImage,
  breadcrumbJsonLd,
  socialMetadata,
  url,
} from "@/lib/seo";

// ISR: cached for an hour, revalidated immediately by admin room edits.
export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const roomType = await db.roomType.findUnique({
    where: { slug },
    select: { name: true, description: true },
  });
  if (!roomType) return { title: "Room not found" };
  const title = `${roomType.name} — Baraha Hotel and Lodge, Bhedetar`;
  const description =
    roomType.description ??
    `Book the ${roomType.name} at Baraha Hotel and Lodge, a lodge in Bhedetar, Dhankuta.`;
  return {
    title,
    description,
    // og:image comes from the file-based opengraph-image.tsx in this folder.
    ...socialMetadata({ title, description, path: `/rooms/${slug}` }),
  };
}

export default async function PublicRoomDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [roomType, otherRooms] = await Promise.all([
    db.roomType.findUnique({
      where: { slug },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
      },
    }),
    db.roomType.findMany({
      where: { isActive: true, slug: { not: slug } },
      orderBy: { basePrice: "asc" },
      take: 3,
      include: {
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
      },
    }),
  ]);
  if (!roomType || !roomType.isActive) notFound();

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: roomType.name,
    description: roomType.description ?? undefined,
    image: absoluteImage(roomType.images[0]?.url),
    brand: { "@type": "Brand", name: "Baraha Hotel and Lodge" },
    offers: {
      "@type": "Offer",
      url: url(`/rooms/${roomType.slug}`),
      priceCurrency: "NPR",
      price: Number(roomType.basePrice),
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <div>
      <Container className="py-8 sm:py-12">
        <Link
          href="/rooms"
          className="inline-flex items-center gap-1.5 text-sm text-charcoal/60 transition-colors hover:text-pine"
        >
          <ArrowLeft className="size-4" /> All rooms
        </Link>

        <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div>
            <h1 className="font-display text-3xl leading-tight text-charcoal sm:text-4xl">
              {roomType.name}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-charcoal/70">
              <span className="flex items-center gap-1.5">
                <Users className="size-4 text-pine" /> Sleeps{" "}
                {roomType.maxOccupancy}
              </span>
              {roomType.sizeSqft ? (
                <span className="flex items-center gap-1.5">
                  <Ruler className="size-4 text-pine" /> {roomType.sizeSqft} sq
                  ft
                </span>
              ) : null}
              <span className="flex items-center gap-1.5 font-semibold text-pine">
                <BedDouble className="size-4" />{" "}
                {formatNPR(Number(roomType.basePrice))} / night
              </span>
            </div>
            <MountainDivider className="mt-4" />

            {roomType.images.length > 0 ? (
              <div className="mt-6 flex flex-col gap-3">
                <CmsImage
                  src={roomType.images[0]?.url}
                  alt={roomType.images[0]?.altText ?? roomType.name}
                  priority
                  sizes="(max-width: 1024px) 100vw, 65vw"
                  className="aspect-[16/9] w-full rounded-2xl border border-pine/15"
                />
                {roomType.images.length > 1 ? (
                  <div className="flex gap-3 overflow-x-auto pb-1">
                    {roomType.images.slice(1).map((img) => (
                      <CmsImage
                        key={img.id}
                        src={img.url}
                        alt={img.altText ?? ""}
                        sizes="144px"
                        className="h-24 w-36 shrink-0 rounded-xl border border-charcoal/10"
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="mt-6 flex aspect-[16/9] w-full items-center justify-center rounded-2xl bg-pine/10 text-pine">
                <BedDouble className="size-16" />
              </div>
            )}

            {roomType.description ? (
              <p className="mt-6 max-w-2xl leading-relaxed text-charcoal/75">
                {roomType.description}
              </p>
            ) : null}

            {roomType.amenities.length > 0 ? (
              <div className="mt-6">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-charcoal/50">
                  Amenities
                </h2>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {roomType.amenities.map((amenity) => (
                    <li
                      key={amenity}
                      className="rounded-full bg-pine/10 px-3 py-1 text-sm font-medium text-pine"
                    >
                      {amenity}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <EnquireCard />
          </aside>
        </div>

        {otherRooms.length > 0 ? (
          <div className="mt-16">
            <h2 className="font-display text-2xl text-charcoal">Other rooms</h2>
            <p className="mt-1 text-sm text-charcoal/60">
              See what else we have to offer.
            </p>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {otherRooms.map((room) => (
                <RoomCard
                  key={room.id}
                  room={{
                    slug: room.slug,
                    name: room.name,
                    description: room.description,
                    basePrice: Number(room.basePrice),
                    maxOccupancy: room.maxOccupancy,
                    sizeSqft: room.sizeSqft,
                    amenities: room.amenities,
                    imageUrl: room.images[0]?.url,
                    imageAlt: room.images[0]?.altText,
                  }}
                />
              ))}
            </div>
          </div>
        ) : null}
      </Container>

      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Rooms & Suites", path: "/rooms" },
            { name: roomType.name, path: `/rooms/${roomType.slug}` },
          ]),
          productJsonLd,
          {
            "@context": "https://schema.org",
            "@type": "LodgingBusiness",
            name: "Baraha Hotel and Lodge",
            address: {
              "@type": "PostalAddress",
              streetAddress: "Bhedetar, Dhankuta, Nepal",
              addressLocality: "Bhedetar",
              addressRegion: "Dhankuta",
              addressCountry: "NP",
            },
            geo: {
              "@type": "GeoCoordinates",
              latitude: 26.9357,
              longitude: 87.2822,
            },
            priceRange: `NPR ${Number(roomType.basePrice)} / night`,
          },
        ]}
      />
    </div>
  );
}
