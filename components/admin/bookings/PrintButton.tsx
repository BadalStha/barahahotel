"use client";

import { Printer } from "lucide-react";

export function PrintButton({
  label = "Print invoice",
}: {
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full bg-pine px-5 text-sm font-medium text-stone shadow-[0_10px_20px_-10px_rgba(31,77,58,0.6)] transition-colors hover:bg-pine/90"
    >
      <Printer className="size-4" />
      {label}
    </button>
  );
}
