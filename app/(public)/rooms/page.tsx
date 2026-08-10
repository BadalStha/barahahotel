import Link from "next/link";
import { BedDouble, Users } from "lucide-react";

import { Container } from "@/components/ui/Container";
import { MountainDivider } from "@/components/ui/SectionHeading";
import { db } from "@/lib/db";
import { formatNPR } from "@/lib/format";

export const metadata = {
  title: "Rooms & Suites — Baraha Hotel and Lodge",
  description:
    "Standard, deluxe and family rooms at Baraha Hotel and Lodge in Bhedetar, Dhankuta — prices per night, max occupancy and amenities.",
};

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
      <section className="border-b border-pine/10 bg-pine/5 py-14 sm:py-20">
        <Container className="flex flex-col items-center text-center">
          <h1 className="font-display text-4xl leading-tight text-charcoal sm:text-5xl">
            Rooms &amp; suites
          </h1>
          <p className="mt-3 max-w-xl text-charcoal/70">
            Simple, warm rooms with mountain air and hill-station quiet — pick
            the one that fits your stay.
          </p>
          <MountainDivider className="mt-4" />
        </Container>
      </section>

      <Container className="py-12">
        {roomTypes.length === 0 ? (
          <p className="py-16 text-center text-charcoal/50">
            Rooms are being prepared — check back soon.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {roomTypes.map((roomType) => (
              <Link
                key={roomType.id}
                href={`/rooms/${roomType.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-pine/15 bg-white shadow-[0_14px_32px_-16px_rgba(43,38,32,0.32)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-16px_rgba(31,77,58,0.4)]"
              >
                {roomType.images[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={roomType.images[0].url}
                    alt={roomType.images[0].altText ?? roomType.name}
                    className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-48 w-full items-center justify-center bg-pine/10 text-pine">
                    <BedDouble className="size-12" />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="font-display text-xl text-charcoal">
                      {roomType.name}
                    </h2>
                    <p className="shrink-0 text-right">
                      <span className="text-lg font-semibold text-pine">
                        {formatNPR(Number(roomType.basePrice))}
                      </span>
                      <span className="block text-xs text-charcoal/50">
                        / night
                      </span>
                    </p>
                  </div>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-charcoal/60">
                    <Users className="size-4" />
                    Sleeps {roomType.maxOccupancy}
                    {roomType.sizeSqft ? ` · ${roomType.sizeSqft} sq ft` : ""}
                  </p>
                  {roomType.amenities.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {roomType.amenities.slice(0, 3).map((amenity) => (
                        <span
                          key={amenity}
                          className="rounded-full bg-pine/10 px-2.5 py-0.5 text-xs font-medium text-pine"
                        >
                          {amenity}
                        </span>
                      ))}
                      {roomType.amenities.length > 3 ? (
                        <span className="rounded-full bg-stone px-2.5 py-0.5 text-xs text-charcoal/50">
                          +{roomType.amenities.length - 3} more
                        </span>
                      ) : null}
                    </div>
                  ) : null}
                  <span className="mt-4 inline-flex w-fit items-center gap-1 rounded-full bg-pine px-4 py-2 text-sm font-medium text-stone transition-colors group-hover:bg-pine/90">
                    View room
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
