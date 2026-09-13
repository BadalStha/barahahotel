import Link from "next/link";
import { differenceInCalendarDays, format } from "date-fns";

import { db } from "@/lib/db";
import { formatNPR } from "@/lib/format";
import { cn } from "@/lib/utils";

const HISTORY_LIMIT = 500;

type RangeKey = "this-month" | "last-month" | "all";

const RANGES: { key: RangeKey; label: string }[] = [
  { key: "this-month", label: "This month" },
  { key: "last-month", label: "Last month" },
  { key: "all", label: "All time" },
];

function parseRange(value: string | undefined): RangeKey {
  if (value === "this-month" || value === "last-month" || value === "all") {
    return value;
  }
  return "all";
}

function rangeBounds(range: RangeKey): { gte?: Date; lt?: Date } {
  const now = new Date();
  if (range === "this-month") {
    return { gte: new Date(now.getFullYear(), now.getMonth(), 1) };
  }
  if (range === "last-month") {
    return {
      gte: new Date(now.getFullYear(), now.getMonth() - 1, 1),
      lt: new Date(now.getFullYear(), now.getMonth(), 1),
    };
  }
  return {};
}

const dateLabel = (d: Date) => format(d, "d MMM yyyy");

function paymentBadgeClass(status: string): string {
  if (status === "PAID") return "bg-pine/15 text-pine";
  if (status === "PARTIAL") return "bg-saffron/25 text-charcoal";
  return "bg-terracotta/15 text-terracotta";
}

export default async function BookingHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const params = await searchParams;
  const range = parseRange(params.range);
  const { gte, lt } = rangeBounds(range);

  const stays = await db.roomEntry.findMany({
    where: {
      status: "CHECKED_OUT",
      ...(gte || lt
        ? { checkOut: { ...(gte ? { gte } : {}), ...(lt ? { lt } : {}) } }
        : {}),
    },
    include: {
      room: { include: { roomType: true } },
      invoice: true,
    },
    orderBy: { checkOut: "desc" },
    take: HISTORY_LIMIT + 1,
  });

  const hasMore = stays.length > HISTORY_LIMIT;
  const visible = stays.slice(0, HISTORY_LIMIT);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-2xl text-charcoal sm:text-3xl">
          Booking history
        </h1>
        <p className="mt-1 text-sm text-charcoal/60">
          Every checked-out stay, kept in Postgres — most recent first. Tap a
          stay to open its itemized invoice.
        </p>
      </header>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Date range">
        {RANGES.map((option) => (
          <Link
            key={option.key}
            href={
              option.key === "all"
                ? "/admin/history"
                : `/admin/history?range=${option.key}`
            }
            aria-current={range === option.key ? "page" : undefined}
            className={cn(
              "inline-flex h-12 items-center rounded-xl px-6 text-sm font-semibold transition-colors",
              range === option.key
                ? "bg-pine text-cream"
                : "border border-charcoal/15 bg-white text-charcoal hover:bg-charcoal/5",
            )}
          >
            {option.label}
          </Link>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="rounded-xl border border-charcoal/10 bg-white px-4 py-8 text-center text-sm text-charcoal/50 shadow-sm">
          No completed stays
          {range === "all" ? " yet." : " in this period."} Checked-out stays
          will appear here.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {visible.map((stay) => {
            const nights = stay.checkOut
              ? Math.max(
                  1,
                  differenceInCalendarDays(stay.checkOut, stay.checkIn),
                )
              : 1;
            return (
              <li key={stay.id}>
                <Link
                  href={`/admin/invoices/${stay.id}`}
                  className="flex min-h-16 flex-col gap-1 rounded-xl border border-charcoal/10 bg-white p-4 shadow-sm transition-colors hover:border-pine/40 hover:shadow-md sm:flex-row sm:items-center sm:gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-lg leading-tight text-charcoal">
                      {stay.guestName}
                    </p>
                    <p className="mt-0.5 text-sm text-charcoal/70">
                      Room {stay.room.roomNumber} ({stay.room.roomType.name}) ·{" "}
                      {dateLabel(stay.checkIn)} →{" "}
                      {stay.checkOut
                        ? dateLabel(stay.checkOut)
                        : "checked out"}{" "}
                      · {nights} night{nights === 1 ? "" : "s"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-1">
                    <p className="font-display text-xl text-charcoal">
                      {formatNPR(
                        stay.invoice ? Number(stay.invoice.grandTotal) : 0,
                      )}
                    </p>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                        paymentBadgeClass(
                          stay.invoice?.paymentStatus ?? "UNPAID",
                        ),
                      )}
                    >
                      {stay.invoice?.paymentStatus ?? "UNPAID"}
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <p className="text-xs text-charcoal/50">
        {hasMore
          ? `Showing the ${HISTORY_LIMIT} most recent stays — narrow the date range to find older ones.`
          : `${visible.length} completed ${visible.length === 1 ? "stay" : "stays"}${range === "all" ? "" : " in this period"}.`}
      </p>
    </div>
  );
}
