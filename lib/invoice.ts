import { Prisma } from "@prisma/client";
import { differenceInCalendarDays } from "date-fns";

import { db } from "@/lib/db";
import { getTaxRate, setTaxRate } from "@/lib/settings";

export type InvoiceTotals = {
  nights: number;
  roomTotal: number;
  chargeTotal: number;
  taxableSubtotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  grandTotal: number;
};

export type RoomEntryForInvoice = {
  checkIn: Date;
  checkOut: Date | null;
  ratePerNight: Prisma.Decimal;
  charges: {
    quantity: number;
    priceAtAdd: Prisma.Decimal;
  }[];
};

/** Round to cents — Decimal-friendly money math. */
function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function toDecimal(value: number): Prisma.Decimal {
  return new Prisma.Decimal(value.toFixed(2));
}

/**
 * Pure calculation shared by the invoice page and invoice generation:
 *
 *   roomTotal = nights × ratePerNight            (snapshot from room entry)
 *   chargeTotal = Σ quantity × priceAtAdd        (snapshot per room charge)
 *   taxAmount = (roomTotal + chargeTotal) × taxRate%
 *   grandTotal = roomTotal + chargeTotal + tax − discount
 */
export function computeInvoiceTotals(
  roomEntry: RoomEntryForInvoice,
  taxRate: number,
  discountAmount = 0,
): InvoiceTotals {
  const checkOut = roomEntry.checkOut ?? new Date(roomEntry.checkIn.getTime() + 86400000);
  const nights = Math.max(1, differenceInCalendarDays(checkOut, roomEntry.checkIn));
  const roomTotal = round2(Number(roomEntry.ratePerNight) * nights);
  const chargeTotal = round2(
    roomEntry.charges.reduce(
      (sum, charge) => sum + Number(charge.priceAtAdd) * charge.quantity,
      0,
    ),
  );
  const taxableSubtotal = round2(roomTotal + chargeTotal);
  const taxAmount = round2((taxableSubtotal * taxRate) / 100);
  const discount = round2(Math.max(0, discountAmount));
  const grandTotal = round2(taxableSubtotal + taxAmount - discount);

  return {
    nights,
    roomTotal,
    chargeTotal,
    taxableSubtotal,
    taxRate,
    taxAmount,
    discountAmount: discount,
    grandTotal,
  };
}

type GenerateInvoiceOptions = {
  /** Persists the global tax-rate SiteSetting and uses it for this run. */
  taxRate?: number;
  /** Manual discount for this invoice. Omit to keep the stored value. */
  discountAmount?: number;
};

/**
 * Calculates and stores (upsert) a room entry's Invoice record.
 * Recalculating never wipes manual data: the existing discount is preserved
 * unless one is passed in, and payment fields are left untouched.
 */
export async function generateInvoice(
  roomEntryId: string,
  options: GenerateInvoiceOptions = {},
): Promise<{ id: string; roomEntryId: string }> {
  const roomEntry = await db.roomEntry.findUnique({
    where: { id: roomEntryId },
    include: { charges: true },
  });
  if (!roomEntry) throw new Error("Room entry not found.");

  let taxRate = options.taxRate;
  if (taxRate !== undefined) {
    await setTaxRate(taxRate);
  } else {
    taxRate = await getTaxRate();
  }

  let discount = options.discountAmount;
  if (discount === undefined) {
    const existing = await db.invoice.findUnique({ where: { roomEntryId } });
    discount = existing ? Number(existing.discountAmount) : 0;
  }

  const totals = computeInvoiceTotals(roomEntry, taxRate, discount);

  const invoice = await db.invoice.upsert({
    where: { roomEntryId },
    update: {
      roomTotal: toDecimal(totals.roomTotal),
      chargeTotal: toDecimal(totals.chargeTotal),
      taxAmount: toDecimal(totals.taxAmount),
      discountAmount: toDecimal(totals.discountAmount),
      grandTotal: toDecimal(totals.grandTotal),
      generatedAt: new Date(),
    },
    create: {
      roomEntryId,
      roomTotal: toDecimal(totals.roomTotal),
      chargeTotal: toDecimal(totals.chargeTotal),
      taxAmount: toDecimal(totals.taxAmount),
      discountAmount: toDecimal(totals.discountAmount),
      grandTotal: toDecimal(totals.grandTotal),
    },
  });

  return { id: invoice.id, roomEntryId: invoice.roomEntryId };
}
