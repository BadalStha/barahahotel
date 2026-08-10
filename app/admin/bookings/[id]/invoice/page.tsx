import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mountain } from "lucide-react";

import { InvoiceSettingsForm } from "@/components/admin/bookings/InvoiceSettingsForm";
import { PrintButton } from "@/components/admin/bookings/PrintButton";
import { db } from "@/lib/db";
import { formatDate, formatNPR } from "@/lib/format";
import { computeInvoiceTotals } from "@/lib/invoice";
import { getSiteSettings, getTaxRate } from "@/lib/settings";
import { cn } from "@/lib/utils";

const PAYMENT_BADGE = {
  UNPAID: "bg-terracotta/10 text-terracotta",
  PARTIAL: "bg-saffron/20 text-charcoal",
  PAID: "bg-pine/10 text-pine",
} as const;

const PAYMENT_LABELS = {
  UNPAID: "Unpaid",
  PARTIAL: "Partially paid",
  PAID: "Paid",
} as const;

function TotalRow({
  label,
  value,
  strong = false,
  emphasis = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
  emphasis?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-6 py-1.5",
        strong && "border-t border-charcoal/10 pt-3",
        emphasis && "text-pine",
      )}
    >
      <span
        className={cn(
          "text-sm",
          strong
            ? "font-semibold uppercase tracking-wide text-charcoal"
            : "text-charcoal/70",
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          "tabular-nums",
          strong ? "font-display text-lg text-charcoal" : "text-sm font-medium text-charcoal",
        )}
      >
        {value}
      </span>
    </div>
  );
}

