import type { Booking, BookingSource, Guest, Room, RoomType } from "@prisma/client";
import { format } from "date-fns";

import { findAvailableRooms, isRoomAvailable } from "@/lib/availability";
import { db } from "@/lib/db";

/** Thrown when a room/room type can't accommodate the requested stay. */
export class BookingConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BookingConflictError";
  }
}

const BOOKING_CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no I/O/0/1

function randomCodePart(length: number): string {
  let out = "";
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  for (let i = 0; i < length; i++) {
    out += BOOKING_CODE_ALPHABET[bytes[i] % BOOKING_CODE_ALPHABET.length];
  }
  return out;
}

async function generateBookingCode(): Promise<string> {
  // e.g. BH-260809-K7MQ — date-based, human-readable, unique per day
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = `BH-${format(new Date(), "yyMMdd")}-${randomCodePart(4)}`;
    const existing = await db.booking.findUnique({
      where: { bookingCode: code },
      select: { id: true },
    });
    if (!existing) return code;
  }
  throw new Error("Could not generate a unique booking code");
}

export type CreatedBooking = Booking & {
  guest: Guest;
  room: Room & { roomType: RoomType };
};

export type CreateBookingInput = {
  checkIn: Date;
  checkOut: Date;
  numGuests: number;
  guest: {
    fullName: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  /** Either a specific room id… */
  roomId?: string;
  /** …or a room type to auto-pick the first available room from. */
  roomTypeId?: string;
  source: BookingSource;
  notes?: string;
};

/**
 * Core booking creation shared by the public flow and the admin manual form:
 * re-checks availability server-side, picks/validates the room, finds-or-creates
 * the guest, generates a unique booking code, and stores the rate at booking.
 * Throws BookingConflictError when the room is no longer free.
 */
export async function createBookingRecord(
  input: CreateBookingInput,
): Promise<CreatedBooking> {
  let room;
  if (input.roomId) {
    room = await db.room.findUnique({
      where: { id: input.roomId },
      include: { roomType: true },
    });
    if (!room) throw new BookingConflictError("Room not found.");
    const free = await isRoomAvailable(room.id, input.checkIn, input.checkOut);
    if (!free) {
      throw new BookingConflictError(
        `Room ${room.roomNumber} is no longer available for these dates.`,
      );
    }
  } else {
    const rooms = await findAvailableRooms(input.checkIn, input.checkOut, {
      roomTypeId: input.roomTypeId,
    });
    if (rooms.length === 0) {
      throw new BookingConflictError(
        input.roomTypeId
          ? "This room type is no longer available for those dates."
          : "No rooms are available for those dates.",
      );
    }
    room = await db.room.findUnique({
      where: { id: rooms[0].id },
      include: { roomType: true },
    });
  }
  if (!room) throw new BookingConflictError("Room not found.");

  // Find-or-create the guest. Email isn't unique in the schema, so match on
  // the first record with the same address when one is provided.
  let guest: Guest | null = null;
  if (input.guest.email) {
    guest = await db.guest.findFirst({
      where: { email: input.guest.email },
    });
  }
  const guestData = {
    fullName: input.guest.fullName,
    email: input.guest.email || null,
    phone: input.guest.phone || null,
    address: input.guest.address || null,
  };
  guest = guest
    ? await db.guest.update({ where: { id: guest.id }, data: guestData })
    : await db.guest.create({ data: guestData });

  const bookingCode = await generateBookingCode();
  const booking = await db.booking.create({
    data: {
      bookingCode,
      guestId: guest.id,
      roomId: room.id,
      checkIn: input.checkIn,
      checkOut: input.checkOut,
      numGuests: input.numGuests,
      roomRateAtBooking: room.roomType.basePrice,
      source: input.source,
      notes: input.notes || null,
      status: "PENDING",
    },
    include: { guest: true, room: { include: { roomType: true } } },
  });

  return booking;
}
