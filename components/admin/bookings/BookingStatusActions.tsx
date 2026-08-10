"use client";

import type { BookingStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { CheckCircle2, DoorOpen, LogIn, XCircle } from "lucide-react";

import { updateBookingStatusAction } from "@/app/admin/bookings/actions";
import { cn } from "@/lib/utils";
import { BOOKING_TRANSITIONS } from "@/lib/validators/booking";

const TRANSITIONS = BOOKING_TRANSITIONS;

const ACTIONS: {
  next: BookingStatus;
  label: string;
  icon: typeof CheckCircle2;
  className: string;
}[] = [
  {
    next: "CONFIRMED",
    label: "Confirm",
    icon: CheckCircle2,
    className: "bg-pine text-stone hover:bg-pine/90",
  },
  {
    next: "CHECKED_IN",
    label: "Check in",
    icon: LogIn,
    className: "bg-terracotta text-stone hover:bg-terracotta/90",
  },
  {
    next: "CHECKED_OUT",
    label: "Check out",
    icon: DoorOpen,
    className: "bg-pine text-stone hover:bg-pine/90",
  },
  {
    next: "CANCELLED",
    label: "Cancel booking",
    icon: XCircle,
    className:
      "border border-terracotta/40 text-terracotta hover:bg-terracotta/10",
  },
];

export function BookingStatusActions({
  bookingId,
  status,
}: {
  bookingId: string;
  status: BookingStatus;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [pendingAction, setPendingAction] = useState<BookingStatus | null>(
    null,
  );

  const allowed = TRANSITIONS[status];
  const available = ACTIONS.filter((a) => allowed.includes(a.next));

  function run(next: BookingStatus) {
    setError(null);
    setPendingAction(next);
    startTransition(async () => {
      try {
        const result = await updateBookingStatusAction(bookingId, next);
        if (result?.error) {
          setError(result.error);
          return;
        }
        router.refresh();
      } catch (caught) {
        const digest = (caught as { digest?: string } | null)?.digest;
        if (!digest?.startsWith("NEXT_REDIRECT")) {
          console.error("Status update failed:", caught);
          setError("Something went wrong. Please try again.");
        }
      } finally {
        setPendingAction(null);
      }
    });
  }

  if (available.length === 0) {
    return (
      <p className="text-sm text-charcoal/50">
        This booking is finished — no further actions.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {available.map((action) => (
          <button
            key={action.next}
            type="button"
            onClick={() => run(action.next)}
            disabled={isPending}
            className={cn(
              "inline-flex h-10 cursor-pointer items-center gap-2 rounded-full px-4 text-sm font-medium transition-colors disabled:opacity-50",
              action.className,
            )}
          >
            <action.icon className="size-4" />
            {isPending && pendingAction === action.next
              ? "Working…"
              : action.label}
          </button>
        ))}
      </div>
      {error ? <p className="text-sm text-terracotta">{error}</p> : null}
    </div>
  );
}
