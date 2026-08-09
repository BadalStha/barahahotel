"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";

import { db } from "@/lib/db";
import {
  roomSchema,
  roomStatusSchema,
  roomTypeSchema,
  type RoomFormInput,
  type RoomTypeFormInput,
  type RoomTypeFormValues,
} from "@/lib/validators/room";

export type ActionResult = { error?: string };

const ACTIVE_BOOKING_STATUSES = ["PENDING", "CONFIRMED", "CHECKED_IN"] as const;

function isUniqueError(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002"
  );
}

type RoomTypeDataWithoutImages = Omit<RoomTypeFormValues, "images">;

function toRoomTypeData(input: RoomTypeDataWithoutImages) {
  // Explicit mapping: `input` here is the parsed zod *output*, whose scalar
  // types (basePrice, maxOccupancy, sizeSqft) are concrete numbers.
  return {
    name: input.name,
    slug: input.slug,
    description: input.description || null,
    basePrice: input.basePrice,
    maxOccupancy: input.maxOccupancy,
    sizeSqft: input.sizeSqft || null,
    amenities: input.amenities,
    isActive: input.isActive,
  };
}

// ── Room types ──────────────────────────────────────────────────────

export async function createRoomTypeAction(
  input: RoomTypeFormInput,
): Promise<ActionResult> {
  const parsed = roomTypeSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Please fix the highlighted fields." };
  }

  try {
    const { images, ...data } = parsed.data;
    const roomType = await db.roomType.create({
      data: {
        ...toRoomTypeData(data),
        images: {
          create: images.map((img, index) => ({ ...img, sortOrder: index })),
        },
      },
    });
    revalidatePath("/admin/rooms");
    redirect(`/admin/rooms/${roomType.slug}`);
  } catch (error) {
    if (isUniqueError(error)) {
      return { error: "A room type with this slug already exists." };
    }
    throw error;
  }
}

export async function updateRoomTypeAction(
  slug: string,
  input: RoomTypeFormInput,
): Promise<ActionResult> {
  const parsed = roomTypeSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Please fix the highlighted fields." };
  }

  const existing = await db.roomType.findUnique({ where: { slug } });
  if (!existing) return { error: "Room type not found." };

  try {
    const { images, ...data } = parsed.data;
    await db.$transaction([
      db.roomType.update({
        where: { id: existing.id },
        data: toRoomTypeData(data),
      }),
      db.roomImage.deleteMany({ where: { roomTypeId: existing.id } }),
      db.roomImage.createMany({
        data: images.map((img, index) => ({
          ...img,
          roomTypeId: existing.id,
          sortOrder: index,
        })),
      }),
    ]);
    revalidatePath("/admin/rooms");
    revalidatePath(`/admin/rooms/${existing.slug}`);
    revalidatePath(`/admin/rooms/${data.slug}`);
    // Redirect to the *new* slug — the form lets admins rename it.
    redirect(`/admin/rooms/${data.slug}`);
  } catch (error) {
    if (isUniqueError(error)) {
      return { error: "A room type with this slug already exists." };
    }
    throw error;
  }
}

export async function toggleRoomTypeActiveAction(
  slug: string,
  isActive: boolean,
): Promise<ActionResult> {
  await db.roomType.update({ where: { slug }, data: { isActive } });
  revalidatePath("/admin/rooms");
  revalidatePath(`/admin/rooms/${slug}`);
  return {};
}

export async function deleteRoomTypeAction(slug: string): Promise<ActionResult> {
  const roomType = await db.roomType.findUnique({
    where: { slug },
    select: { id: true, rooms: { select: { id: true } } },
  });
  if (!roomType) return { error: "Room type not found." };

  const roomIds = roomType.rooms.map((r) => r.id);
  const activeBookings = await db.booking.count({
    where: {
      roomId: { in: roomIds },
      status: { in: [...ACTIVE_BOOKING_STATUSES] },
    },
  });
  if (activeBookings > 0) {
    return {
      error: `Cannot delete — ${activeBookings} active booking(s) reference rooms of this type.`,
    };
  }

  // No active bookings: cascade-remove historical bookings (and their food
  // orders / invoices), rooms, images, then the room type itself.
  await db.$transaction(async (tx) => {
    const historicalBookings = await tx.booking.findMany({
      where: { roomId: { in: roomIds } },
      select: { id: true },
    });
    const bookingIds = historicalBookings.map((b) => b.id);
    if (bookingIds.length > 0) {
      await tx.foodOrderItem.deleteMany({
        where: { foodOrder: { bookingId: { in: bookingIds } } },
      });
      await tx.foodOrder.deleteMany({ where: { bookingId: { in: bookingIds } } });
      await tx.invoice.deleteMany({ where: { bookingId: { in: bookingIds } } });
      await tx.booking.deleteMany({ where: { id: { in: bookingIds } } });
    }
    await tx.room.deleteMany({ where: { id: { in: roomIds } } });
    await tx.roomImage.deleteMany({ where: { roomTypeId: roomType.id } });
    await tx.roomType.delete({ where: { id: roomType.id } });
  });

  revalidatePath("/admin/rooms");
  redirect("/admin/rooms");
}

// ── Rooms ───────────────────────────────────────────────────────────

export async function createRoomAction(
  roomTypeSlug: string,
  input: RoomFormInput,
): Promise<ActionResult> {
  const parsed = roomSchema.safeParse(input);
  if (!parsed.success) return { error: "Please fix the highlighted fields." };

  const roomType = await db.roomType.findUnique({
    where: { slug: roomTypeSlug },
    select: { id: true },
  });
  if (!roomType) return { error: "Room type not found." };

  try {
    await db.room.create({
      data: { ...parsed.data, roomTypeId: roomType.id },
    });
    revalidatePath(`/admin/rooms/${roomTypeSlug}`);
    return {};
  } catch (error) {
    if (isUniqueError(error)) {
      return { error: "A room with this number already exists." };
    }
    throw error;
  }
}

export async function updateRoomStatusAction(
  id: string,
  roomTypeSlug: string,
  status: string,
): Promise<ActionResult> {
  const parsed = roomStatusSchema.safeParse(status);
  if (!parsed.success) return { error: "Invalid status." };

  await db.room.update({ where: { id }, data: { status: parsed.data } });
  revalidatePath(`/admin/rooms/${roomTypeSlug}`);
  return {};
}

export async function deleteRoomAction(
  id: string,
  roomTypeSlug: string,
): Promise<ActionResult> {
  const room = await db.room.findUnique({ where: { id }, select: { id: true } });
  if (!room) return { error: "Room not found." };

  const activeBookings = await db.booking.count({
    where: { roomId: id, status: { in: [...ACTIVE_BOOKING_STATUSES] } },
  });
  if (activeBookings > 0) {
    return { error: `Cannot delete — this room has ${activeBookings} active booking(s).` };
  }

  await db.$transaction(async (tx) => {
    const historicalBookings = await tx.booking.findMany({
      where: { roomId: id },
      select: { id: true },
    });
    const bookingIds = historicalBookings.map((b) => b.id);
    if (bookingIds.length > 0) {
      await tx.foodOrderItem.deleteMany({
        where: { foodOrder: { bookingId: { in: bookingIds } } },
      });
      await tx.foodOrder.deleteMany({ where: { bookingId: { in: bookingIds } } });
      await tx.invoice.deleteMany({ where: { bookingId: { in: bookingIds } } });
      await tx.booking.deleteMany({ where: { id: { in: bookingIds } } });
    }
    await tx.room.delete({ where: { id } });
  });

  revalidatePath(`/admin/rooms/${roomTypeSlug}`);
  return {};
}
