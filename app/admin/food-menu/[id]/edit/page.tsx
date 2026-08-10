import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { FoodMenuForm } from "@/components/admin/food-menu/FoodMenuForm";
import { db } from "@/lib/db";

export default async function EditFoodMenuItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await db.foodMenuItem.findUnique({ where: { id } });
  if (!item) notFound();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <Link
          href="/admin/food-menu"
          className="inline-flex items-center gap-1.5 text-sm text-charcoal/60 transition-colors hover:text-pine"
        >
          <ArrowLeft className="size-4" />
          Food menu
        </Link>
        <h1 className="mt-2 font-display text-2xl text-charcoal sm:text-3xl">
          Edit menu item
        </h1>
        <p className="mt-1 text-sm text-charcoal/60">{item.name}</p>
      </div>

      <div className="rounded-xl border border-charcoal/10 bg-white p-6 shadow-sm sm:p-8">
        <FoodMenuForm
          item={{
            id: item.id,
            name: item.name,
            category: item.category,
            price: item.price.toString(),
            description: item.description,
            imageUrl: item.imageUrl,
            isAvailable: item.isAvailable,
          }}
        />
      </div>
    </div>
  );
}
