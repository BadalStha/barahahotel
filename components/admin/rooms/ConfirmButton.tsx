"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";

type ConfirmResult = { error?: string } | void;

export function ConfirmButton({
  label = "Delete",
  confirmLabel = "Delete",
  description,
  onConfirm,
  className,
}: {
  label?: string;
  confirmLabel?: string;
  description?: string;
  onConfirm: () => Promise<ConfirmResult> | ConfirmResult;
  className?: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setBusy(true);
    setError(null);
    try {
      const result = await onConfirm();
      if (result && "error" in result && result.error) setError(result.error);
    } catch (caught) {
      const digest = (caught as { digest?: string } | null)?.digest;
      if (!digest?.startsWith("NEXT_REDIRECT")) {
        console.error("Delete failed:", caught);
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setBusy(false);
    }
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => {
          setError(null);
          setConfirming(true);
        }}
        className={cn(
          "inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-terracotta/30 px-3 text-sm font-medium text-terracotta transition-colors hover:bg-terracotta/10",
          className,
        )}
      >
        <Trash2 className="size-4" />
        {label}
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-terracotta/30 bg-terracotta/5 px-3 py-2">
      <p className="text-xs text-charcoal/70">
        {description ?? "Are you sure? This cannot be undone."}
      </p>
      {error ? <p className="text-xs font-medium text-terracotta">{error}</p> : null}
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="h-8 cursor-pointer rounded-lg border border-charcoal/15 px-3 text-xs font-medium text-charcoal/70 transition-colors hover:bg-charcoal/5"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={run}
        disabled={busy}
        className="h-8 cursor-pointer rounded-lg bg-terracotta px-3 text-xs font-medium text-stone transition-colors hover:bg-terracotta/90 disabled:opacity-50"
      >
        {busy ? "Working…" : confirmLabel}
      </button>
    </div>
  );
}
