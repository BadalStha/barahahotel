/**
 * Minimal class-name combiner.
 * Swap for clsx + tailwind-merge later if conflicting-class overrides
 * become a problem — the current components order `className` last.
 */
export function cn(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}
