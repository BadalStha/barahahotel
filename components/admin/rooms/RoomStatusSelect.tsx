"use client";

import { useState, useTransition } from "react";

import { updateRoomStatusAction } from "@/app/admin/rooms/actions";
import { cn } from "@/lib/utils";

const OPTIONS = ["AVAILABLE", "OCCUPIED", "MAINTENANCE", "CLEANING"] as const;

export function RoomStatusSelect({
  roomId,
  roomTypeSlug,
  status,
}: {
  roomId: string;
  roomTypeSlug: string;
  status: string;
}) {
  const [value, setValue] = useState(status);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function change(next: string) {
    const previous = value;
    setValue(next);
    setError(null);
    startTransition(async () => {
      try {
        const result = await updateRoomStatusAction(roomId, roomTypeSlug, next);
        if (result?.error) {
          setError(result.error);
          setValue(previous);
        }
      } catch (caught) {
        const digest = (caught as { digest?: string } | null)?.digest;
        if (!digest?.startsWith("NEXT_REDIRECT")) {
          console.error("Status update failed:", caught);
          setError("Something went wrong. Please try again.");
          setValue(previous);
        }
      }
    });
  }

  return (
    <div className="flex flex-col gap-1">
      <select
        value={value}
        onChange={(e) => change(e.target.value)}
        disabled={isPending}
        className={cn(
          "h-9 w-36 cursor-pointer rounded-lg border border-charcoal/15 bg-white px-2 text-sm text-charcoal outline-none transition focus:border-pine disabled:opacity-50",
          value === "OCCUPIED" && "border-terracotta/40 text-terracotta",
          value === "MAINTENANCE" && "border-saffron/50 text-charcoal",
        )}
      >
        {OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option.charAt(0) + option.slice(1).toLowerCase()}
          </option>
        ))}
      </select>
      {error ? <p className="text-xs text-terracotta">{error}</p> : null}
    </div>
  );
}
