import type { BookingStatus, Room } from "@prisma/client";

import { db } from "@/lib/db";

/**
 * A stay [checkIn, checkOut) is blocked when another booking overlaps it:
 * existing.checkIn < requested.checkOut AND existing.checkOut > requested.checkIn.
 * This treats the check-out day as free (noon-to-noon stays), matching how
 * bookings are stored (noon-local datetimes).
 */
export const OCCUPYING_STATUSES = ["CONFIRMED", "CHECKED_IN"] as const;

export type AvailabilityOptions = {
  /** Exclude this booking id from the overlap check (e.g. when editing). */
  excludeBookingId?: string;
  /** Statuses that occupy a room. Defaults to CONFIRMED + CHECKED_IN. */
  statuses?: readonly BookingStatus[];
  /** Only consider rooms of this room type. */
  roomTypeId?: string;
  /** Only consider rooms whose room type is active (public-facing). */
  onlyActive?: boolean;
};

export async function findUnavailableRoomIds(
  checkIn: Date,
  checkOut: Date,
  options: AvailabilityOptions = {},
): Promise<Set<string>> {
  const statuses = (options.statuses ?? OCCUPYING_STATUSES) as BookingStatus[];
  const rows = await db.booking.findMany({
    where: {
      ...(options.excludeBookingId
        ? { id: { not: options.excludeBookingId } }
        : {}),
      status: { in: statuses },
      checkIn: { lt: checkOut },
      checkOut: { gt: checkIn },
    },
    select: { roomId: true },
  });
  return new Set(rows.map((r) => r.roomId));
}

export async function isRoomAvailable(
  roomId: string,
  checkIn: Date,
  checkOut: Date,
  options: AvailabilityOptions = {},
): Promise<boolean> {
  const unavailable = await findUnavailableRoomIds(checkIn, checkOut, options);
  return !unavailable.has(roomId);
}

export async function findAvailableRooms(
  checkIn: Date,
  checkOut: Date,
  options: AvailabilityOptions = {},
): Promise<Room[]> {
  const unavailable = await findUnavailableRoomIds(checkIn, checkOut, options);
  return db.room.findMany({
    where: {
      ...(options.roomTypeId ? { roomTypeId: options.roomTypeId } : {}),
      ...(options.onlyActive ? { roomType: { isActive: true } } : {}),
      id: { notIn: [...unavailable] },
    },
    orderBy: { roomNumber: "asc" },
  });
}

export type AvailableRoomTypeGroup = {
  roomTypeId: string;
  name: string;
  slug: string;
  basePrice: number; // converted from Decimal for serialization
  maxOccupancy: number;
  sizeSqft: number | null;
  amenities: string[];
  imageUrl: string | null; // first image by sortOrder
  availableRooms: number;
  rooms: { id: string; roomNumber: string }[];
};

/**
 * Group available rooms by room type for a date range. Only room types with
 * at least one free room are returned, sorted by price (cheapest first).
 */
export async function findAvailableRoomTypes(
  checkIn: Date,
  checkOut: Date,
  options: AvailabilityOptions = {},
): Promise<AvailableRoomTypeGroup[]> {
  const unavailable = await findUnavailableRoomIds(checkIn, checkOut, options);
  const rooms = await db.room.findMany({
    where: {
      ...(options.roomTypeId ? { roomTypeId: options.roomTypeId } : {}),
      ...(options.onlyActive ? { roomType: { isActive: true } } : {}),
      id: { notIn: [...unavailable] },
    },
    include: {
      roomType: {
        include: {
          images: { orderBy: { sortOrder: "asc" }, take: 1 },
        },
      },
    },
    orderBy: { roomNumber: "asc" },
  });

  const byType = new Map<string, NonNullable<(typeof rooms)[number]>>();
  for (const room of rooms) {
    if (!byType.has(room.roomTypeId)) byType.set(room.roomTypeId, room);
  }

  const groups: AvailableRoomTypeGroup[] = [];
  for (const [roomTypeId, sample] of byType) {
    const typeRooms = rooms.filter((r) => r.roomTypeId === roomTypeId);
    groups.push({
      roomTypeId,
      name: sample.roomType.name,
      slug: sample.roomType.slug,
      basePrice: Number(sample.roomType.basePrice),
      maxOccupancy: sample.roomType.maxOccupancy,
      sizeSqft: sample.roomType.sizeSqft,
      amenities: sample.roomType.amenities,
      imageUrl: sample.roomType.images[0]?.url ?? null,
      availableRooms: typeRooms.length,
      rooms: typeRooms.map((r) => ({ id: r.id, roomNumber: r.roomNumber })),
    });
  }

  return groups.sort((a, b) => a.basePrice - b.basePrice);
}
