import Link from "next/link";
import { Compass } from "lucide-react";

import { MountainDivider } from "@/components/ui/SectionHeading";

export default function AdminNotFound() {
  return (
    <div className="flex flex-col items-center gap-4 py-24 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-pine/10 text-pine">
        <Compass className="size-7" />
      </span>
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-terracotta">
        404 · Not found
      </p>
      <h1 className="font-display text-4xl text-charcoal">Page not found</h1>
      <p className="max-w-md text-sm text-charcoal/60">
        This admin page doesn&apos;t exist or has moved.
      </p>
      <MountainDivider />
      <Link
        href="/admin/dashboard"
        className="rounded-full bg-pine px-5 py-2.5 text-sm font-medium text-stone transition-colors hover:bg-pine/90"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
