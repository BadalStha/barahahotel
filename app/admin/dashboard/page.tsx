import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

import { HistoryToolbar } from "@/components/admin/HistoryToolbar";
import { RoomBoard } from "@/components/admin/RoomBoard";

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ pruned?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;
  const pruned = params.pruned !== undefined ? Number(params.pruned) : undefined;

  const [rooms, activeEntries] = await Promise.all([
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

  return (
    <div className="flex flex-col gap-6">
      <HistoryToolbar
        pruned={pruned !== undefined && Number.isFinite(pruned) ? pruned : undefined}
      />
      <RoomBoard user={user} rooms={mappedRooms} activeEntries={mappedEntries} />
    </div>
  );
}
