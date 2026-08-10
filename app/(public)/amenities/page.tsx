import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";

import { BlocksRenderer } from "@/components/public/BlocksRenderer";
import { PageHero } from "@/components/public/PageHero";
import { Container } from "@/components/ui/Container";
import { db } from "@/lib/db";
import type { ContentBlock } from "@/lib/validators/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Amenities",
  description:
    "Rooms, dining, WiFi, and more — see what's included with your stay at Baraha Hotel and Lodge.",
};

export default async function AmenitiesPage() {
  const page = await db.page.findUnique({ where: { slug: "amenities" } });
  if (!page) notFound();

  const blocks = Array.isArray(page.content) ? page.content : [];

  // Union of amenities offered across active room types — "in every room".
  const roomTypes = await db.roomType.findMany({
    where: { isActive: true },
    select: { amenities: true },
  });
  const roomAmenities = [...new Set(roomTypes.flatMap((r) => r.amenities))];

  return (
    <div>
      <PageHero
        title={page.title}
        subtitle={
          page.metaDescription ?? "Everything included with your stay."
        }
      />

      <Container className="py-12">
        {blocks.length > 0 ? (
          <BlocksRenderer blocks={blocks as ContentBlock[]} className="mx-auto max-w-3xl" />
        ) : (
          <p className="py-10 text-center text-charcoal/50">
            This page is being written — check back soon.
          </p>
        )}

        {roomAmenities.length > 0 ? (
          <div className="mx-auto mt-12 max-w-3xl">
            <h2 className="font-display text-2xl text-charcoal">
              In every room
            </h2>
            <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {roomAmenities.map((amenity) => (
                <li
                  key={amenity}
                  className="flex items-center gap-2.5 text-sm text-charcoal/75"
                >
                  <CheckCircle2 className="size-4 shrink-0 text-pine" />
                  {amenity}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </Container>
    </div>
  );
}
