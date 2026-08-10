import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

/** Friendly empty state for admin lists (no bookings yet, no rooms, …). */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-charcoal/25 bg-white/70 px-6 py-16 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-pine/10 text-pine">
        <Icon className="size-6" />
      </span>
      <h2 className="font-display text-xl text-charcoal">{title}</h2>
      {description ? (
        <p className="max-w-sm text-sm leading-relaxed text-charcoal/60">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
