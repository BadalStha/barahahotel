import Link from "next/link";

import { MountainDivider } from "@/components/ui/SectionHeading";

export default function AdminNotFound() {
  return (
    <div className="flex flex-col items-center gap-4 py-24 text-center">
      <h1 className="font-display text-4xl text-charcoal">Page not found</h1>
      <p className="max-w-md text-sm text-charcoal/60">
        This admin section hasn&apos;t been built yet — it will land with the
        next feature.
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
