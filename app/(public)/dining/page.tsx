import type { Metadata } from "next";
import { Utensils } from "lucide-react";

import { JsonLd } from "@/components/public/JsonLd";
import { PageHero } from "@/components/public/PageHero";
import { Container } from "@/components/ui/Container";
import { breadcrumbJsonLd, socialMetadata } from "@/lib/seo";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const title = "Dining";
  const description =
    "Dal bhat, gundruk soup, and Dhankuta specialities — home-style food at Baraha Hotel and Lodge.";

  return {
    title,
    description,
    ...socialMetadata({
      title,
      description,
      path: "/dining",
      image: "/images/food/dal-bhat.jpg",
    }),
  };
}

export default async function DiningPage() {
  return (
    <div>
      <PageHero
        title="Dining"
        subtitle="Food cooked the way we cook at home — dal bhat, gundruk soup, and Dhankuta specialities."
      />

      <Container className="py-12">
        <div className="flex flex-col gap-12">
          <section>
            <div className="flex items-center gap-3">
              <h2 className="font-display text-2xl text-charcoal">Our food</h2>
              <span className="h-px flex-1 bg-pine/15" />
            </div>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-charcoal/70">
              We serve simple, home-style meals made with local ingredients. Breakfast
              means sel roti and milk tea. Lunch and dinner feature dal bhat,
              gundruk soup, and seasonal vegetables. Ask us about packed trekking
              lunches and evening snacks.
            </p>
          </section>

          <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { name: "Dal Bhat", price: "NPR 350", desc: "Steamed rice with lentil soup, seasonal vegetables, and pickle." },
              { name: "Gundruk Soup", price: "NPR 400", desc: "Fermented leafy-green soup — a Dhankuta speciality." },
              { name: "Mutton Sekuwa", price: "NPR 650", desc: "Char-grilled marinated mutton served with chutney." },
              { name: "Masala Chai", price: "NPR 100", desc: "Spiced milk tea with aromatic masala." },
              { name: "Fresh Orange Juice", price: "NPR 250", desc: "Freshly squeezed local oranges." },
              { name: "Sel Roti", price: "NPR 120", desc: "Crisp ring-shaped rice doughnuts, warm from the pan." },
            ].map((item) => (
              <div
                key={item.name}
                className="flex gap-4 rounded-2xl border border-pine/15 bg-white p-4 shadow-[0_14px_32px_-16px_rgba(43,38,32,0.32)]"
              >
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-medium text-charcoal">{item.name}</h3>
                    <span className="shrink-0 font-semibold text-pine">{item.price}</span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-charcoal/60">{item.desc}</p>
                </div>
              </div>
            ))}
          </section>

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
