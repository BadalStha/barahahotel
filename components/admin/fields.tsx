import { cn } from "@/lib/utils";

export const inputClass =
  "h-11 w-full rounded-xl border border-charcoal/15 bg-white px-4 text-sm text-charcoal placeholder:text-charcoal/40 outline-none transition focus:border-pine focus:ring-2 focus:ring-pine/20";

export const inputErrorClass =
  "border-terracotta focus:border-terracotta focus:ring-terracotta/20";

export function Field({
  label,
  htmlFor,
  error,
  hint,
  className,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="text-sm font-medium text-charcoal">
        {label}
      </label>
      {children}
      {hint ? <p className="text-xs text-charcoal/50">{hint}</p> : null}
      {error ? <p className="text-xs text-terracotta">{error}</p> : null}
    </div>
  );
}
