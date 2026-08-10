import Link from "next/link";
import type { FoodCategory } from "@prisma/client";
import { Pencil, Plus, Utensils } from "lucide-react";

import { AvailabilityToggle } from "@/components/admin/food-menu/AvailabilityToggle";
import { ConfirmButton } from "@/components/admin/rooms/ConfirmButton";
import { db } from "@/lib/db";
import { formatNPR } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  FOOD_CATEGORIES,
  FOOD_CATEGORY_LABELS,
} from "@/lib/validators/food";
import { deleteFoodMenuItemAction } from "./actions";

const CATEGORY_CHIP: Record<FoodCategory, string> = {
  BREAKFAST: "bg-saffron/20 text-charcoal",
  LUNCH: "bg-pine/10 text-pine",
  DINNER: "bg-terracotta/10 text-terracotta",
  SNACKS: "bg-mist text-charcoal/70",
  BEVERAGES: "bg-pine/10 text-pine",
};

export default async function AdminFoodMenuPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const categoryParam = typeof params.category === "string" ? params.category : "";
  const category = FOOD_CATEGORIES.includes(categoryParam as FoodCategory)
    ? (categoryParam as FoodCategory)
    : undefined;

  const items = await db.foodMenuItem.findMany({
    where: category ? { category } : {},
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-charcoal sm:text-3xl">
            Food menu
          </h1>
          <p className="mt-1 text-sm text-charcoal/60">
            {items.length} item{items.length === 1 ? "" : "s"}
            {category ? ` in ${FOOD_CATEGORY_LABELS[category]}` : ""}
          </p>
        </div>
        <Link
          href="/admin/food-menu/new"
          className="inline-flex h-11 items-center gap-2 rounded-full bg-pine px-5 text-sm font-medium text-stone shadow-[0_10px_20px_-10px_rgba(31,77,58,0.6)] transition-colors hover:bg-pine/90"
        >
          <Plus className="size-4" />
          New menu item
        </Link>
      </header>

      {/* Category filter */}
      <div className="flex flex-wrap gap-1.5">
        {[undefined, ...FOOD_CATEGORIES].map((c) => {
          const href = c
            ? `/admin/food-menu?category=${c}`
            : "/admin/food-menu";
          return (
            <Link
              key={c ?? "all"}
              href={href}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                category === c
                  ? "bg-pine text-stone"
                  : "bg-white text-charcoal/70 ring-1 ring-charcoal/10 hover:bg-charcoal/5",
              )}
            >
              {c ? FOOD_CATEGORY_LABELS[c] : "All"}
            </Link>
          );
        })}
      </div>

      <div className="overflow-x-auto rounded-xl border border-charcoal/10 bg-white shadow-sm">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-charcoal/10 text-xs uppercase tracking-wider text-charcoal/50">
            <tr>
              <th className="px-5 py-3 font-semibold">Item</th>
              <th className="px-5 py-3 font-semibold">Category</th>
              <th className="px-5 py-3 font-semibold">Price</th>
              <th className="px-5 py-3 font-semibold">Available</th>
              <th className="px-5 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal/5">
            {items.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-12 text-center text-sm text-charcoal/50"
                >
                  {category
                    ? `No ${FOOD_CATEGORY_LABELS[category].toLowerCase()} items yet.`
                    : "No menu items yet — add your first dish."}
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr
                  key={item.id}
                  className={cn(
                    "transition-colors hover:bg-stone/50",
                    !item.isAvailable && "opacity-60",
                  )}
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {item.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.imageUrl}
                          alt=""
                          className="size-11 shrink-0 rounded-lg border border-charcoal/10 object-cover"
                        />
                      ) : (
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-pine/10 text-pine">
                          <Utensils className="size-5" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-charcoal">{item.name}</p>
                        {item.description ? (
                          <p className="max-w-64 truncate text-xs text-charcoal/50">
                            {item.description}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                        CATEGORY_CHIP[item.category],
                      )}
                    >
                      {FOOD_CATEGORY_LABELS[item.category]}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-medium text-charcoal">
                    {formatNPR(Number(item.price))}
                  </td>
                  <td className="px-5 py-3">
                    <AvailabilityToggle
                      id={item.id}
                      isAvailable={item.isAvailable}
                    />
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/food-menu/${item.id}/edit`}
                        className="inline-flex h-9 items-center gap-2 rounded-lg border border-charcoal/15 px-3 text-sm font-medium text-charcoal/70 transition-colors hover:bg-charcoal/5"
                      >
                        <Pencil className="size-4" />
                        Edit
                      </Link>
                      <ConfirmButton
                        description={`Delete "${item.name}" from the menu?`}
                        onConfirm={deleteFoodMenuItemAction.bind(null, item.id)}
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
