"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { db } from "@/lib/db";
import { generateInvoice } from "@/lib/invoice";

/**
 * Advance bookings — admin-only, no payment, no guest access.
 * Enquiries still arrive by phone/contact form; the manager records
 * them here with big buttons and minimal typing.
 */

const reservationSchema = z.object({
  guestName: z.string().trim().min(2, "Enter the guest's name").max(100),
  guestPhone: z.string().trim().max(30).optional().or(z.literal("")),
  numGuests: z.coerce.number().int().min(1).max(20).default(1),
  roomTypeId: z.string().min(1, "Choose a room type"),
  roomId: z.string().trim().optional().or(z.literal("")),
  arrivalDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Pick an arrival date"),
  nights: z.coerce.number().int().min(1).max(60).default(1),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
});

/** "YYYY-MM-DD" → local noon (avoids midnight timezone edge cases). */
function parseArrivalDate(value: string): Date | null {
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return null;
  const date = new Date(y, m - 1, d, 12, 0, 0, 0);
  return Number.isNaN(date.getTime()) ? null : date;
}

function arrivalError(): never {
  redirect("/admin/dashboard?error=booking#book-room");
}

export async function createReservationFormAction(
  formData: FormData,
): Promise<void> {
  const parsed = reservationSchema.safeParse({
    guestName: formData.get("guestName") ?? "",
    guestPhone: formData.get("guestPhone") ?? "",
    numGuests: formData.get("numGuests") ?? "1",
    roomTypeId: formData.get("roomTypeId") ?? "",
    roomId: formData.get("roomId") ?? "",
    arrivalDate: formData.get("arrivalDate") ?? "",
    nights: formData.get("nights") ?? "1",
    notes: formData.get("notes") ?? "",
  });
  if (!parsed.success) arrivalError();

  const arrivalDate = parseArrivalDate(parsed.data.arrivalDate);
  if (!arrivalDate) arrivalError();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (arrivalDate < today) arrivalError();

  const roomType = await db.roomType.findUnique({
    where: { id: parsed.data.roomTypeId },
    select: { id: true },
  });
  if (!roomType) arrivalError();

  let roomId: string | null = null;
  if (parsed.data.roomId) {
    const room = await db.room.findUnique({
      where: { id: parsed.data.roomId },
      select: { id: true },
    });
    if (!room) arrivalError();
    roomId = room.id;
  }

  await db.reservation.create({
    data: {
      guestName: parsed.data.guestName,
      guestPhone: parsed.data.guestPhone || null,
      numGuests: parsed.data.numGuests,
      roomTypeId: parsed.data.roomTypeId,
      roomId,
      arrivalDate,
      nights: parsed.data.nights,
      notes: parsed.data.notes || null,
    },
  });

  revalidatePath("/admin/dashboard");
  redirect("/admin/dashboard?booked=1#bookings");
}

export async function cancelReservationFormAction(
  reservationId: string,
): Promise<void> {
  await db.reservation.updateMany({
    where: { id: reservationId, status: "BOOKED" },
    data: { status: "CANCELLED" },
  });

  revalidatePath("/admin/dashboard");
  redirect("/admin/dashboard#bookings");
}

/**
 * One-tap check-in from a booking: creates the RoomEntry from the
 * reservation (rate = the room's current base price), frees the manager
 * from retyping the guest's details.
 */
export async function checkInReservationFormAction(
  reservationId: string,
  formData: FormData,
): Promise<void> {
  const roomId = String(formData.get("roomId") ?? "");
  if (!roomId) redirect("/admin/dashboard?error=booking#bookings");

  const reservation = await db.reservation.findUnique({
    where: { id: reservationId },
  });
  if (!reservation || reservation.status !== "BOOKED") {
    redirect("/admin/dashboard?error=booking#bookings");
  }

  const room = await db.room.findUnique({
    where: { id: roomId },
    include: { roomType: true },
  });
  if (!room || room.status !== "AVAILABLE") {
    redirect("/admin/dashboard?error=room_unavailable#bookings");
  }

  const arrivalLabel = reservation.arrivalDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });

  const entry = await db.roomEntry.create({
    data: {
      roomId: room.id,
      guestName: reservation.guestName,
      guestPhone: reservation.guestPhone,
      numGuests: reservation.numGuests,
      checkIn: new Date(),
      ratePerNight: room.roomType.basePrice,
      status: "OCCUPIED",
      notes: [
        `Booked ${reservation.nights} night${reservation.nights === 1 ? "" : "s"}, arrival ${arrivalLabel}.`,
        reservation.notes,
      ]
        .filter(Boolean)
        .join(" "),
      reservationId: reservation.id,
    },
  });

  await db.$transaction([
    db.room.update({
      where: { id: room.id },
      data: { status: "OCCUPIED" },
    }),
    db.reservation.update({
      where: { id: reservation.id },
      data: { status: "CHECKED_IN" },
    }),
  ]);

  await generateInvoice(entry.id);

  revalidatePath("/admin/dashboard");
  redirect(`/admin/dashboard?room=${entry.id}`);
}
