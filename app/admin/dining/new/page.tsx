import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { MenuItemForm } from "@/components/admin/dining/MenuItemForm";

export default function NewMenuItemPage() {
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
          New menu item
        </h1>
      </div>

      <div className="rounded-xl border border-charcoal/10 bg-white p-6 shadow-sm sm:p-8">
        <MenuItemForm />
      </div>
    </div>
  );
}
