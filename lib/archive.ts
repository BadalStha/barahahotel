import { differenceInCalendarDays } from "date-fns";

import { db } from "@/lib/db";
import {
  appendChargeRows,
  appendStayHistoryRow,
} from "@/lib/sheets";

/**
 * Stay-history archiving — keeps Postgres small without losing data.
 *
 * Split of responsibilities (see project docs):
 * - Postgres keeps: room types, rooms, menu, CMS, and any stay that is
 *   still active (checked in) or not yet archived.
 * - Google Sheets keeps: every completed stay ("Stay History" sheet, one
 *   row per stay) plus its itemized food lines ("Charges" sheet).
 *
 * A stay is only ever pruned from Postgres after its Sheets archive
 * succeeded (tracked by RoomEntry.archivedAt), so a Sheets outage can
 * never cause data loss — the rows simply stay in Postgres.
 */

/** Days after checkout before an archived stay may be pruned. */
export function getArchiveAfterDays(): number {
  const raw = Number(process.env.ARCHIVE_AFTER_DAYS ?? 30);
  return Number.isFinite(raw) && raw >= 1 ? Math.floor(raw) : 30;
}

/**
 * Archive one checked-out stay to Google Sheets. Non-blocking by design:
 * never throws — returns false when Sheets isn't configured or the write
 * fails, in which case the stay stays in Postgres for a later retry.
 * On success, stamps RoomEntry.archivedAt so the prune job may later
 * remove the row.
 */
export async function archiveStayToSheets(
  roomEntryId: string,
): Promise<boolean> {
  try {
    const entry = await db.roomEntry.findUnique({
      where: { id: roomEntryId },
      include: {
        room: { include: { roomType: true } },
        charges: { orderBy: { addedAt: "asc" } },
        invoice: true,
      },
    });
    if (!entry || entry.status !== "CHECKED_OUT") return false;
    if (entry.archivedAt) return true; // already archived — idempotent
    if (!entry.checkOut) return false;

    const nights = Math.max(
      1,
      differenceInCalendarDays(entry.checkOut, entry.checkIn),
    );
    const now = new Date();

    const foodLines = entry.charges.map((charge) => {
      const unitPrice = Number(charge.priceAtAdd);
      return {
        stayId: entry.id,
        guestName: entry.guestName,
        roomNumber: entry.room.roomNumber,
        itemName: charge.itemName,
        quantity: charge.quantity,
        unitPrice,
        subtotal: Math.round(unitPrice * charge.quantity * 100) / 100,
      };
    });

    const okCharges = await appendChargeRows(foodLines);
    if (!okCharges) return false;

    const okStay = await appendStayHistoryRow({
      stayId: entry.id,
      guestName: entry.guestName,
      phone: entry.guestPhone ?? "",
      guests: entry.numGuests,
      roomNumber: entry.room.roomNumber,
      roomType: entry.room.roomType.name,
      checkIn: entry.checkIn.toISOString(),
      checkOut: entry.checkOut.toISOString(),
      nights,
      ratePerNight: Number(entry.ratePerNight),
      roomTotal: entry.invoice ? Number(entry.invoice.roomTotal) : 0,
      foodTotal: entry.invoice ? Number(entry.invoice.chargeTotal) : 0,
      tax: entry.invoice ? Number(entry.invoice.taxAmount) : 0,
      discount: entry.invoice ? Number(entry.invoice.discountAmount) : 0,
      grandTotal: entry.invoice ? Number(entry.invoice.grandTotal) : 0,
      paymentStatus: entry.invoice ? entry.invoice.paymentStatus : "UNPAID",
      archivedAt: now.toISOString(),
    });
    if (!okStay) return false;

    await db.roomEntry.update({
      where: { id: entry.id },
      data: { archivedAt: now },
    });
    return true;
  } catch (error) {
    console.error("Failed to archive stay to Google Sheets:", error);
    return false;
  }
}

/**
 * Delete completed stays that were archived to Sheets more than
 * ARCHIVE_AFTER_DAYS ago. Only touches rows with archivedAt set, so
 * stays that never reached Sheets are always kept.
 *
 * Returns the number of stays pruned.
 */
export async function pruneArchivedStays(): Promise<number> {
  const afterDays = getArchiveAfterDays();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - afterDays);

  const candidates = await db.roomEntry.findMany({
    where: {
      status: "CHECKED_OUT",
      archivedAt: { not: null },
      checkOut: { lt: cutoff },
    },
    select: { id: true },
  });
  if (candidates.length === 0) return 0;

  let pruned = 0;
  for (const { id } of candidates) {
    try {
      await db.$transaction([
        db.roomCharge.deleteMany({ where: { roomEntryId: id } }),
        db.invoice.deleteMany({ where: { roomEntryId: id } }),
        db.roomEntry.delete({ where: { id } }),
      ]);
      pruned += 1;
    } catch (error) {
      console.error(`Failed to prune archived stay ${id}:`, error);
    }
  }
  return pruned;
}
