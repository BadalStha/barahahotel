import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

import { RoomBoard } from "@/components/admin/RoomBoard";

export default async function AdminDashboardPage() {
  const session = await auth();

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
    ratePerNight: String(entry.ratePerNight),
    room: {
      ...entry.room,
      roomType: {
        ...entry.room.roomType,
        basePrice: String(entry.room.roomType.basePrice),
      },
    },
  })) as unknown as Parameters<typeof RoomBoard>[0]["activeEntries"];

  return (
    <RoomBoard user={user} rooms={mappedRooms} activeEntries={mappedEntries} />
  );
}
