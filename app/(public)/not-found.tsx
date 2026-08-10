import Link from "next/link";
import { Compass } from "lucide-react";

import { Container } from "@/components/ui/Container";
import { MountainDivider } from "@/components/ui/SectionHeading";

export default function PublicNotFound() {
  return (
    <Container className="flex flex-col items-center gap-4 py-24 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-pine/10 text-pine">
        <Compass className="size-8" />
      </span>
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-terracotta">
        404 · Not found
      </p>
      <h1 className="font-display text-4xl text-charcoal sm:text-5xl">
        Lost in the hills
      </h1>
      <p className="max-w-md text-sm leading-relaxed text-charcoal/60">
        The page you&apos;re looking for doesn&apos;t exist or has moved. Let&apos;s
        get you back on the trail.
      </p>
      <MountainDivider />
      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="inline-flex h-11 items-center rounded-full bg-pine px-7 text-sm font-medium text-stone transition-colors hover:bg-pine/90"
        >
          Back to home
        </Link>
        <Link
          href="/rooms"
          className="inline-flex h-11 items-center rounded-full border border-pine/40 px-7 text-sm font-medium text-pine transition-colors hover:bg-pine/10"
        >
          Browse rooms
        </Link>
      </div>
    </Container>
  );
}
