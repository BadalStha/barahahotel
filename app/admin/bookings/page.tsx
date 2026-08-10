import Link from "next/link";
import type { BookingStatus } from "@prisma/client";
import { CalendarRange, Plus } from "lucide-react";

import { EmptyState } from "@/components/admin/EmptyState";
import { StatusBadge } from "@/components/admin/bookings/StatusBadge";
import { db } from "@/lib/db";
import { formatDateShort } from "@/lib/format";
import { cn } from "@/lib/utils";

const STATUSES: BookingStatus[] = [
  "PENDING",
  "CONFIRMED",
  "CHECKED_IN",
  "CHECKED_OUT",
  "CANCELLED",
];

const SOURCE_LABELS = {
  WEBSITE: "Website",
  WALK_IN: "Walk-in",
  PHONE: "Phone",
} as const;

function parseDate(value: string | string[] | undefined): string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return "";
  return value;
}

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const statusParam = typeof params.status === "string" ? params.status : "";
  const status = STATUSES.includes(statusParam as BookingStatus)
    ? (statusParam as BookingStatus)
    : undefined;
  const from = parseDate(params.from);
  const to = parseDate(params.to);
  const hasFilters = !!(status || from || to);

  const bookings = await db.booking.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(from || to
        ? {
            checkIn: {
              ...(from ? { gte: new Date(`${from}T00:00:00`) } : {}),
              ...(to ? { lte: new Date(`${to}T23:59:59`) } : {}),
            },
          }
        : {}),
    },
    include: {
      guest: { select: { fullName: true } },
      room: {
        select: { roomNumber: true, roomType: { select: { name: true } } },
      },
    },
    orderBy: [{ checkIn: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-charcoal sm:text-3xl">
            Bookings
          </h1>
          <p className="mt-1 text-sm text-charcoal/60">
            {bookings.length} booking{bookings.length === 1 ? "" : "s"}
          </p>
        </div>
        <Link
          href="/admin/bookings/new"
          className="inline-flex h-11 items-center gap-2 rounded-full bg-pine px-5 text-sm font-medium text-stone shadow-[0_10px_20px_-10px_rgba(31,77,58,0.6)] transition-colors hover:bg-pine/90"
        >
          <Plus className="size-4" />
          New booking
        </Link>
      </header>

      {/* Filters */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {[undefined, ...STATUSES].map((s) => {
            const href = s
              ? `/admin/bookings?status=${s}${from ? `&from=${from}` : ""}${to ? `&to=${to}` : ""}`
              : `/admin/bookings${from ? `?from=${from}` : ""}${to ? `&to=${to}` : ""}`;
            return (
              <Link
                key={s ?? "all"}
                href={href}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  status === s
                    ? "bg-pine text-stone"
                    : "bg-white text-charcoal/70 ring-1 ring-charcoal/10 hover:bg-charcoal/5",
                )}
              >
                {s ? (
                  <span className="capitalize">{s.toLowerCase().replace("_", " ")}</span>
                ) : (
                  "All"
                )}
              </Link>
            );
          })}
        </div>

        <form
          action="/admin/bookings"
          method="get"
          className="flex flex-wrap items-end gap-2"
        >
          {status ? <input type="hidden" name="status" value={status} /> : null}
          <label className="flex flex-col gap-1 text-xs font-medium text-charcoal/70">
            From
            <input
              type="date"
              name="from"
              defaultValue={from}
              className="h-9 rounded-lg border border-charcoal/15 bg-white px-2 text-sm text-charcoal outline-none focus:border-pine"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-charcoal/70">
            To
            <input
              type="date"
              name="to"
              defaultValue={to}
              className="h-9 rounded-lg border border-charcoal/15 bg-white px-2 text-sm text-charcoal outline-none focus:border-pine"
            />
          </label>
          <button
            type="submit"
            className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-charcoal/15 px-3 text-sm font-medium text-charcoal/80 transition-colors hover:bg-charcoal/5"
          >
            <CalendarRange className="size-4" />
            Filter
          </button>
        </form>
      </div>

      {bookings.length === 0 ? (
        <EmptyState
          icon={CalendarRange}
          title={
            hasFilters ? "No bookings match these filters" : "No bookings yet"
          }
          description={
            hasFilters
              ? "Try widening your date range or clearing the status filter."
              : "Create your first booking, or wait for guests to reserve on the website — bookings appear here automatically."
          }
          action={
            hasFilters ? (
              <Link
                href="/admin/bookings"
                className="inline-flex h-10 items-center gap-2 rounded-full border border-pine/40 px-5 text-sm font-medium text-pine transition-colors hover:bg-pine/10"
              >
                Clear filters
              </Link>
            ) : (
              <Link
                href="/admin/bookings/new"
                className="inline-flex h-10 items-center gap-2 rounded-full bg-pine px-5 text-sm font-medium text-stone transition-colors hover:bg-pine/90"
              >
                <Plus className="size-4" />
                New booking
              </Link>
            )
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-charcoal/10 bg-white shadow-sm">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-charcoal/10 text-xs uppercase tracking-wider text-charcoal/50">
              <tr>
                <th className="px-5 py-3 font-semibold">Code</th>
                <th className="px-5 py-3 font-semibold">Guest</th>
                <th className="px-5 py-3 font-semibold">Room</th>
                <th className="px-5 py-3 font-semibold">Stay</th>
                <th className="px-5 py-3 font-semibold">Source</th>
                <th className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal/5">
              {bookings.map((booking) => (
                <tr key={booking.id} className="transition-colors hover:bg-stone/50">
                  <td className="px-5 py-3">
                    <Link
                      href={`/admin/bookings/${booking.id}`}
                      className="font-mono text-sm font-semibold text-pine transition-colors hover:text-pine/80"
                    >
                      {booking.bookingCode}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-charcoal/80">
                    {booking.guest.fullName}
                  </td>
                  <td className="px-5 py-3 text-charcoal/80">
                    {booking.room.roomNumber}
                    <span className="block text-xs text-charcoal/50">
                      {booking.room.roomType.name}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-charcoal/80">
                    {formatDateShort(booking.checkIn)} →{" "}
                    {formatDateShort(booking.checkOut)}
                    <span className="block text-xs text-charcoal/50">
                      {booking.numGuests} guest{booking.numGuests === 1 ? "" : "s"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-charcoal/60">
                    {SOURCE_LABELS[booking.source]}
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={booking.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
