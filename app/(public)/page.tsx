import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Mountain, Utensils, Wifi } from "lucide-react";

import { CmsImage } from "@/components/public/CmsImage";
import { EnquireCard } from "@/components/public/EnquireCard";
import { JsonLd } from "@/components/public/JsonLd";
import { RoomCard } from "@/components/public/RoomCard";
import { TestimonialCarousel } from "@/components/public/TestimonialCarousel";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { db } from "@/lib/db";
import { getSetting, getSiteSettings } from "@/lib/settings";
import { lodgingBusinessJsonLd, socialMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

// ISR: cached for an hour, revalidated immediately by admin save actions
// (revalidatePublicSite) and in the background every 3600s.
export const revalidate = 3600;

const USP_ICONS = [Mountain, Utensils, Wifi];

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const title = getSetting(
    settings,
    "homepage_hero_title",
    "Baraha Hotel and Lodge",
  );
  const description = getSetting(
    settings,
    "tagline",
    "Baraha Hotel and Lodge — a hill-station hotel in Bhedetar, Dhankuta, Nepal with mountain views, home-style food, free WiFi and hot water.",
  );
  return {
    title: `${title} — Hotel in Bhedetar, Dhankuta, Nepal`,
    description,
    ...socialMetadata({
      title: `${title} — Hotel in Bhedetar, Dhankuta, Nepal`,
      description,
      path: "/",
      image: getSetting(settings, "homepage_hero_image") || null,
    }),
  };
}

