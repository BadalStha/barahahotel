"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { cn } from "@/lib/utils";

export function PublishToggle({
  isPublished: initial,
  onToggle,
  publishedLabel = "Published",
  draftLabel = "Draft",
}: {
  isPublished: boolean;
  onToggle: (next: boolean) => Promise<{ error?: string } | void>;
  publishedLabel?: string;
  draftLabel?: string;
}) {
  const router = useRouter();
  const [isPublished, setIsPublished] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function toggle() {
    const previous = isPublished;
    const next = !isPublished;
    setIsPublished(next);
    setError(null);
    startTransition(async () => {
      try {
        const result = await onToggle(next);
        if (result && "error" in result && result.error) {
          setError(result.error);
          setIsPublished(previous);
          return;
        }
        router.refresh();
      } catch (caught) {
        const digest = (caught as { digest?: string } | null)?.digest;
        if (!digest?.startsWith("NEXT_REDIRECT")) {
          console.error("Toggle failed:", caught);
          setError("Something went wrong. Please try again.");
          setIsPublished(previous);
        }
      }
    });
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        role="switch"
        aria-checked={isPublished}
        aria-label={isPublished ? publishedLabel : draftLabel}
        onClick={toggle}
        className={cn(
          "relative h-6 w-11 cursor-pointer rounded-full transition-colors",
          isPublished ? "bg-pine" : "bg-charcoal/20",
        )}
      >
        <span
          className={cn(
            "absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow transition-transform",
            isPublished && "translate-x-5",
          )}
        />
      </button>
      {error ? <p className="text-xs text-terracotta">{error}</p> : null}
    </div>
  );
}
