"use client";

import type { FoodCategory } from "@prisma/client";
import { useState, useTransition } from "react";
import { Minus, Plus, Search, ShoppingBag, Utensils } from "lucide-react";

import { createFoodOrderAction } from "@/app/admin/bookings/actions";
import { Field, inputClass } from "@/components/admin/fields";
import { cn } from "@/lib/utils";
import {
  FOOD_CATEGORIES,
  FOOD_CATEGORY_LABELS,
} from "@/lib/validators/food";
import { formatNPR } from "@/lib/format";

export type MenuItemOption = {
  id: string;
  name: string;
  category: FoodCategory;
  price: number;
  isAvailable: boolean;
  imageUrl: string | null;
};

const CATEGORY_TINT: Record<FoodCategory, string> = {
  BREAKFAST: "bg-saffron/20 text-charcoal",
  LUNCH: "bg-pine/10 text-pine",
  DINNER: "bg-terracotta/10 text-terracotta",
  SNACKS: "bg-mist text-charcoal/70",
  BEVERAGES: "bg-pine/10 text-pine",
};

export function AddFoodOrderForm({
  bookingId,
  menuItems,
}: {
  bookingId: string;
  menuItems: MenuItemOption[];
}) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<FoodCategory | "ALL">("ALL");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const cart = menuItems.filter((item) => (quantities[item.id] ?? 0) > 0);
  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price * (quantities[item.id] ?? 0),
    0,
  );
  const cartCount = cart.reduce((sum, item) => sum + (quantities[item.id] ?? 0), 0);

  const filtered = menuItems.filter((item) => {
    if (category !== "ALL" && item.category !== category) return false;
    if (query.trim() && !item.name.toLowerCase().includes(query.trim().toLowerCase()))
      return false;
    return true;
  });

  function setQuantity(id: string, next: number) {
    setQuantities((prev) => {
      const copy = { ...prev };
      if (next <= 0) delete copy[id];
      else copy[id] = next;
      return copy;
    });
  }

  function placeOrder() {
    const items = cart.map((item) => ({
      foodMenuItemId: item.id,
      quantity: quantities[item.id] ?? 1,
    }));
    setError(null);
    startTransition(async () => {
      try {
        const result = await createFoodOrderAction(bookingId, { items, notes });
        if (result?.error) setError(result.error);
      } catch (caught) {
        const digest = (caught as { digest?: string } | null)?.digest;
        if (!digest?.startsWith("NEXT_REDIRECT")) {
          console.error("Placing order failed:", caught);
          setError("Something went wrong. Please try again.");
        }
      }
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      {/* Menu picker */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-52 flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-charcoal/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search the menu…"
              className={cn(inputClass, "pl-10")}
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(["ALL", ...FOOD_CATEGORIES] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  category === c
                    ? "bg-pine text-stone"
                    : "bg-white text-charcoal/70 ring-1 ring-charcoal/10 hover:bg-charcoal/5",
                )}
              >
                {c === "ALL" ? "All" : FOOD_CATEGORY_LABELS[c]}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="rounded-xl border border-charcoal/10 bg-white px-5 py-10 text-center text-sm text-charcoal/50">
            No menu items match — try a different search or category.
          </p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {filtered.map((item) => {
              const qty = quantities[item.id] ?? 0;
              return (
                <li
                  key={item.id}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border border-charcoal/10 bg-white p-3 shadow-sm transition-colors",
                    !item.isAvailable && "opacity-50",
                  )}
                >
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.imageUrl}
                      alt=""
                      className="size-14 shrink-0 rounded-lg border border-charcoal/10 object-cover"
                    />
                  ) : (
                    <div className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-pine/10 text-pine">
                      <Utensils className="size-5" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-charcoal">
                      {item.name}
                    </p>
                    <p className="text-xs text-charcoal/50">
                      {formatNPR(item.price)}
                      <span
                        className={cn(
                          "ml-2 rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                          CATEGORY_TINT[item.category],
                        )}
                      >
                        {FOOD_CATEGORY_LABELS[item.category]}
                      </span>
                    </p>
                  </div>
                  {item.isAvailable ? (
                    <div className="flex shrink-0 items-center gap-1.5">
                      {qty > 0 ? (
                        <>
                          <button
                            type="button"
                            aria-label={`Decrease ${item.name}`}
                            onClick={() => setQuantity(item.id, qty - 1)}
                            className="flex size-8 cursor-pointer items-center justify-center rounded-full border border-charcoal/15 text-charcoal/70 transition-colors hover:bg-charcoal/5"
                          >
                            <Minus className="size-3.5" />
                          </button>
                          <span className="w-6 text-center text-sm font-semibold text-charcoal">
                            {qty}
                          </span>
                        </>
                      ) : null}
                      <button
                        type="button"
                        aria-label={`Add ${item.name}`}
                        onClick={() => setQuantity(item.id, qty + 1)}
                        className="flex size-8 cursor-pointer items-center justify-center rounded-full bg-pine text-stone transition-colors hover:bg-pine/90"
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </div>
                  ) : (
                    <span className="shrink-0 rounded-full bg-charcoal/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-charcoal/60">
                      Unavailable
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Order summary */}
      <aside className="lg:sticky lg:top-6">
        <div className="flex flex-col gap-4 rounded-xl border border-charcoal/10 bg-white p-5 shadow-sm">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-charcoal/50">
            <ShoppingBag className="size-4" />
            Order summary
          </h2>

          {cart.length === 0 ? (
            <p className="text-sm text-charcoal/50">
              No items yet — tap <Plus className="inline size-3.5" /> on a dish
              to add it. Prices are snapshotted when the order is placed.
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-charcoal/5">
              {cart.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-2 py-2 text-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-charcoal">
                      {item.name}
                    </p>
                    <p className="text-xs text-charcoal/50">
                      {quantities[item.id]} × {formatNPR(item.price)}
                    </p>
                  </div>
                  <span className="shrink-0 font-semibold text-charcoal">
                    {formatNPR(item.price * (quantities[item.id] ?? 0))}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <Field label="Notes (optional)">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="e.g. no onions, serve with the next meal…"
              className="w-full rounded-xl border border-charcoal/15 bg-white px-4 py-2.5 text-sm text-charcoal placeholder:text-charcoal/40 outline-none transition focus:border-pine focus:ring-2 focus:ring-pine/20"
            />
          </Field>

          <div className="flex items-center justify-between border-t border-charcoal/10 pt-3">
            <span className="text-sm text-charcoal/60">
              {cartCount} item{cartCount === 1 ? "" : "s"}
            </span>
            <span className="font-display text-xl text-charcoal">
              {formatNPR(cartTotal)}
            </span>
          </div>

          {error ? (
            <p className="text-xs font-medium text-terracotta">{error}</p>
          ) : null}

          <button
            type="button"
            onClick={placeOrder}
            disabled={isPending || cart.length === 0}
            className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-pine px-5 text-sm font-medium text-stone shadow-[0_10px_20px_-10px_rgba(31,77,58,0.6)] transition-colors hover:bg-pine/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "Placing order…" : "Place order"}
          </button>
        </div>
      </aside>
    </div>
  );
}
