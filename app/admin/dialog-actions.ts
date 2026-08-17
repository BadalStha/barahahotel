"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { db } from "@/lib/db";
import { generateInvoice } from "@/lib/invoice";

export type ActionResult = { error?: string };

const checkInSchema = z.object({
  roomId: z.string().min(1, "Choose a room"),
  guestName: z.string().trim().min(2, "Enter the guest's name").max(100),
  guestPhone: z.string().trim().max(30).optional().or(z.literal("")),
  numGuests: z.coerce.number().int().min(1).max(20),
  ratePerNight: z.coerce.number().positive().max(9_999_999),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
});

const roomChargeSchema = z.object({
  itemName: z.string().trim().min(1).max(200),
  quantity: z.coerce.number().int().min(1).max(999),
  priceAtAdd: z.coerce.number().positive().max(9_999_999),
});

const invoiceSettingsSchema = z.object({
  taxRate: z.coerce.number().min(0).max(100),
  discountAmount: z.coerce.number().min(0).max(9_999_999).default(0),
  paymentStatus: z.enum(["UNPAID", "PARTIAL", "PAID"]),
  paymentMethod: z.string().trim().max(50).optional().or(z.literal("")),
});

export async function checkInFormAction(formData: FormData): Promise<void> {
  const input = {
    roomId: formData.get("roomId"),
    guestName: formData.get("guestName"),
    guestPhone: formData.get("guestPhone"),
    numGuests: formData.get("numGuests"),
    ratePerNight: formData.get("ratePerNight"),
    notes: formData.get("notes"),
  };
  const parsed = checkInSchema.safeParse(input);
  if (!parsed.success) {
    redirect("/admin/dashboard?error=checkin");
  }

  const room = await db.room.findUnique({
    where: { id: parsed.data.roomId },
    select: { id: true, status: true, roomNumber: true },
  });
  if (!room || room.status !== "AVAILABLE") {
    redirect("/admin/dashboard?error=room_unavailable");
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
  });

  await db.room.update({
    where: { id: parsed.data.roomId },
    data: { status: "OCCUPIED" },
  });

  revalidatePath("/admin/dashboard");
  redirect(`/admin/dashboard?room=${entry.id}`);
}

export async function checkOutFormAction(roomEntryId: string): Promise<void> {
  const entry = await db.roomEntry.findUnique({
    where: { id: roomEntryId },
    select: { id: true, status: true, roomId: true },
  });
  if (!entry || entry.status === "CHECKED_OUT") {
    redirect("/admin/dashboard?error=checkout");
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
  ]);

  await generateInvoice(roomEntryId);

  revalidatePath("/admin/dashboard");
  redirect("/admin/dashboard");
}

export async function addRoomChargeFormAction(
  roomEntryId: string,
  formData: FormData,
): Promise<void> {
  const input = {
    itemName: formData.get("itemName"),
    quantity: formData.get("quantity"),
    priceAtAdd: formData.get("priceAtAdd"),
  };
  const parsed = roomChargeSchema.safeParse(input);
  if (!parsed.success) {
    redirect(`/admin/dashboard?room=${roomEntryId}&error=charge`);
  }

  const entry = await db.roomEntry.findUnique({
    where: { id: roomEntryId },
    select: { id: true, status: true },
  });
  if (!entry || entry.status === "CHECKED_OUT") {
    redirect(`/admin/dashboard?room=${roomEntryId}&error=charge`);
  }

  await db.roomCharge.create({
    data: {
      roomEntryId,
      itemName: parsed.data.itemName,
      quantity: parsed.data.quantity,
      priceAtAdd: parsed.data.priceAtAdd,
    },
  });

  await generateInvoice(roomEntryId);

  revalidatePath("/admin/dashboard");
  redirect(`/admin/dashboard?room=${roomEntryId}`);
}

export async function updateInvoiceFormAction(
  roomEntryId: string,
  formData: FormData,
): Promise<void> {
  const input = {
    taxRate: formData.get("taxRate"),
    discountAmount: formData.get("discountAmount"),
    paymentStatus: formData.get("paymentStatus"),
    paymentMethod: formData.get("paymentMethod"),
  };
  const parsed = invoiceSettingsSchema.safeParse(input);
  if (!parsed.success) {
    redirect(`/admin/dashboard?room=${roomEntryId}&error=invoice`);
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
  redirect(`/admin/dashboard?room=${roomEntryId}`);
}
