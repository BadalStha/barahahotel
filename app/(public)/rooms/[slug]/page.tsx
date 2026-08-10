import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, BedDouble, Ruler, Users } from "lucide-react";

import { BookingWidget } from "@/components/public/BookingWidget";
import { Container } from "@/components/ui/Container";
import { MountainDivider } from "@/components/ui/SectionHeading";
import { db } from "@/lib/db";
import { formatNPR } from "@/lib/format";

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
  return {
    title: `${roomType.name} — Baraha Hotel and Lodge`,
    description:
      roomType.description ??
      `Book the ${roomType.name} at Baraha Hotel and Lodge, Bhedetar, Dhankuta.`,
  };
}

export default async function PublicRoomDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const roomType = await db.roomType.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
    },
  });
  if (!roomType || !roomType.isActive) notFound();

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
                <BedDouble className="size-4" /> {formatNPR(Number(roomType.basePrice))} / night
              </span>
            </div>
            <MountainDivider className="mt-4" />

            {roomType.images.length > 0 ? (
              <div className="mt-6 flex flex-col gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={roomType.images[0].url}
                  alt={roomType.images[0].altText ?? roomType.name}
                  className="aspect-[16/9] w-full rounded-2xl border border-pine/15 object-cover shadow-[0_14px_32px_-16px_rgba(43,38,32,0.35)]"
                />
                {roomType.images.length > 1 ? (
                  <div className="flex gap-3 overflow-x-auto pb-1">
                    {roomType.images.slice(1).map((img) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={img.id}
                        src={img.url}
                        alt={img.altText ?? ""}
                        className="h-24 w-36 shrink-0 rounded-xl border border-charcoal/10 object-cover"
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
            <BookingWidget
              roomTypeSlug={roomType.slug}
              roomTypeName={roomType.name}
              basePrice={Number(roomType.basePrice)}
              maxOccupancy={roomType.maxOccupancy}
            />
            <p className="mt-3 text-center text-xs text-charcoal/50">
              No payment needed to reserve — we&apos;ll confirm by email.
            </p>
          </aside>
        </div>
      </Container>
    </div>
  );
}
