"use server";

import type { BookingStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { BookingConflictError, createBookingRecord } from "@/lib/booking";
import { parseDateOnly } from "@/lib/dates";
import { db } from "@/lib/db";
import {
  adminBookingSchema,
  BOOKING_TRANSITIONS,
} from "@/lib/validators/booking";

export type ActionResult = { error?: string };

const TRANSITIONS = BOOKING_TRANSITIONS;

// ── Manual booking (walk-in / phone) ──────────────────────────────

export async function adminCreateBookingAction(
  input: unknown,
): Promise<ActionResult> {
  const parsed = adminBookingSchema.safeParse(input);
  if (!parsed.success) return { error: "Please fix the highlighted fields." };

  try {
    const booking = await createBookingRecord({
      checkIn: parseDateOnly(parsed.data.checkIn),
      checkOut: parseDateOnly(parsed.data.checkOut),
      numGuests: parsed.data.numGuests,
      guest: {
        fullName: parsed.data.fullName,
        email: parsed.data.email || undefined,
        phone: parsed.data.phone || undefined,
        address: parsed.data.address || undefined,
      },
      roomId: parsed.data.roomId,
      source: parsed.data.source,
      notes: parsed.data.notes || undefined,
    });

    revalidatePath("/admin/bookings");
    revalidatePath("/admin/dashboard");
    redirect(`/admin/bookings/${booking.id}`);
  } catch (error) {
    if (error instanceof BookingConflictError) {
      return { error: error.message };
    }
    throw error;
  }
}

// ── Status transitions ────────────────────────────────────────────

export async function updateBookingStatusAction(
  id: string,
  next: BookingStatus,
): Promise<ActionResult> {
  const booking = await db.booking.findUnique({
    where: { id },
    select: { id: true, status: true, roomId: true, bookingCode: true },
  });
  if (!booking) return { error: "Booking not found." };

  const allowed = TRANSITIONS[booking.status];
  if (!allowed.includes(next)) {
    return {
      error: `Cannot move a ${booking.status} booking to ${next}.`,
    };
  }

  await db.$transaction([
    db.booking.update({ where: { id }, data: { status: next } }),
    // Keep the physical room status in sync with the stay.
    ...(next === "CHECKED_IN"
      ? [db.room.update({ where: { id: booking.roomId }, data: { status: "OCCUPIED" } })]
      : []),
    ...(next === "CHECKED_OUT"
      ? [db.room.update({ where: { id: booking.roomId }, data: { status: "AVAILABLE" } })]
      : []),
  ]);

  revalidatePath("/admin/bookings");
  revalidatePath(`/admin/bookings/${id}`);
  revalidatePath("/admin/dashboard");
  return {};
}
