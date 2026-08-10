import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  FileText,
  MapPin,
  Phone,
  Plus,
  User,
} from "lucide-react";

import { BookingStatusActions } from "@/components/admin/bookings/BookingStatusActions";
import { StatusBadge } from "@/components/admin/bookings/StatusBadge";
import { db } from "@/lib/db";
import { formatDate, formatNPR } from "@/lib/format";

const SOURCE_LABELS = {
  WEBSITE: "Website",
  WALK_IN: "Walk-in",
  PHONE: "Phone",
} as const;

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const booking = await db.booking.findUnique({
    where: { id },
    include: {
      guest: true,
      room: { include: { roomType: true } },
      invoice: true,
      foodOrders: {
        orderBy: { orderedAt: "desc" },
        include: {
          items: { include: { foodMenuItem: true } },
        },
      },
    },
  });
  if (!booking) notFound();

  const nights = Math.max(
    1,
    Math.round(
      (booking.checkOut.getTime() - booking.checkIn.getTime()) /
        (24 * 60 * 60 * 1000),
    ),
  );
  const roomTotal = Number(booking.roomRateAtBooking) * nights;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/bookings"
          className="inline-flex items-center gap-1.5 text-sm text-charcoal/60 transition-colors hover:text-pine"
        >
          <ArrowLeft className="size-4" />
          Bookings
        </Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-mono text-2xl text-charcoal sm:text-3xl">
              {booking.bookingCode}
            </h1>
            <StatusBadge status={booking.status} />
            <span className="rounded-full bg-charcoal/5 px-2.5 py-0.5 text-xs font-medium text-charcoal/60">
              {SOURCE_LABELS[booking.source]}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/admin/bookings/${booking.id}/food-order`}
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-pine px-3 text-sm font-medium text-stone transition-colors hover:bg-pine/90"
            >
              <Plus className="size-4" />
              Add food order
            </Link>
            <Link
              href={`/admin/bookings/${booking.id}/invoice`}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-charcoal/15 px-3 text-sm font-medium text-charcoal/70 transition-colors hover:bg-charcoal/5"
            >
              <FileText className="size-4" />
              Invoice
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Guest */}
        <section className="rounded-xl border border-charcoal/10 bg-white p-5 shadow-sm">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-charcoal/50">
            <User className="size-4" /> Guest
          </h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-charcoal/60">Name</dt>
              <dd className="font-medium text-charcoal">
                {booking.guest.fullName}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-charcoal/60">Email</dt>
              <dd className="text-charcoal">
                {booking.guest.email ?? "—"}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="flex items-center gap-1 text-charcoal/60">
                <Phone className="size-3.5" /> Phone
              </dt>
              <dd className="text-charcoal">
                {booking.guest.phone ?? "—"}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="flex items-center gap-1 text-charcoal/60">
                <MapPin className="size-3.5" /> Address
              </dt>
              <dd className="text-right text-charcoal">
                {booking.guest.address ?? "—"}
              </dd>
            </div>
          </dl>
        </section>

        {/* Stay */}
        <section className="rounded-xl border border-charcoal/10 bg-white p-5 shadow-sm">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-charcoal/50">
            <CalendarDays className="size-4" /> Stay
          </h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-charcoal/60">Room</dt>
              <dd className="font-medium text-charcoal">
                {booking.room.roomNumber}{" "}
                <span className="font-normal text-charcoal/60">
                  ({booking.room.roomType.name} · floor {booking.room.floor})
                </span>
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-charcoal/60">Check-in</dt>
              <dd className="text-charcoal">{formatDate(booking.checkIn)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-charcoal/60">Check-out</dt>
              <dd className="text-charcoal">{formatDate(booking.checkOut)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-charcoal/60">Nights</dt>
              <dd className="text-charcoal">{nights}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-charcoal/60">Guests</dt>
              <dd className="text-charcoal">{booking.numGuests}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-charcoal/60">Rate / night</dt>
              <dd className="text-charcoal">
                {formatNPR(Number(booking.roomRateAtBooking))}
              </dd>
            </div>
            <div className="flex justify-between gap-4 border-t border-charcoal/10 pt-2 font-semibold text-charcoal">
              <dt>Room total</dt>
              <dd>{formatNPR(roomTotal)}</dd>
            </div>
            {booking.notes ? (
              <div className="rounded-lg bg-stone px-3 py-2 text-xs text-charcoal/70">
                <span className="font-medium text-charcoal/80">Notes: </span>
                {booking.notes}
              </div>
            ) : null}
          </dl>
        </section>
      </div>

      {/* Status actions */}
      <section className="rounded-xl border border-charcoal/10 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-charcoal/50">
          Update status
        </h2>
        <p className="mt-1 text-xs text-charcoal/50">
          Check-in marks the room as occupied; check-out frees it.
        </p>
        <div className="mt-3">
          <BookingStatusActions
            bookingId={booking.id}
            status={booking.status}
          />
        </div>
      </section>

      {/* Billing */}
      <section className="rounded-xl border border-charcoal/10 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-charcoal/50">
              Billing
            </h2>
            {booking.invoice ? (
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <span className="font-display text-xl text-charcoal">
                  {formatNPR(Number(booking.invoice.grandTotal))}
                </span>
                <span
                  className={
                    booking.invoice.paymentStatus === "PAID"
                      ? "rounded-full bg-pine/10 px-2.5 py-0.5 text-xs font-semibold text-pine"
                      : booking.invoice.paymentStatus === "PARTIAL"
                        ? "rounded-full bg-saffron/20 px-2.5 py-0.5 text-xs font-semibold text-charcoal"
                        : "rounded-full bg-terracotta/10 px-2.5 py-0.5 text-xs font-semibold text-terracotta"
                  }
                >
                  {booking.invoice.paymentStatus.replace("_", " ").toLowerCase()}
                </span>
                {booking.invoice.paymentMethod ? (
                  <span className="text-xs text-charcoal/50">
                    via {booking.invoice.paymentMethod}
                  </span>
                ) : null}
              </div>
            ) : (
              <p className="mt-1 text-sm text-charcoal/50">
                No invoice generated yet.
              </p>
            )}
          </div>
          <Link
            href={`/admin/bookings/${booking.id}/invoice`}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-pine/40 px-3 text-sm font-medium text-pine transition-colors hover:bg-pine/10"
          >
            <FileText className="size-4" />
            {booking.invoice ? "View invoice" : "Generate invoice"}
          </Link>
        </div>
      </section>

      {/* Food orders */}
      <section className="rounded-xl border border-charcoal/10 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-charcoal/50">
            Food orders ({booking.foodOrders.length})
          </h2>
          <Link
            href={`/admin/bookings/${booking.id}/food-order`}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-charcoal/15 px-3 text-xs font-medium text-charcoal/70 transition-colors hover:bg-charcoal/5"
          >
            <Plus className="size-3.5" />
            Add order
          </Link>
        </div>
        {booking.foodOrders.length === 0 ? (
          <p className="mt-3 text-sm text-charcoal/50">
            No food orders for this booking yet.
          </p>
        ) : (
          <ul className="mt-3 flex flex-col gap-3">
            {booking.foodOrders.map((order) => {
              const total = order.items.reduce(
                (sum, item) =>
                  sum + Number(item.priceAtOrder) * item.quantity,
                0,
              );
              return (
                <li
                  key={order.id}
                  className="rounded-lg border border-charcoal/10 p-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="font-medium text-charcoal">
                      {formatDate(order.orderedAt)}
                    </span>
                    <span className="flex items-center gap-2">
                      <span
                        className={
                          order.status === "DELIVERED"
                            ? "rounded-full bg-pine/10 px-2 py-0.5 text-xs font-semibold text-pine"
                            : order.status === "CANCELLED"
                              ? "rounded-full bg-charcoal/10 px-2 py-0.5 text-xs font-semibold text-charcoal/60"
                              : "rounded-full bg-saffron/20 px-2 py-0.5 text-xs font-semibold text-charcoal"
                        }
                      >
                        {order.status.charAt(0) +
                          order.status.slice(1).toLowerCase()}
                      </span>
                      <span className="font-semibold text-charcoal">
                        {formatNPR(total)}
                      </span>
                    </span>
                  </div>
                  <ul className="mt-2 flex flex-col gap-1 text-xs text-charcoal/70">
                    {order.items.map((item) => (
                      <li
                        key={item.id}
                        className="flex justify-between gap-2"
                      >
                        <span>
                          {item.quantity} × {item.foodMenuItem.name}
                        </span>
                        <span>
                          {formatNPR(Number(item.priceAtOrder) * item.quantity)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
