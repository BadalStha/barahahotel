import Link from "next/link";
import { Pencil, Plus, Trash2, Utensils } from "lucide-react";

import { PublishToggle } from "@/components/admin/content/PublishToggle";
import { db } from "@/lib/db";
import { formatNPR } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  deleteMenuItemAction,
  toggleMenuItemAvailableAction,
} from "./actions";

export default async function AdminDiningPage() {
  const items = await db.menuItem.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-charcoal sm:text-3xl">
            Dining menu
          </h1>
          <p className="mt-1 text-sm text-charcoal/60">
            {items.length} item{items.length === 1 ? "" : "s"} ·{" "}
            {items.filter((i) => i.isAvailable).length} on the menu
          </p>
        </div>
        <Link
          href="/admin/dining/new"
          className="inline-flex h-11 items-center gap-2 rounded-full bg-pine px-5 text-sm font-medium text-stone shadow-[0_10px_20px_-10px_rgba(31,77,58,0.6)] transition-colors hover:bg-pine/90"
        >
          <Plus className="size-4" />
          New menu item
        </Link>
      </header>

      <div className="overflow-x-auto rounded-xl border border-charcoal/10 bg-white shadow-sm">
        <table className="w-full min-w-[620px] text-left text-sm">
          <thead className="border-b border-charcoal/10 text-xs uppercase tracking-wider text-charcoal/50">
            <tr>
              <th className="px-5 py-3 font-semibold">Item</th>
              <th className="px-5 py-3 font-semibold">Category</th>
              <th className="px-5 py-3 font-semibold">Price</th>
              <th className="px-5 py-3 font-semibold">Order</th>
              <th className="px-5 py-3 font-semibold">On menu</th>
              <th className="px-5 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal/5">
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-sm text-charcoal/50">
                  No menu items yet — add your first dish.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr
                  key={item.id}
                  className={cn(
                    "transition-colors hover:bg-stone/50",
                    !item.isAvailable && "opacity-70",
                  )}
                >
                  <td className="max-w-md px-5 py-3">
                    <Link
                      href={`/admin/dining/${item.id}/edit`}
                      className="flex items-center gap-2.5 font-medium text-charcoal transition-colors hover:text-pine"
                    >
                      <Utensils className="size-4 shrink-0 text-charcoal/30" />
                      <span className="min-w-0">
                        <span className="block truncate">{item.name}</span>
                        {item.description ? (
                          <span className="block truncate text-xs font-normal text-charcoal/50">
                            {item.description}
                          </span>
                        ) : null}
                      </span>
                    </Link>
                  </td>
                  <td className="px-5 py-3">
                    {item.category ? (
                      <span className="rounded-full bg-pine/10 px-2.5 py-1 text-xs font-medium text-pine">
                        {item.category}
                      </span>
                    ) : (
                      <span className="text-charcoal/40">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3 font-medium text-charcoal">
                    {formatNPR(Number(item.price))}
                  </td>
                  <td className="px-5 py-3 text-charcoal/60">{item.sortOrder}</td>
                  <td className="px-5 py-3">
                    <PublishToggle
                      isPublished={item.isAvailable}
                      publishedLabel="On menu"
                      draftLabel="Hidden"
                      onToggle={(next) =>
                        toggleMenuItemAvailableAction(item.id, next)
                      }
                    />
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/dining/${item.id}/edit`}
                        className="inline-flex h-9 items-center gap-2 rounded-lg border border-charcoal/15 px-3 text-sm font-medium text-charcoal/70 transition-colors hover:bg-charcoal/5"
                      >
                        <Pencil className="size-4" />
                        Edit
                      </Link>
                      <form action={deleteMenuItemAction.bind(null, item.id)}>
                        <button
                          type="submit"
                          className="inline-flex h-9 items-center gap-2 rounded-lg border border-terracotta/30 px-3 text-sm font-medium text-terracotta transition-colors hover:bg-terracotta/10"
                        >
                          <Trash2 className="size-4" />
                          Delete
                        </button>
                      </form>
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
