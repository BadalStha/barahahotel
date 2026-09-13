import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Utensils } from "lucide-react";

import { JsonLd } from "@/components/public/JsonLd";
import { PageHero } from "@/components/public/PageHero";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { db } from "@/lib/db";
import { formatNPR } from "@/lib/format";
import { breadcrumbJsonLd, socialMetadata } from "@/lib/seo";
import { getSetting, getSiteSettings } from "@/lib/settings";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const [settings, firstFoodPhoto] = await Promise.all([
    getSiteSettings(),
    db.galleryImage.findFirst({
      where: { category: "Dining" },
      orderBy: { sortOrder: "asc" },
      select: { url: true },
    }),
  ]);
  const str = (key: string, fallback = "") => getSetting(settings, key, fallback);

  const title = `${str("dining_page_title", "Dining")} — Baraha Hotel and Lodge, Bhedetar`;
  const description =
    str(
      "dining_page_subtitle",
      "Dal bhat, gundruk soup, and Dhankuta specialities — home-style food at Baraha Hotel and Lodge.",
    ) || undefined;

  return {
    title,
    description,
    ...socialMetadata({
      title,
      description,
      path: "/dining",
      image:
        firstFoodPhoto?.url ||
        getSetting(settings, "homepage_hero_image") ||
        null,
    }),
  };
}

export default async function DiningPage() {
  const [settings, menuItems] = await Promise.all([
    getSiteSettings(),
    db.menuItem.findMany({
      where: { isAvailable: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
  ]);
  const str = (key: string, fallback = "") => getSetting(settings, key, fallback);

  // Group items by their free-text category, preserving sort order.
  const categories = new Map<string, typeof menuItems>();
  for (const item of menuItems) {
    const key = item.category?.trim() || "";
    const group = categories.get(key);
    if (group) {
      group.push(item);
    } else {
      categories.set(key, [item]);
    }
  }

  return (
    <div>
      <PageHero
        title={str("dining_page_title", "Dining")}
        subtitle={
          str(
            "dining_page_subtitle",
            "Food cooked the way we cook at home — dal bhat, gundruk soup, and Dhankuta specialities.",
          ) || undefined
        }
      />

      <Container className="py-12">
        <div className="flex flex-col gap-12">
          {str("dining_intro_title") || str("dining_intro_text") ? (
            <section>
              <div className="flex items-center gap-3">
                <h2 className="font-display text-2xl text-charcoal">
                  {str("dining_intro_title", "Our food")}
                </h2>
                <span className="h-px flex-1 bg-pine/15" />
              </div>
              <p className="mt-4 max-w-2xl whitespace-pre-line text-base leading-relaxed text-charcoal/70">
                {str("dining_intro_text")}
              </p>
            </section>
          ) : null}

          {menuItems.length > 0 ? (
            <section>
              <SectionHeading
                title={str("dining_menu_title", "Our menu")}
                align="left"
              />
              <div className="mt-6 flex flex-col gap-8">
                {[...categories.entries()].map(([category, items]) => (
                  <div key={category || "uncategorised"}>
                    {category ? (
                      <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-pine">
                        {category}
                      </h3>
                    ) : null}
                    <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="flex gap-4 rounded-2xl border border-pine/15 bg-white p-4 shadow-[0_14px_32px_-16px_rgba(43,38,32,0.32)]"
                        >
                          <div className="flex min-w-0 flex-1 flex-col">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-medium text-charcoal">{item.name}</h4>
                              <span className="shrink-0 font-semibold text-pine">
                                {formatNPR(Number(item.price))}
                              </span>
                            </div>
                            {item.description ? (
                              <p className="mt-1 text-xs leading-relaxed text-charcoal/60">
                                {item.description}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : (
            <section>
              <p className="py-10 text-center text-charcoal/50">
                Our menu is being updated — call or message us for today&apos;s dishes.
              </p>
            </section>
          )}

          {str("dining_cta_title") || str("dining_cta_text") ? (
            <div className="mx-auto flex max-w-xl flex-col items-center gap-3 rounded-2xl border border-pine/15 bg-pine/5 px-6 py-8 text-center">
              <Utensils className="size-8 text-pine" />
              <h2 className="font-display text-xl text-charcoal">
                {str("dining_cta_title", "Hungry outside menu hours?")}
              </h2>
              <p className="text-sm text-charcoal/70">
                {str("dining_cta_text")}
              </p>
              <Link
                href="/contact"
                className="mt-1 inline-flex h-11 items-center gap-2 rounded-md bg-pine px-6 text-sm font-medium text-stone transition-colors hover:bg-pine/90"
              >
                Enquire about dining
                <ArrowRight className="size-4" />
              </Link>
            </div>
          ) : null}
        </div>
      </Container>

      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Dining", path: "/dining" },
        ])}
      />
    </div>
  );
}
