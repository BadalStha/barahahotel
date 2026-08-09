"use client";

import { useState, useTransition } from "react";

import { toggleRoomTypeActiveAction } from "@/app/admin/rooms/actions";
import { cn } from "@/lib/utils";

export function ActiveToggle({
  slug,
  isActive: initial,
}: {
  slug: string;
  isActive: boolean;
}) {
  const [active, setActive] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function toggle() {
    const previous = active;
    const next = !active;
    setActive(next);
    setError(null);
    startTransition(async () => {
      try {
        const result = await toggleRoomTypeActiveAction(slug, next);
        if (result?.error) {
          setError(result.error);
          setActive(previous);
        }
      } catch (caught) {
        const digest = (caught as { digest?: string } | null)?.digest;
        if (!digest?.startsWith("NEXT_REDIRECT")) {
          console.error("Toggle failed:", caught);
          setError("Something went wrong. Please try again.");
          setActive(previous);
        }
      }
    });
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        role="switch"
        aria-checked={active}
        aria-label={active ? "Deactivate" : "Activate"}
        onClick={toggle}
        className={cn(
          "relative h-6 w-11 cursor-pointer rounded-full transition-colors",
          active ? "bg-pine" : "bg-charcoal/20",
        )}
      >
        <span
          className={cn(
            "absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow transition-transform",
            active && "translate-x-5",
          )}
        />
      </button>
      {error ? <p className="text-xs text-terracotta">{error}</p> : null}
    </div>
  );
}
