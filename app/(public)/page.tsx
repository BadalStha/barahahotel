import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Mountain, Utensils, Wifi } from "lucide-react";

import { BookingWidget } from "@/components/public/BookingWidget";
import { CmsImage } from "@/components/public/CmsImage";
import { RoomCard } from "@/components/public/RoomCard";
import { TestimonialCarousel } from "@/components/public/TestimonialCarousel";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { db } from "@/lib/db";
import { getSetting, getSiteSettings } from "@/lib/settings";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const USP_ICONS = [Mountain, Utensils, Wifi];

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: getSetting(settings, "homepage_hero_title", "Baraha Hotel and Lodge"),
    description: getSetting(
      settings,
      "tagline",
      "A Himalayan hill-station retreat in Bhedetar, Dhankuta, Nepal.",
    ),
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Hotel",
    name: hotelName,
    description: str("tagline"),
    address: {
      "@type": "PostalAddress",
      addressLocality: str("location"),
    },
    telephone: str("phone"),
    email: str("email"),
    image: heroImage || undefined,
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative flex min-h-[520px] items-center overflow-hidden bg-pine text-stone lg:min-h-[600px]">
        <CmsImage
          src={heroImage}
          alt=""
          priority
          className="absolute inset-0 size-full object-cover"
          iconClassName="size-16"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-pine/80 via-pine/70 to-pine/85" />

        <Container className="relative z-10 py-16 lg:py-20">
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_380px]">
            <div className="flex max-w-2xl flex-col items-start gap-5">
              <p className="rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-saffron">
                Bhedetar · Dhankuta · Nepal
              </p>
              <h1 className="font-display text-4xl leading-tight sm:text-5xl lg:text-6xl">
                {str("homepage_hero_title", "Wake up to the Himalayas")}
              </h1>
              <p className="max-w-xl text-base leading-relaxed text-stone/85 sm:text-lg">
                {str(
                  "homepage_hero_subtitle",
                  "Quiet rooms, mountain views, and home-style food at a hill-station retreat in Bhedetar, Dhankuta.",
                )}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/booking"
                  className="inline-flex h-12 items-center gap-2 rounded-full bg-saffron px-7 text-sm font-semibold text-charcoal transition-colors hover:bg-saffron/90"
                >
                  Book a stay
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/rooms"
                  className="inline-flex h-12 items-center gap-2 rounded-full border border-white/30 px-7 text-sm font-semibold text-stone transition-colors hover:bg-white/10"
                >
                  Explore rooms
                </Link>
              </div>
            </div>

            <BookingWidget />
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
                    className="flex flex-col items-center gap-3 rounded-2xl border border-pine/15 bg-white p-7 text-center shadow-[0_14px_32px_-16px_rgba(43,38,32,0.32)]"
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
              title="Rooms & suites"
              subtitle="Simple, warm rooms with mountain air — pick the one that fits your stay."
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
              className="inline-flex h-11 items-center gap-2 rounded-full border border-pine/40 px-6 text-sm font-medium text-pine transition-colors hover:bg-pine/10"
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
                className="aspect-[4/3] w-full rounded-2xl border border-pine/15 object-cover shadow-[0_20px_40px_-16px_rgba(31,77,58,0.4)]"
                iconClassName="size-16"
              />
            </div>
            <div className="flex flex-col items-start gap-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta">
                A local favourite
              </p>
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
                className="mt-2 inline-flex h-11 items-center gap-2 rounded-full bg-pine px-6 text-sm font-medium text-stone transition-colors hover:bg-pine/90"
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
              title="What our guests say"
              subtitle="Real words from real stays."
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
          <div className="flex flex-col items-center gap-5 rounded-3xl bg-pine px-6 py-12 text-center text-stone shadow-[0_20px_40px_-16px_rgba(31,77,58,0.5)] sm:px-12">
            <h2 className="font-display text-3xl leading-tight sm:text-4xl">
              Ready for the hills?
            </h2>
            <p className="max-w-xl text-stone/80">
              Check live availability and reserve your room — no payment needed
              to book, we&apos;ll confirm by email.
            </p>
            <Link
              href="/booking"
              className="mt-2 inline-flex h-12 items-center gap-2 rounded-full bg-saffron px-8 text-sm font-semibold text-charcoal transition-colors hover:bg-saffron/90"
            >
              Book your stay
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </Container>
      </section>

      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  );
}
