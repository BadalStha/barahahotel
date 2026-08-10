"use server";

import { revalidatePath } from "next/cache";

import type { AvailableRoomTypeGroup } from "@/lib/availability";
import { findAvailableRoomTypes } from "@/lib/availability";
import { BookingConflictError, createBookingRecord } from "@/lib/booking";
import { nightsBetween, parseDateOnly } from "@/lib/dates";
import { sendBookingConfirmationEmail } from "@/lib/email";
import {
  dateRangeSchema,
  publicBookingSchema,
  type DateRangeInput,
} from "@/lib/validators/booking";

export type AvailabilityResult =
  | { available: AvailableRoomTypeGroup[] }
  | { error: string };

/** Shared by the public flow, the room-page widget, and the admin form. */
export async function checkAvailabilityAction(
  input: DateRangeInput,
): Promise<AvailabilityResult> {
  const parsed = dateRangeSchema.safeParse(input);
  if (!parsed.success) return { error: "Please fix the highlighted fields." };

  const checkIn = parseDateOnly(parsed.data.checkIn);
  const checkOut = parseDateOnly(parsed.data.checkOut);

  const groups = await findAvailableRoomTypes(checkIn, checkOut, {
    onlyActive: true,
  });
  return { available: groups };
}

export type BookingConfirmation = {
  bookingCode: string;
  roomTypeName: string;
  roomNumber: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  numGuests: number;
  ratePerNight: number;
  total: number;
  guestName: string;
  guestEmail: string;
  emailSent: boolean;
};

export type CreateBookingResult =
  | { booking: BookingConfirmation }
  | { error: string };

export async function createBookingAction(
  input: unknown,
): Promise<CreateBookingResult> {
  const parsed = publicBookingSchema.safeParse(input);
  if (!parsed.success) return { error: "Please fix the highlighted fields." };

  const checkIn = parseDateOnly(parsed.data.checkIn);
  const checkOut = parseDateOnly(parsed.data.checkOut);

  try {
    const booking = await createBookingRecord({
      checkIn,
      checkOut,
      numGuests: parsed.data.numGuests,
      guest: {
        fullName: parsed.data.fullName,
        email: parsed.data.email,
        phone: parsed.data.phone,
        address: parsed.data.address || undefined,
      },
      roomTypeId: parsed.data.roomTypeId,
      source: "WEBSITE",
      notes: parsed.data.notes || undefined,
    });

    // Fire the confirmation email; never fail the booking if email is down.
    const emailResult = await sendBookingConfirmationEmail(booking);

    revalidatePath("/");
    revalidatePath("/rooms");
    revalidatePath("/booking");

    const nights = nightsBetween(checkIn, checkOut);
    return {
      booking: {
        bookingCode: booking.bookingCode,
        roomTypeName: booking.room.roomType.name,
        roomNumber: booking.room.roomNumber,
        checkIn: parsed.data.checkIn,
        checkOut: parsed.data.checkOut,
        nights,
        numGuests: booking.numGuests,
        ratePerNight: Number(booking.roomRateAtBooking),
        total: Number(booking.roomRateAtBooking) * nights,
        guestName: booking.guest.fullName,
        guestEmail: booking.guest.email ?? "",
        emailSent: emailResult.sent,
      },
    };
  } catch (error) {
    if (error instanceof BookingConflictError) {
      return { error: error.message };
    }
    throw error;
  }
}
