"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { db } from "@/lib/db";
import { generateInvoice } from "@/lib/invoice";

export type ActionResult = { error?: string };

export async function checkInAction(input: unknown): Promise<ActionResult> {
  const parsed = checkInSchema.safeParse(input);
  if (!parsed.success) return { error: "Please fix the highlighted fields." };

  const room = await db.room.findUnique({
    where: { id: parsed.data.roomId },
    select: { id: true, status: true, roomNumber: true },
  });
  if (!room) return { error: "Room not found." };
  if (room.status !== "AVAILABLE") {
    return { error: `Room ${room.roomNumber} is not available.` };
  }

  const entry = await db.roomEntry.create({
    data: {
      roomId: parsed.data.roomId,
      guestName: parsed.data.guestName,
      guestPhone: parsed.data.guestPhone || null,
      numGuests: parsed.data.numGuests,
      checkIn: new Date(),
      ratePerNight: parsed.data.ratePerNight,
      notes: parsed.data.notes || null,
    },
    include: { room: { include: { roomType: true } } },
  });

  await db.room.update({
    where: { id: parsed.data.roomId },
    data: { status: "OCCUPIED" },
  });

  // Create the opening invoice right away so the stay always has a bill.
  await generateInvoice(entry.id);

  revalidatePath("/admin/dashboard");
  redirect(`/admin/dashboard?room=${entry.id}`);
}

export async function checkOutAction(
  roomEntryId: string,
): Promise<ActionResult> {
  const entry = await db.roomEntry.findUnique({
    where: { id: roomEntryId },
    select: { id: true, status: true, roomId: true, checkOut: true, checkIn: true, reservationId: true, room: { select: { roomNumber: true } } },
  });
  if (!entry) return { error: "Room entry not found." };
  if (entry.status === "CHECKED_OUT") {
    return { error: "This stay is already checked out." };
  }

  const checkOut = new Date();

  await db.$transaction([
    db.roomEntry.update({
      where: { id: roomEntryId },
      data: { status: "CHECKED_OUT", checkOut },
    }),
    db.room.update({
      where: { id: entry.roomId },
      data: { status: "AVAILABLE" },
    }),
    ...(entry.reservationId
      ? [
          db.reservation.updateMany({
            where: { id: entry.reservationId, status: "CHECKED_IN" },
            data: { status: "COMPLETED" },
          }),
        ]
      : []),
  ]);

  await generateInvoice(roomEntryId);

  revalidatePath("/admin/dashboard");
  redirect("/admin/dashboard");
}

export async function addRoomChargeAction(
  roomEntryId: string,
  input: unknown,
): Promise<ActionResult> {
  const parsed = roomChargeSchema.safeParse(input);
  if (!parsed.success) return { error: "Please fix the highlighted fields." };

  const entry = await db.roomEntry.findUnique({
    where: { id: roomEntryId },
    select: { id: true, status: true },
  });
  if (!entry) return { error: "Room entry not found." };
  if (entry.status === "CHECKED_OUT") {
    return { error: "Cannot add charges to a checked-out stay." };
  }

  // Menu dish is the default path (name + price snapshotted from the
  // MenuItem row); anything else falls back to the custom free-text item.
  let itemName: string;
  let priceAtAdd: number | string;
  let menuItemId: string | null = null;
  if (parsed.data.menuItemId && parsed.data.menuItemId !== "__custom") {
    const menuItem = await db.menuItem.findUnique({
      where: { id: parsed.data.menuItemId },
    });
    if (!menuItem) return { error: "That dish is no longer on the menu." };
    itemName = menuItem.name;
    priceAtAdd = menuItem.price.toString();
    menuItemId = menuItem.id;
  } else {
    if (!parsed.data.itemName) return { error: "Enter an item name." };
    itemName = parsed.data.itemName;
    priceAtAdd = parsed.data.priceAtAdd;
  }

  await db.roomCharge.create({
    data: {
      roomEntryId,
      itemName,
      menuItemId,
      quantity: parsed.data.quantity,
      priceAtAdd,
    },
  });

  await generateInvoice(roomEntryId);

  revalidatePath("/admin/dashboard");
  return {};
}

export async function updateInvoiceAction(
  roomEntryId: string,
  input: unknown,
): Promise<ActionResult> {
  const parsed = invoiceSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Please fix the highlighted fields." };
  }

  const invoice = await generateInvoice(roomEntryId, {
    taxRate: parsed.data.taxRate,
    discountAmount: parsed.data.discountAmount,
  });

  const existing = await db.invoice.findUnique({
    where: { id: invoice.id },
    select: { paidAt: true },
  });

  await db.invoice.update({
    where: { id: invoice.id },
    data: {
      paymentStatus: parsed.data.paymentStatus,
      paymentMethod: parsed.data.paymentMethod || null,
      ...(parsed.data.paymentStatus === "PAID" && !existing?.paidAt
        ? { paidAt: new Date() }
        : {}),
    },
  });

  revalidatePath("/admin/dashboard");
  return {};
}

// ── Validators ───────────────────────────────────────────────────

const checkInSchema = z.object({
  roomId: z.string().min(1, "Choose a room"),
  guestName: z
    .string()
    .trim()
    .min(2, "Enter the guest's name")
    .max(100),
  guestPhone: z
    .string()
    .trim()
    .max(30, "Phone number too long")
    .optional()
    .or(z.literal("")),
  numGuests: z.coerce
    .number({ message: "Enter the number of guests" })
    .int("Whole number")
    .min(1, "At least 1 guest")
    .max(20, "Max 20 guests"),
  ratePerNight: z.coerce
    .number({ message: "Enter a rate" })
    .positive("Rate must be greater than 0")
    .max(9_999_999, "Rate too large"),
  notes: z
    .string()
    .trim()
    .max(1000, "Notes too long")
    .optional()
    .or(z.literal("")),
});

const roomChargeSchema = z
  .object({
    menuItemId: z.string().trim().max(100).optional().or(z.literal("")),
    itemName: z.string().trim().max(200).optional().or(z.literal("")),
    quantity: z.coerce
      .number({ message: "Enter a quantity" })
      .int("Whole number")
      .min(1, "At least 1")
      .max(999, "Max 999"),
    priceAtAdd: z.coerce
      .number({ message: "Enter a price" })
      .positive("Price must be greater than 0")
      .max(9_999_999, "Price too large"),
  })
  .refine(
    (v) =>
      (v.menuItemId !== undefined &&
        v.menuItemId.length > 0 &&
        v.menuItemId !== "__custom") ||
      (v.itemName !== undefined && v.itemName.length > 0),
    {
      message: "Pick a dish or enter a custom item",
      path: ["itemName"],
    },
  );

const invoiceSettingsSchema = z.object({
  taxRate: z.coerce
    .number({ message: "Enter a tax rate" })
    .min(0, "Tax rate can't be negative")
    .max(100, "Max 100%"),
  discountAmount: z.coerce
    .number({ message: "Enter a discount" })
    .min(0, "Discount can't be negative")
    .max(9_999_999, "Discount too large")
    .default(0),
  paymentStatus: z.enum(["UNPAID", "PARTIAL", "PAID"] as const),
  paymentMethod: z
    .string()
    .trim()
    .max(50, "Max 50 characters")
    .optional()
    .or(z.literal("")),
});