export default async function Home() {
  const settings = await getSiteSettings();
  const str = (key: string, fallback = "") => getSetting(settings, key, fallback);

  const [featuredRooms, testimonials] = await Promise.all([
    db.roomType.findMany({
      where: { isActive: true },
      orderBy: { basePrice: "asc" },
      take: 3,
      include: {
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
      },
    }),
    db.testimonial.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  const hotelName = str("hotel_name", "Baraha Hotel and Lodge");
  const heroImage = str("homepage_hero_image");
  const usps = ([1, 2, 3] as const)
    .map((n) => ({
      title: str(`homepage_usp_${n}_title`),
      text: str(`homepage_usp_${n}_text`),
    }))
    .filter((usp) => usp.title || usp.text);

  // AggregateRating is computed from real published testimonials only —
  // never fabricated. Omitted entirely until the first review exists.
  const aggregateRating =
    testimonials.length > 0
      ? {
          ratingValue:
            Math.round(
              (testimonials.reduce((sum, t) => sum + t.rating, 0) /
                testimonials.length) *
                10,
            ) / 10,
          reviewCount: testimonials.length,
        }
      : null;

  const jsonLd = lodgingBusinessJsonLd({
    name: hotelName,
    description: str("tagline"),
    telephone: str("phone"),
    email: str("email"),
    image: heroImage,
    priceRange: featuredRooms[0]
      ? `NPR ${Number(featuredRooms[0].basePrice)} / night`
      : undefined,
    streetAddress: str("location"),
    aggregateRating,
  });

  return (
    <div>
      {/* Hero */}
      <section className="relative flex min-h-[520px] items-center overflow-hidden bg-pine text-stone lg:min-h-[600px]">
        <CmsImage
          src={heroImage}
          alt=""
          priority
          sizes="100vw"
          className="absolute inset-0 size-full"
          iconClassName="size-16"
        />
        <div className="absolute inset-0 bg-pine/75" />

        <Container className="relative z-10 py-16 lg:py-20">
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_380px]">
            <div className="flex max-w-2xl flex-col items-start gap-5">
              <h1 className="font-display text-4xl leading-tight sm:text-5xl lg:text-6xl">
                {str("homepage_hero_title", "Wake up to the Himalayas in Bhedetar")}
              </h1>
              <p className="max-w-xl text-base leading-relaxed text-stone/85 sm:text-lg">
                {str(
                  "homepage_hero_subtitle",
                  "Quiet rooms, mountain views, and home-style food at a hill-station retreat in Bhedetar, Dhankuta.",
                )}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/rooms"
                  className="inline-flex h-12 items-center gap-2 rounded-md bg-saffron px-7 text-sm font-semibold text-charcoal transition-colors hover:bg-saffron/90"
                >
                  View rooms
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex h-12 items-center gap-2 rounded-md border border-white/30 px-7 text-sm font-semibold text-stone transition-colors hover:bg-white/10"
                >
                  Enquire now
                </Link>
              </div>
            </div>

            <EnquireCard />
          </div>
        </Container>
      </section>

      {/* USP */}
      {usps.length > 0 ? (
        <section className="py-16 sm:py-20">
          <Container>
            <SectionHeading
              title={str("homepage_usp_title", "Why stay at Baraha")}
              subtitle={str("homepage_usp_subtitle") || undefined}
            />
            <div
              className={cn(
                "mt-10 grid gap-5",
                usps.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3",
              )}
            >
              {usps.map((usp, i) => {
                const Icon = USP_ICONS[i % USP_ICONS.length];
                return (
                  <div
                    key={i}
                    className="flex flex-col items-center gap-3 border border-pine/15 bg-white p-7 text-center shadow-sm"
                  >
                    <span className="flex size-12 items-center justify-center rounded-xl bg-pine/10 text-pine">
                      <Icon className="size-6" />
                    </span>
                    <h3 className="font-display text-xl text-charcoal">
                      {usp.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-charcoal/70">
                      {usp.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </Container>
        </section>
      ) : null}

      {/* Featured rooms */}
      <section className="border-y border-pine/10 bg-pine/5 py-16 sm:py-20">
        <Container>
          <div className="flex flex-col items-center gap-2 text-center">
            <SectionHeading
              title={str("homepage_rooms_title", "Rooms & suites")}
              subtitle={
                str(
                  "homepage_rooms_subtitle",
                  "Simple, warm rooms with mountain air — pick the one that fits your stay.",
                ) || undefined
              }
            />
          </div>
          {featuredRooms.length === 0 ? (
            <p className="py-10 text-center text-charcoal/50">
              Rooms are being prepared — check back soon.
            </p>
          ) : (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredRooms.map((room) => (
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
          )}
          <div className="mt-8 text-center">
            <Link
              href="/rooms"
              className="inline-flex h-11 items-center gap-2 rounded-md border border-pine/40 px-6 text-sm font-medium text-pine transition-colors hover:bg-pine/10"
            >
              View all rooms
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </Container>
      </section>

      {/* Viewpoint highlight */}
      <section className="py-16 sm:py-20">
        <Container>
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div className="relative">
              <CmsImage
                src={str("homepage_viewpoint_image")}
                alt={str("homepage_viewpoint_title")}
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="aspect-[4/3] w-full rounded-2xl border border-pine/15"
                iconClassName="size-16"
              />
            </div>
            <div className="flex flex-col items-start gap-4">
              {str("homepage_viewpoint_label") ? (
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta">
                  {str("homepage_viewpoint_label")}
                </p>
              ) : null}
              <h2 className="font-display text-3xl leading-tight text-charcoal sm:text-4xl">
                {str("homepage_viewpoint_title", "The Bhedetar viewpoint")}
              </h2>
              <p className="max-w-xl leading-relaxed text-charcoal/75">
                {str(
                  "homepage_viewpoint_text",
                  "Ten minutes from the hotel, the Bhedetar viewpoint drops away to the Terai plains below — bring a camera and a cup of chiya.",
                )}
              </p>
              <Link
                href="/contact"
                className="mt-2 inline-flex h-11 items-center gap-2 rounded-md bg-pine px-6 text-sm font-medium text-stone transition-colors hover:bg-pine/90"
              >
                Plan your visit
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 ? (
        <section className="border-y border-pine/10 bg-pine/5 py-16 sm:py-20">
          <Container>
            <SectionHeading
              title={str("homepage_testimonials_title", "What our guests say")}
              subtitle={
                str("homepage_testimonials_subtitle", "Real words from real stays.") ||
                undefined
              }
            />
            <div className="mt-10">
              <TestimonialCarousel
                testimonials={testimonials.map((t) => ({
                  id: t.id,
                  guestName: t.guestName,
                  quote: t.quote,
                  rating: t.rating,
                }))}
              />
            </div>
          </Container>
        </section>
      ) : null}

      {/* CTA banner */}
      <section className="py-16 sm:py-20">
        <Container>
          <div className="flex flex-col items-center gap-5 border border-pine bg-pine px-6 py-12 text-center text-stone shadow-sm sm:px-12">
            <h2 className="font-display text-3xl leading-tight sm:text-4xl">
              {str("homepage_cta_title", "Ready for the hills?")}
            </h2>
            <p className="max-w-xl text-stone/80">
              {str(
                "homepage_cta_text",
                "Call, WhatsApp, or email us to check availability and plan your stay.",
              )}
            </p>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/contact"
                className="inline-flex h-12 items-center gap-2 rounded-md bg-saffron px-8 text-sm font-semibold text-charcoal transition-colors hover:bg-saffron/90"
              >
                Enquire now
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Structured data */}
      <JsonLd data={jsonLd} />
    </div>
  );
}
