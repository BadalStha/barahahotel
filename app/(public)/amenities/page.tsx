import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";

import { BlocksRenderer } from "@/components/public/BlocksRenderer";
import { JsonLd } from "@/components/public/JsonLd";
import { PageHero } from "@/components/public/PageHero";
import { Container } from "@/components/ui/Container";
import { db } from "@/lib/db";
import { breadcrumbJsonLd, socialMetadata } from "@/lib/seo";
import { getSetting, getSiteSettings } from "@/lib/settings";
import type { ContentBlock } from "@/lib/validators/content";

// ISR: cached for an hour, revalidated immediately by admin content edits.
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const [page, settings] = await Promise.all([
    db.page.findUnique({ where: { slug: "amenities" } }),
    getSiteSettings(),
  ]);
  const title = page?.metaTitle ?? page?.title ?? "Amenities";
  const description = page?.metaDescription ?? undefined;
  return {
    title,
    description,
    ...socialMetadata({
      title,
      description,
      path: "/amenities",
      image: getSetting(settings, "homepage_hero_image") || null,
    }),
  };
}

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

      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Amenities", path: "/amenities" },
        ])}
      />
    </div>
  );
}
