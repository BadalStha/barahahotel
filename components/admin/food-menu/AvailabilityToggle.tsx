"use client";

import { useState, useTransition } from "react";

import { toggleFoodMenuItemAvailableAction } from "@/app/admin/food-menu/actions";
import { cn } from "@/lib/utils";

export function AvailabilityToggle({
  id,
  isAvailable: initial,
}: {
  id: string;
  isAvailable: boolean;
}) {
  const [available, setAvailable] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function toggle() {
    const previous = available;
    const next = !available;
    setAvailable(next);
    setError(null);
    startTransition(async () => {
      try {
        const result = await toggleFoodMenuItemAvailableAction(id, next);
        if (result?.error) {
          setError(result.error);
          setAvailable(previous);
        }
      } catch (caught) {
        const digest = (caught as { digest?: string } | null)?.digest;
        if (!digest?.startsWith("NEXT_REDIRECT")) {
          console.error("Toggle failed:", caught);
          setError("Something went wrong. Please try again.");
          setAvailable(previous);
        }
      }
    });
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        role="switch"
        aria-checked={available}
        aria-label={available ? "Mark unavailable" : "Mark available"}
        onClick={toggle}
        className={cn(
          "relative h-6 w-11 cursor-pointer rounded-full transition-colors",
          available ? "bg-pine" : "bg-charcoal/20",
        )}
      >
        <span
          className={cn(
            "absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow transition-transform",
            available && "translate-x-5",
          )}
        />
      </button>
      {error ? <p className="text-xs text-terracotta">{error}</p> : null}
    </div>
  );
}
