import type { Metadata } from "next";
import { Utensils } from "lucide-react";

import { CmsImage } from "@/components/public/CmsImage";
import { PageHero } from "@/components/public/PageHero";
import { Container } from "@/components/ui/Container";
import { db } from "@/lib/db";
import { formatNPR } from "@/lib/format";
import { FOOD_CATEGORIES, FOOD_CATEGORY_LABELS } from "@/lib/validators/food";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dining",
  description:
    "Dal bhat, gundruk soup, and Dhankuta specialities — home-style food at Baraha Hotel and Lodge.",
};

export default async function DiningPage() {
  const items = await db.foodMenuItem.findMany({
    where: { isAvailable: true },
    orderBy: { name: "asc" },
  });

  const grouped = FOOD_CATEGORIES.map((category) => ({
    category,
    label: FOOD_CATEGORY_LABELS[category],
    items: items.filter((item) => item.category === category),
  })).filter((group) => group.items.length > 0);

  return (
    <div>
      <PageHero
        title="Dining"
        subtitle="Food cooked the way we cook at home — dal bhat, gundruk soup, and Dhankuta specialities."
      />

      <Container className="py-12">
        {grouped.length === 0 ? (
          <p className="py-16 text-center text-charcoal/50">
            Our menu is being refreshed — check back soon.
          </p>
        ) : (
          <div className="flex flex-col gap-12">
            {grouped.map(({ category, label, items }) => (
              <section key={category}>
                <div className="flex items-center gap-3">
                  <h2 className="font-display text-2xl text-charcoal">
                    {label}
                  </h2>
                  <span className="h-px flex-1 bg-pine/15" />
                  <span className="text-xs text-charcoal/50">
                    {items.length} item{items.length === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 rounded-2xl border border-pine/15 bg-white p-4 shadow-[0_14px_32px_-16px_rgba(43,38,32,0.32)] transition-all duration-300 hover:-translate-y-0.5"
                    >
                      <CmsImage
                        src={item.imageUrl}
                        alt={item.name}
                        className="size-20 shrink-0 rounded-xl object-cover"
                        iconClassName="size-7"
                      />
                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-medium text-charcoal">
                            {item.name}
                          </h3>
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
              </section>
            ))}

            <div className="mx-auto flex max-w-xl flex-col items-center gap-3 rounded-2xl border border-pine/15 bg-pine/5 px-6 py-8 text-center">
              <Utensils className="size-8 text-pine" />
              <h2 className="font-display text-xl text-charcoal">
                Hungry outside menu hours?
              </h2>
              <p className="text-sm text-charcoal/70">
                Ask our team about seasonal specials, packed treks lunches, and
                late-evening chiya.
              </p>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
