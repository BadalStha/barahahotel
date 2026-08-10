import { format, parseISO } from "date-fns";

export const formatNPR = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "NPR",
  maximumFractionDigits: 0,
}).format;

/** e.g. "Sat, Aug 9, 2026" */
export function formatDate(value: Date | string): string {
  const date = typeof value === "string" ? parseISO(value) : value;
  return format(date, "EEE, MMM d, yyyy");
}

/** e.g. "Aug 9" — compact, for tables and chips. */
export function formatDateShort(value: Date | string): string {
  const date = typeof value === "string" ? parseISO(value) : value;
  return format(date, "MMM d");
}
