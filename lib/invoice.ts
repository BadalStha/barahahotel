import { Prisma } from "@prisma/client";
import { differenceInCalendarDays } from "date-fns";

import { db } from "@/lib/db";
import { getTaxRate, setTaxRate } from "@/lib/settings";

export type InvoiceTotals = {
  nights: number;
  roomTotal: number;
  foodTotal: number;
  taxableSubtotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  grandTotal: number;
};

export type BookingForInvoice = {
  checkIn: Date;
  checkOut: Date;
  roomRateAtBooking: Prisma.Decimal;
  foodOrders: {
    items: { quantity: number; priceAtOrder: Prisma.Decimal }[];
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
 *   roomTotal = nights × roomRateAtBooking        (snapshot from booking)
 *   foodTotal = Σ quantity × priceAtOrder         (snapshot per order item)
 *   taxAmount = (roomTotal + foodTotal) × taxRate%
 *   grandTotal = roomTotal + foodTotal + tax − discount
 */
export function computeInvoiceTotals(
  booking: BookingForInvoice,
  taxRate: number,
  discountAmount = 0,
): InvoiceTotals {
  const nights = Math.max(
    1,
    differenceInCalendarDays(booking.checkOut, booking.checkIn),
  );
  const roomTotal = round2(Number(booking.roomRateAtBooking) * nights);
  const foodTotal = round2(
    booking.foodOrders.reduce(
      (sum, order) =>
        sum +
        order.items.reduce(
          (s, item) => s + Number(item.priceAtOrder) * item.quantity,
          0,
        ),
      0,
    ),
  );
  const taxableSubtotal = round2(roomTotal + foodTotal);
  const taxAmount = round2((taxableSubtotal * taxRate) / 100);
  const discount = round2(Math.max(0, discountAmount));
  const grandTotal = round2(taxableSubtotal + taxAmount - discount);

  return {
    nights,
    roomTotal,
    foodTotal,
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
 * Calculates and stores (upsert) a booking's Invoice record.
 * Recalculating never wipes manual data: the existing discount is preserved
 * unless one is passed in, and payment fields are left untouched.
 */
export async function generateInvoice(
  bookingId: string,
  options: GenerateInvoiceOptions = {},
): Promise<{ id: string; bookingId: string }> {
  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    include: { foodOrders: { include: { items: true } } },
  });
  if (!booking) throw new Error("Booking not found.");

  let taxRate = options.taxRate;
  if (taxRate !== undefined) {
    await setTaxRate(taxRate);
  } else {
    taxRate = await getTaxRate();
  }

  let discount = options.discountAmount;
  if (discount === undefined) {
    const existing = await db.invoice.findUnique({ where: { bookingId } });
    discount = existing ? Number(existing.discountAmount) : 0;
  }

  const totals = computeInvoiceTotals(booking, taxRate, discount);

  const invoice = await db.invoice.upsert({
    where: { bookingId },
    update: {
      roomTotal: toDecimal(totals.roomTotal),
      foodTotal: toDecimal(totals.foodTotal),
      taxAmount: toDecimal(totals.taxAmount),
      discountAmount: toDecimal(totals.discountAmount),
      grandTotal: toDecimal(totals.grandTotal),
      generatedAt: new Date(),
    },
    create: {
      bookingId,
      roomTotal: toDecimal(totals.roomTotal),
      foodTotal: toDecimal(totals.foodTotal),
      taxAmount: toDecimal(totals.taxAmount),
      discountAmount: toDecimal(totals.discountAmount),
      grandTotal: toDecimal(totals.grandTotal),
    },
  });

  return { id: invoice.id, bookingId: invoice.bookingId };
}
