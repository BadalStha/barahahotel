import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

import { HistoryToolbar } from "@/components/admin/HistoryToolbar";
import {
  ReservationsSection,
  type BookingView,
} from "@/components/admin/ReservationsSection";
import { RoomBoard } from "@/components/admin/RoomBoard";

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ pruned?: string; booked?: string; error?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;
  const pruned = params.pruned !== undefined ? Number(params.pruned) : undefined;

  const weekOut = new Date();
  weekOut.setDate(weekOut.getDate() + 7);
  weekOut.setHours(23, 59, 59, 999);

  const [rooms, activeEntries, menuItems, upcomingRaw, roomTypes] =
    await Promise.all([
      db.room.findMany({
        orderBy: { roomNumber: "asc" },
        include: { roomType: true },
      }),
      db.roomEntry.findMany({
        where: { status: "OCCUPIED" },
        include: {
          room: { include: { roomType: true } },
          charges: { orderBy: { addedAt: "asc" } },
          invoice: true,
        },
        orderBy: { checkIn: "desc" },
      }),
      db.menuItem.findMany({
        where: { isAvailable: true },
        orderBy: [{ category: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
      }),
      db.reservation.findMany({
        where: { status: "BOOKED", arrivalDate: { lte: weekOut } },
        include: {
          roomType: { select: { name: true } },
          room: { select: { roomNumber: true } },
        },
        orderBy: { arrivalDate: "asc" },
      }),
      db.roomType.findMany({
        where: { isActive: true },
        orderBy: { basePrice: "asc" },
        select: { id: true, name: true },
      }),
    ]);

  const user = {
    name: session?.user?.name ?? null,
    email: session?.user?.email ?? null,
    role: session?.user?.role ?? "STAFF",
  };

  const mappedRooms = rooms.map((room) => ({
    ...room,
    roomType: {
      ...room.roomType,
      basePrice: String(room.roomType.basePrice),
    },
  })) as unknown as Parameters<typeof RoomBoard>[0]["rooms"];

  const mappedEntries = activeEntries.map((entry) => ({
    ...entry,
    ratePerNight: entry.ratePerNight.toString(),
    charges: entry.charges.map((charge) => ({
      ...charge,
      priceAtAdd: charge.priceAtAdd.toString(),
    })),
    invoice: entry.invoice
      ? {
          ...entry.invoice,
          roomTotal: entry.invoice.roomTotal.toString(),
          chargeTotal: entry.invoice.chargeTotal.toString(),
          taxAmount: entry.invoice.taxAmount.toString(),
          discountAmount: entry.invoice.discountAmount.toString(),
          grandTotal: entry.invoice.grandTotal.toString(),
        }
      : null,
    room: {
      ...entry.room,
      roomType: {
        ...entry.room.roomType,
        basePrice: entry.room.roomType.basePrice.toString(),
      },
    },
  })) as unknown as Parameters<typeof RoomBoard>[0]["activeEntries"];

  const mappedMenuItems = menuItems.map((item) => ({
    id: item.id,
    name: item.name,
    price: item.price.toString(),
    category: item.category,
  }));

  const bookings: BookingView[] = upcomingRaw.map((r) => ({
    id: r.id,
    guestName: r.guestName,
    guestPhone: r.guestPhone,
    numGuests: r.numGuests,
    roomTypeId: r.roomTypeId,
    roomTypeName: r.roomType.name,
    roomId: r.roomId,
    roomNumber: r.room?.roomNumber ?? null,
    arrivalDate: r.arrivalDate,
    nights: r.nights,
    notes: r.notes,
  }));

  // "Reserved" marks for the room cards (plain strings — client-safe).
  const reservedMarks = upcomingRaw.map((r) => ({
    roomTypeId: r.roomTypeId,
    roomId: r.roomId,
    arrivalDate: r.arrivalDate.toISOString(),
    guestName: r.guestName,
  }));

  return (
    <div className="flex flex-col gap-6">
      <HistoryToolbar
        pruned={pruned !== undefined && Number.isFinite(pruned) ? pruned : undefined}
      />
      <ReservationsSection
        bookings={bookings}
        roomTypes={roomTypes}
        rooms={rooms.map((r) => ({
          id: r.id,
          roomNumber: r.roomNumber,
          roomTypeId: r.roomTypeId,
          status: r.status,
        }))}
        justBooked={params.booked === "1"}
        bookingError={params.error === "booking"}
      />
      <RoomBoard
        user={user}
        rooms={mappedRooms}
        activeEntries={mappedEntries}
        menuItems={mappedMenuItems}
        reservedMarks={reservedMarks}
      />
    </div>
  );
}
