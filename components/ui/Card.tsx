import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

/**
 * Wood-carved frame: a subtle pine border plus an inset groove
 * (inner ring) and a soft warm shadow over the stone background.
 */
export function Card({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-pine/15 bg-surface p-6",
        "shadow-[0_14px_32px_-16px_rgba(43,38,32,0.32)]",
        "ring-1 ring-inset ring-pine/5",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
