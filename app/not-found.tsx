import Link from "next/link";
import { Compass } from "lucide-react";

/** Root fallback for URLs that match no route at all. */
export default function RootNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-stone px-4 text-center text-charcoal">
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
        The page you&apos;re looking for doesn&apos;t exist or has moved.
      </p>
      <Link
        href="/"
        className="mt-2 inline-flex h-11 items-center rounded-full bg-pine px-7 text-sm font-medium text-stone transition-colors hover:bg-pine/90"
      >
        Back to home
      </Link>
    </div>
  );
}
