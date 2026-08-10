import type { BookingStatus } from "@prisma/client";

import { cn } from "@/lib/utils";

const STYLES: Record<BookingStatus, string> = {
  PENDING: "bg-saffron/20 text-charcoal",
  CONFIRMED: "bg-pine/10 text-pine",
  CHECKED_IN: "bg-terracotta/10 text-terracotta",
  CHECKED_OUT: "bg-charcoal/10 text-charcoal/70",
  CANCELLED: "bg-charcoal/5 text-charcoal/40",
};

const LABELS: Record<BookingStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  CHECKED_IN: "Checked in",
  CHECKED_OUT: "Checked out",
  CANCELLED: "Cancelled",
};

export function StatusBadge({
  status,
  className,
}: {
  status: BookingStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        STYLES[status],
        className,
      )}
    >
      {LABELS[status]}
    </span>
  );
}
