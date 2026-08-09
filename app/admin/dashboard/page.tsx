import {
  addDays,
  addMonths,
  differenceInCalendarDays,
  endOfDay,
  format,
  startOfDay,
  startOfMonth,
} from "date-fns";
import { BedDouble, CalendarDays, TrendingUp, type LucideIcon } from "lucide-react";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";

const npr = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "NPR",
  maximumFractionDigits: 0,
});

const statusBadge: Record<string, string> = {
  PENDING: "bg-saffron/25 text-charcoal",
  CONFIRMED: "bg-pine/10 text-pine",
  CHECKED_IN: "bg-terracotta/10 text-terracotta",
  CHECKED_OUT: "bg-mist text-charcoal/60",
  CANCELLED: "bg-charcoal/5 text-charcoal/50",
};

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-xl border border-charcoal/10 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-charcoal/50">
          {label}
        </p>
        <span className="flex size-8 items-center justify-center rounded-lg bg-pine/10 text-pine">
          <Icon className="size-4" />
        </span>
      </div>
      <p className="mt-2 font-display text-3xl text-charcoal">{value}</p>
      <p className="mt-1 text-xs text-charcoal/50">{sub}</p>
    </div>
  );
}

export default async function AdminDashboardPage() {
  const session = await auth();
  const now = new Date();

  const monthStart = startOfMonth(now);
  const nextMonth = addMonths(monthStart, 1);
  const todayStart = startOfDay(now);
  const horizon = endOfDay(addDays(now, 3));

  const [bookingsThisMonth, totalRooms, occupiedRoomGroups, monthBookings, foodRevenueItems, upcoming] =
    await Promise.all([
      db.booking.count({ where: { createdAt: { gte: monthStart } } }),
      db.room.count(),
      db.booking.groupBy({
        by: ["roomId"],
        where: {
          status: { in: ["CONFIRMED", "CHECKED_IN"] },
          checkIn: { lte: now },
          checkOut: { gt: now },
        },
      }),
      db.booking.findMany({
        where: { checkIn: { gte: monthStart, lt: nextMonth } },
        select: { checkIn: true, checkOut: true, roomRateAtBooking: true },
      }),
      db.foodOrderItem.findMany({
        where: { foodOrder: { orderedAt: { gte: monthStart, lt: nextMonth } } },
        select: { priceAtOrder: true, quantity: true },
      }),
      db.booking.findMany({
        where: {
          checkIn: { gte: todayStart, lte: horizon },
          status: { in: ["PENDING", "CONFIRMED"] },
        },
        include: {
          guest: { select: { fullName: true } },
          room: { select: { roomNumber: true } },
        },
        orderBy: { checkIn: "asc" },
      }),
    ]);

  // Revenue this month — approximated by stays that START this month; a
  // stay beginning last month and spanning into this month isn't split
  // across months (known simplification).
  const roomRevenue = monthBookings.reduce((sum, b) => {
    const nights = Math.max(1, differenceInCalendarDays(b.checkOut, b.checkIn));
    return sum + Number(b.roomRateAtBooking) * nights;
  }, 0);
  const foodRevenue = foodRevenueItems.reduce(
    (sum, i) => sum + Number(i.priceAtOrder) * i.quantity,
    0,
  );

  const occupancy =
    totalRooms > 0 ? Math.round((occupiedRoomGroups.length / totalRooms) * 100) : null;

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-2xl text-charcoal sm:text-3xl">Dashboard</h1>
        <p className="mt-1 text-sm text-charcoal/60">
          {format(now, "EEEE, MMMM d, yyyy")} ·{" "}
          {session?.user?.name ?? session?.user?.email}
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          icon={CalendarDays}
          label="Bookings this month"
          value={String(bookingsThisMonth)}
          sub="created since the 1st"
        />
        <StatCard
          icon={BedDouble}
          label="Occupancy today"
          value={occupancy === null ? "—" : `${occupancy}%`}
          sub={
            occupancy === null
              ? "no rooms yet"
              : `${occupiedRoomGroups.length} of ${totalRooms} rooms in use`
          }
        />
        <StatCard
          icon={TrendingUp}
          label="Revenue this month"
          value={npr.format(roomRevenue + foodRevenue)}
          sub={`${npr.format(roomRevenue)} rooms · ${npr.format(foodRevenue)} food`}
        />
      </div>

      <section className="rounded-xl border border-charcoal/10 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-charcoal/10 px-5 py-4">
          <h2 className="font-display text-lg text-charcoal">Upcoming check-ins</h2>
          <span className="text-xs text-charcoal/50">next 3 days</span>
        </div>

        {upcoming.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-charcoal/50">
            No check-ins in the next 3 days.
          </p>
        ) : (
          <ul className="divide-y divide-charcoal/5">
            {upcoming.map((booking) => (
              <li
                key={booking.id}
                className="flex flex-wrap items-center gap-x-6 gap-y-2 px-5 py-3.5"
              >
                <div className="w-36">
                  <p className="text-sm font-medium text-charcoal">
                    {format(booking.checkIn, "EEE, MMM d")}
                  </p>
                  <p className="text-xs text-charcoal/50">
                    {format(booking.checkIn, "HH:mm")}
                  </p>
                </div>
                <div className="min-w-40 flex-1">
                  <p className="text-sm font-medium text-charcoal">
                    {booking.guest.fullName}
                  </p>
                  <p className="text-xs text-charcoal/50">
                    Room {booking.room.roomNumber} ·{" "}
                    {differenceInCalendarDays(booking.checkOut, booking.checkIn)} nights
                  </p>
                </div>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                    statusBadge[booking.status] ?? "bg-mist text-charcoal/60",
                  )}
                >
                  {booking.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
