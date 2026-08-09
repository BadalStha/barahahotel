import Link from "next/link";
import { BedDouble, Pencil, Plus } from "lucide-react";

import { ActiveToggle } from "@/components/admin/rooms/ActiveToggle";
import { ConfirmButton } from "@/components/admin/rooms/ConfirmButton";
import { db } from "@/lib/db";
import { formatNPR } from "@/lib/format";
import { deleteRoomTypeAction } from "./actions";

export default async function AdminRoomsPage() {
  const roomTypes = await db.roomType.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      _count: { select: { rooms: true } },
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-charcoal sm:text-3xl">
            Room types
          </h1>
          <p className="mt-1 text-sm text-charcoal/60">
            {roomTypes.length} room type{roomTypes.length === 1 ? "" : "s"}
          </p>
        </div>
        <Link
          href="/admin/rooms/new"
          className="inline-flex h-11 items-center gap-2 rounded-full bg-pine px-5 text-sm font-medium text-stone shadow-[0_10px_20px_-10px_rgba(31,77,58,0.6)] transition-colors hover:bg-pine/90"
        >
          <Plus className="size-4" />
          New room type
        </Link>
      </header>

      <div className="overflow-x-auto rounded-xl border border-charcoal/10 bg-white shadow-sm">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-charcoal/10 text-xs uppercase tracking-wider text-charcoal/50">
            <tr>
              <th className="px-5 py-3 font-semibold">Room type</th>
              <th className="px-5 py-3 font-semibold">Price / night</th>
              <th className="px-5 py-3 font-semibold">Occupancy</th>
              <th className="px-5 py-3 font-semibold">Rooms</th>
              <th className="px-5 py-3 font-semibold">Active</th>
              <th className="px-5 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal/5">
            {roomTypes.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-sm text-charcoal/50">
                  No room types yet — create your first one.
                </td>
              </tr>
            ) : (
              roomTypes.map((roomType) => (
                <tr key={roomType.id} className="transition-colors hover:bg-stone/50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {roomType.images[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={roomType.images[0].url}
                          alt=""
                          className="size-11 shrink-0 rounded-lg border border-charcoal/10 object-cover"
                        />
                      ) : (
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-pine/10 text-pine">
                          <BedDouble className="size-5" />
                        </div>
                      )}
                      <div>
                        <Link
                          href={`/admin/rooms/${roomType.slug}`}
                          className="font-medium text-charcoal transition-colors hover:text-pine"
                        >
                          {roomType.name}
                        </Link>
                        <p className="text-xs text-charcoal/50">{roomType.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-charcoal/80">
                    {formatNPR(Number(roomType.basePrice))}
                  </td>
                  <td className="px-5 py-3 text-charcoal/80">
                    {roomType.maxOccupancy} guests
                  </td>
                  <td className="px-5 py-3 text-charcoal/80">
                    {roomType._count.rooms}
                  </td>
                  <td className="px-5 py-3">
                    <ActiveToggle slug={roomType.slug} isActive={roomType.isActive} />
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/rooms/${roomType.slug}/edit`}
                        className="inline-flex h-9 items-center gap-2 rounded-lg border border-charcoal/15 px-3 text-sm font-medium text-charcoal/70 transition-colors hover:bg-charcoal/5"
                      >
                        <Pencil className="size-4" />
                        Edit
                      </Link>
                      <ConfirmButton
                        description={`Delete "${roomType.name}" and its rooms?`}
                        onConfirm={deleteRoomTypeAction.bind(null, roomType.slug)}
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
