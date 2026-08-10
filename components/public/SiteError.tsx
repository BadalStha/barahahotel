"use client";

import { AlertTriangle } from "lucide-react";

import { Container } from "@/components/ui/Container";
import { MountainDivider } from "@/components/ui/SectionHeading";

/** Styled error fallback for the public site (error.tsx boundaries). */
export function SiteError({
  reset,
  title = "Something went wrong",
}: {
  reset: () => void;
  title?: string;
}) {
  return (
    <Container className="flex flex-col items-center gap-4 py-24 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-terracotta/10 text-terracotta">
        <AlertTriangle className="size-7" />
      </span>
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-terracotta">
        Oops
      </p>
      <h1 className="font-display text-3xl text-charcoal sm:text-4xl">{title}</h1>
      <p className="max-w-md text-sm leading-relaxed text-charcoal/60">
        This page hit an unexpected error. If it keeps happening, please
        contact the hotel directly.
      </p>
      <MountainDivider />
      <button
        type="button"
        onClick={reset}
        className="inline-flex h-11 cursor-pointer items-center rounded-full bg-pine px-7 text-sm font-medium text-stone transition-colors hover:bg-pine/90"
      >
        Try again
      </button>
    </Container>
  );
}
