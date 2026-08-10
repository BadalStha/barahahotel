import { differenceInCalendarDays } from "date-fns";

/** Parse a `YYYY-MM-DD` input into a noon-local Date (hotel stays are noon-to-noon). */
export function parseDateOnly(value: string): Date {
  return new Date(`${value}T12:00:00`);
}

export function nightsBetween(checkIn: Date, checkOut: Date): number {
  return Math.max(1, differenceInCalendarDays(checkOut, checkIn));
}

/** Client-safe: same math on plain `YYYY-MM-DD` strings. */
export function nightsBetweenStrings(checkIn: string, checkOut: string): number {
  return nightsBetween(parseDateOnly(checkIn), parseDateOnly(checkOut));
}
