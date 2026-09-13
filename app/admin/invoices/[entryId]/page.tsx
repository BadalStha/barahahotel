import { notFound } from "next/navigation";
import { format } from "date-fns";

import { PrintButton } from "@/components/admin/PrintButton";
import { db } from "@/lib/db";
import { formatNPR } from "@/lib/format";
import { computeInvoiceTotals } from "@/lib/invoice";
import { getSetting, getSiteSettings, getTaxRate } from "@/lib/settings";

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ entryId: string }>;
}) {
  const { entryId } = await params;
  const [entry, settings] = await Promise.all([
    db.roomEntry.findUnique({
      where: { id: entryId },
      include: {
        room: { include: { roomType: true } },
        charges: { orderBy: { addedAt: "asc" } },
        invoice: true,
      },
    }),
    getSiteSettings(),
  ]);
  if (!entry) notFound();

  const str = (key: string, fallback = "") =>
    getSetting(settings, key, fallback);

  // Stored invoice is the source of truth; compute a live preview when the
  // invoice hasn't been generated yet (e.g. a brand-new stay).
  const taxRate = await getTaxRate();
  const preview = computeInvoiceTotals(entry, taxRate);
  const roomTotal = entry.invoice ? Number(entry.invoice.roomTotal) : preview.roomTotal;
  const chargeTotal = entry.invoice
    ? Number(entry.invoice.chargeTotal)
    : preview.chargeTotal;
  const taxAmount = entry.invoice ? Number(entry.invoice.taxAmount) : preview.taxAmount;
  const discountAmount = entry.invoice
    ? Number(entry.invoice.discountAmount)
    : preview.discountAmount;
  const grandTotal = entry.invoice
    ? Number(entry.invoice.grandTotal)
    : preview.grandTotal;

  const fmtDate = (d: Date) => format(d, "dd MMM yyyy, h:mm a");

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex items-center justify-between print:hidden">
        <h1 className="font-display text-2xl text-charcoal">Invoice</h1>
        <PrintButton />
      </div>

      <div className="overflow-hidden rounded-2xl border border-charcoal/10 bg-white shadow-sm print:border-0 print:shadow-none">
        <div className="border-b border-charcoal/10 px-6 py-5">
          <p className="font-display text-xl text-charcoal">
            {str("hotel_name", "Baraha Hotel and Lodge")}
          </p>
          <p className="mt-1 text-sm text-charcoal/60">
            {str("location", "Bhedetar, Dhankuta, Nepal")}
            {str("phone") ? ` · ${str("phone")}` : ""}
          </p>
        </div>

        <div className="grid gap-1 border-b border-charcoal/10 px-6 py-4 text-sm sm:grid-cols-2">
          <p className="text-charcoal/70">
            Guest:{" "}
            <span className="font-semibold text-charcoal">{entry.guestName}</span>
          </p>
          {entry.guestPhone ? (
            <p className="text-charcoal/70">
              Phone:{" "}
              <span className="font-medium text-charcoal">{entry.guestPhone}</span>
            </p>
          ) : null}
          <p className="text-charcoal/70">
            Room:{" "}
            <span className="font-medium text-charcoal">
              {entry.room.roomNumber} ({entry.room.roomType.name})
            </span>
          </p>
          <p className="text-charcoal/70">
            Guests: <span className="font-medium text-charcoal">{entry.numGuests}</span>
          </p>
          <p className="text-charcoal/70">
            Check-in:{" "}
            <span className="font-medium text-charcoal">{fmtDate(entry.checkIn)}</span>
          </p>
          <p className="text-charcoal/70">
            Check-out:{" "}
            <span className="font-medium text-charcoal">
              {entry.checkOut ? fmtDate(entry.checkOut) : "Still checked in"}
            </span>
          </p>
        </div>

        <div className="px-6 py-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-charcoal/50">
            Room charges
          </h2>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="text-charcoal/80">
              {formatNPR(Number(entry.ratePerNight))} × {preview.nights} night
              {preview.nights === 1 ? "" : "s"}
            </span>
            <span className="font-medium text-charcoal">{formatNPR(roomTotal)}</span>
          </div>
        </div>

        <div className="border-t border-charcoal/10 px-6 py-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-charcoal/50">
            Food &amp; beverage
          </h2>
          {entry.charges.length === 0 ? (
            <p className="mt-2 text-sm text-charcoal/50">No food ordered.</p>
          ) : (
            <ul className="mt-2 divide-y divide-charcoal/5">
              {entry.charges.map((charge) => (
                <li
                  key={charge.id}
                  className="flex items-center justify-between py-1.5 text-sm"
                >
                  <span className="text-charcoal/80">
                    {charge.itemName} × {charge.quantity}
                    <span className="text-charcoal/50">
                      {" "}
                      (@ {formatNPR(Number(charge.priceAtAdd))})
                    </span>
                  </span>
                  <span className="font-medium text-charcoal">
                    {formatNPR(Number(charge.priceAtAdd) * charge.quantity)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-charcoal/10 px-6 py-4">
          <dl className="flex flex-col gap-1.5 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-charcoal/70">Room total</dt>
              <dd className="font-medium text-charcoal">{formatNPR(roomTotal)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-charcoal/70">Food total</dt>
              <dd className="font-medium text-charcoal">{formatNPR(chargeTotal)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-charcoal/70">Tax</dt>
              <dd className="font-medium text-charcoal">{formatNPR(taxAmount)}</dd>
            </div>
            {discountAmount > 0 ? (
              <div className="flex items-center justify-between">
                <dt className="text-charcoal/70">Discount</dt>
                <dd className="font-medium text-pine">
                  −{formatNPR(discountAmount)}
                </dd>
              </div>
            ) : null}
            <div className="mt-1 flex items-center justify-between border-t border-charcoal/10 pt-2">
              <dt className="font-semibold text-charcoal">Grand total</dt>
              <dd className="font-display text-2xl text-charcoal">
                {formatNPR(grandTotal)}
              </dd>
            </div>
          </dl>
          <p className="mt-3 text-sm text-charcoal/60">
            Payment:{" "}
            <span className="font-semibold text-charcoal">
              {entry.invoice?.paymentStatus ?? "UNPAID"}
            </span>
          </p>
        </div>

        <div className="border-t border-charcoal/10 bg-charcoal/[0.02] px-6 py-4">
          <p className="text-xs text-charcoal/50">
            Thank you for staying with us — safe travels from Bhedetar.
          </p>
        </div>
      </div>
    </div>
  );
}