export default async function BookingInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [booking, taxRate, settings] = await Promise.all([
    db.booking.findUnique({
      where: { id },
      include: {
        guest: true,
        room: { include: { roomType: true } },
        invoice: true,
        foodOrders: {
          orderBy: { orderedAt: "asc" },
          include: { items: { include: { foodMenuItem: true } } },
        },
      },
    }),
    getTaxRate(),
    getSiteSettings(),
  ]);
  if (!booking) notFound();

  const hotelName =
    (typeof settings.hotel_name === "string" && settings.hotel_name) ||
    "Baraha Hotel and Lodge";
  const location =
    (typeof settings.location === "string" && settings.location) || "";
  const phone = (typeof settings.phone === "string" && settings.phone) || "";
  const email = (typeof settings.email === "string" && settings.email) || "";

  // Show the stored invoice when it exists; otherwise compute live totals so
  // the screen is useful even before the first "Update invoice" run.
  const invoice = booking.invoice;
  const live = computeInvoiceTotals(booking, taxRate, invoice ? Number(invoice.discountAmount) : 0);
  const totals = invoice
    ? {
        nights: live.nights,
        roomTotal: Number(invoice.roomTotal),
        foodTotal: Number(invoice.foodTotal),
        taxableSubtotal: Number(invoice.roomTotal) + Number(invoice.foodTotal),
        taxRate: live.taxRate,
        taxAmount: Number(invoice.taxAmount),
        discountAmount: Number(invoice.discountAmount),
        grandTotal: Number(invoice.grandTotal),
      }
    : live;

  const nights = totals.nights;
  const invoiceDate = invoice?.generatedAt ?? new Date();

  return (
    <div className="flex flex-col gap-6">
      {/* Toolbar — hidden when printing */}
      <div className="print:hidden">
        <Link
          href={`/admin/bookings/${booking.id}`}
          className="inline-flex items-center gap-1.5 text-sm text-charcoal/60 transition-colors hover:text-pine"
        >
          <ArrowLeft className="size-4" />
          {booking.bookingCode}
        </Link>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-2xl text-charcoal sm:text-3xl">
            Invoice
          </h1>
          <PrintButton />
        </div>
      </div>

      {/* Invoice document */}
      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-xl border border-charcoal/10 bg-white p-6 shadow-sm sm:p-10 print:rounded-none print:border-0 print:shadow-none">
          {/* Letterhead */}
          <div className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-pine pb-6">
            <div className="flex items-start gap-3">
              <span className="flex size-12 items-center justify-center rounded-xl bg-pine text-stone">
                <Mountain className="size-6" />
              </span>
              <div>
                <h2 className="font-display text-2xl leading-tight text-charcoal">
                  {hotelName}
                </h2>
                {location ? (
                  <p className="mt-0.5 text-sm text-charcoal/60">{location}</p>
                ) : null}
                {(phone || email) && (
                  <p className="mt-0.5 text-xs text-charcoal/50">
                    {[phone, email].filter(Boolean).join(" · ")}
                  </p>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pine">
                Tax Invoice
              </p>
              <p className="mt-1 font-mono text-lg text-charcoal">
                {booking.bookingCode}
              </p>
              <p className="text-xs text-charcoal/50">
                {formatDate(invoiceDate)}
              </p>
            </div>
          </div>

          {/* Bill to + stay */}
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-charcoal/50">
                Billed to
              </p>
              <p className="mt-1.5 font-medium text-charcoal">
                {booking.guest.fullName}
              </p>
              {booking.guest.address ? (
                <p className="text-sm text-charcoal/70">{booking.guest.address}</p>
              ) : null}
              {booking.guest.phone ? (
                <p className="text-sm text-charcoal/70">{booking.guest.phone}</p>
              ) : null}
              {booking.guest.email ? (
                <p className="text-sm text-charcoal/70">{booking.guest.email}</p>
              ) : null}
            </div>
            <div className="sm:text-right">
              <p className="text-xs font-semibold uppercase tracking-wider text-charcoal/50">
                Stay
              </p>
              <p className="mt-1.5 text-sm text-charcoal">
                Room {booking.room.roomNumber} · {booking.room.roomType.name}
              </p>
              <p className="text-sm text-charcoal/70">
                {formatDate(booking.checkIn)} → {formatDate(booking.checkOut)}
              </p>
              <p className="text-sm text-charcoal/70">
                {nights} night{nights === 1 ? "" : "s"} · {booking.numGuests}{" "}
                guest{booking.numGuests === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          {/* Itemized charges */}
          <div className="mt-8 overflow-hidden rounded-xl border border-charcoal/10">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-pine text-xs uppercase tracking-wider text-stone">
                  <th className="px-4 py-2.5 font-semibold">Description</th>
                  <th className="px-4 py-2.5 text-center font-semibold">Qty</th>
                  <th className="px-4 py-2.5 text-right font-semibold">Rate</th>
                  <th className="px-4 py-2.5 text-right font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal/5">
                {/* Room charge */}
                <tr>
                  <td className="px-4 py-3">
                    <p className="font-medium text-charcoal">Room charge</p>
                    <p className="text-xs text-charcoal/50">
                      Room {booking.room.roomNumber} · {booking.room.roomType.name}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-center text-charcoal/70">
                    {nights}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-charcoal/70">
                    {formatNPR(Number(booking.roomRateAtBooking))} / night
                  </td>
                  <td className="px-4 py-3 text-right font-medium tabular-nums text-charcoal">
                    {formatNPR(totals.roomTotal)}
                  </td>
                </tr>

                {/* Food orders — one line per order item */}
                {booking.foodOrders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-3 text-charcoal/50">
                      No food orders
                    </td>
                  </tr>
                ) : (
                  <>
                    <tr className="bg-stone/60">
                      <td
                        colSpan={4}
                        className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-charcoal/50"
                      >
                        Food &amp; beverage
                      </td>
                    </tr>
                    {booking.foodOrders.map((order) =>
                      order.items.map((item, index) => (
                        <tr key={item.id}>
                          <td className="px-4 py-2.5">
                            <p className="text-sm text-charcoal">
                              {item.foodMenuItem.name}
                            </p>
                            {index === 0 ? (
                              <p className="text-xs text-charcoal/40">
                                Order · {formatDate(order.orderedAt)}
                              </p>
                            ) : null}
                          </td>
                          <td className="px-4 py-2.5 text-center tabular-nums text-charcoal/70">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-2.5 text-right tabular-nums text-charcoal/70">
                            {formatNPR(Number(item.priceAtOrder))}
                          </td>
                          <td className="px-4 py-2.5 text-right font-medium tabular-nums text-charcoal">
                            {formatNPR(Number(item.priceAtOrder) * item.quantity)}
                          </td>
                        </tr>
                      )),
                    )}
                  </>
                )}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="mt-6 flex justify-end">
            <div className="w-full max-w-xs">
              <TotalRow label="Room subtotal" value={formatNPR(totals.roomTotal)} />
              <TotalRow label="Food subtotal" value={formatNPR(totals.foodTotal)} />
              <TotalRow
                label="Subtotal"
                value={formatNPR(totals.taxableSubtotal)}
                strong
              />
              <TotalRow
                label={`Tax (${totals.taxRate}%)`}
                value={formatNPR(totals.taxAmount)}
              />
              <TotalRow
                label="Discount"
                value={`− ${formatNPR(totals.discountAmount)}`}
              />
              <TotalRow
                label="Grand total"
                value={formatNPR(totals.grandTotal)}
                strong
                emphasis
              />
            </div>
          </div>

          {/* Payment + footer */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-charcoal/10 pt-5">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold",
                  PAYMENT_BADGE[invoice?.paymentStatus ?? "UNPAID"],
                )}
              >
                {PAYMENT_LABELS[invoice?.paymentStatus ?? "UNPAID"]}
              </span>
              {invoice?.paymentMethod ? (
                <span className="text-charcoal/60">
                  via {invoice.paymentMethod}
                </span>
              ) : null}
              {invoice?.paidAt ? (
                <span className="text-xs text-charcoal/50">
                  · paid {formatDate(invoice.paidAt)}
                </span>
              ) : null}
            </div>
            <p className="text-xs text-charcoal/50">
              Generated {formatDate(invoiceDate)}
            </p>
          </div>
          <p className="mt-6 text-center text-sm italic text-charcoal/50">
            Thank you for staying with us — dhanyabad!
          </p>
        </div>
      </div>

      {/* Editable payment + totals — never printed */}
      <div className="mx-auto w-full max-w-3xl print:hidden">
        <InvoiceSettingsForm
          bookingId={booking.id}
          taxRate={totals.taxRate}
          discountAmount={totals.discountAmount}
          paymentStatus={invoice?.paymentStatus ?? "UNPAID"}
          paymentMethod={invoice?.paymentMethod ?? null}
        />
      </div>
    </div>
  );
}
