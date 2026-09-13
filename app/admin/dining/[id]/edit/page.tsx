import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { MenuItemForm } from "@/components/admin/dining/MenuItemForm";
import { db } from "@/lib/db";

export default async function EditMenuItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await db.menuItem.findUnique({ where: { id } });
  if (!item) notFound();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <Link
          href="/admin/dining"
          className="inline-flex items-center gap-1.5 text-sm text-charcoal/60 transition-colors hover:text-pine"
        >
          <ArrowLeft className="size-4" />
          Dining menu
        </Link>
        <h1 className="mt-2 font-display text-2xl text-charcoal sm:text-3xl">
          Edit menu item
        </h1>
      </div>

      <div className="rounded-xl border border-charcoal/10 bg-white p-6 shadow-sm sm:p-8">
        <MenuItemForm
          item={{
            id: item.id,
            name: item.name,
            description: item.description ?? "",
            price: String(item.price),
            category: item.category ?? "",
            isAvailable: item.isAvailable,
            sortOrder: item.sortOrder,
          }}
        />
      </div>
    </div>
  );
}
