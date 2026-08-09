import { cn } from "@/lib/utils";

/**
 * Thin mountain-silhouette divider: a delicate ridge line with a
 * saffron sun. Tint it with any palette color via `className`
 * (defaults to pine).
 */
export function MountainDivider({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={cn("h-6 w-48 text-pine", className)}
    >
      <circle className="fill-saffron" cx="28" cy="16" r="5" />
      {/* ridgeline base */}
      <path
        d="M10 28 H230"
        stroke="currentColor"
        strokeOpacity="0.35"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* small peak */}
      <path
        d="M36 28 L58 14 L80 28"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* main peak with snow cap */}
      <path
        d="M72 28 L122 4 L172 28"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M113 13 L122 4 L131 13"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* right peak */}
      <path
        d="M164 28 L190 12 L216 28"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  align?: "center" | "left";
  className?: string;
}

export function SectionHeading({
  title,
  subtitle,
  align = "center",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "center" ? "items-center text-center" : "items-start text-left",
        className,
      )}
    >
      <h2 className="font-display text-3xl leading-tight text-charcoal sm:text-4xl">
        {title}
      </h2>
      {subtitle ? (
        <p className="max-w-2xl text-base leading-relaxed text-charcoal/70">
          {subtitle}
        </p>
      ) : null}
      <MountainDivider className={cn("mt-1", align === "center" && "mx-auto")} />
    </div>
  );
}
