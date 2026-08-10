"use client";

import { AlertTriangle } from "lucide-react";

/** Styled error fallback rendered inside the admin shell (error.tsx). */
export function AdminError({
  reset,
  title = "Something went wrong",
}: {
  reset: () => void;
  title?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-4 py-24 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-terracotta/10 text-terracotta">
        <AlertTriangle className="size-7" />
      </span>
      <h1 className="font-display text-2xl text-charcoal sm:text-3xl">{title}</h1>
      <p className="max-w-md text-sm text-charcoal/60">
        This section hit an unexpected error. Try again — if it keeps
        happening, check the server logs.
      </p>
      <button
        type="button"
        onClick={reset}
        className="inline-flex h-10 cursor-pointer items-center rounded-full bg-pine px-6 text-sm font-medium text-stone transition-colors hover:bg-pine/90"
      >
        Try again
      </button>
    </div>
  );
}
