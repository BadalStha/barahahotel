"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex h-11 cursor-pointer items-center rounded-xl bg-pine px-5 text-sm font-semibold text-cream transition-colors hover:bg-pine/90"
    >
      Print
    </button>
  );
}
