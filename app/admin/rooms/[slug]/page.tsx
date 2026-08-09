import Link from "next/link";
import { notFound } from "next/navigation";
import { BedDouble, Pencil, Ruler, Users } from "lucide-react";

import { AddRoomForm } from "@/components/admin/rooms/AddRoomForm";
import { ConfirmButton } from "@/components/admin/rooms/ConfirmButton";
import { RoomStatusSelect } from "@/components/admin/rooms/RoomStatusSelect";
import { db } from "@/lib/db";
import { formatNPR } from "@/lib/format";
import { deleteRoomAction, deleteRoomTypeAction } from "../actions";

export default async function RoomTypeDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const roomType = await db.roomType.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      rooms: { orderBy: { roomNumber: "asc" } },
    },
  });
  if (!roomType) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/rooms"
          className="inline-flex items-center gap-1.5 text-sm text-charcoal/60 transition-colors hover:text-pine"
        >
          ← Room types
        </Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl text-charcoal sm:text-3xl">
              {roomType.name}
            </h1>
            <span
              className={
                roomType.isActive
                  ? "rounded-full bg-pine/10 px-2.5 py-0.5 text-xs font-semibold text-pine"
                  : "rounded-full bg-charcoal/10 px-2.5 py-0.5 text-xs font-semibold text-charcoal/60"
              }
            >
              {roomType.isActive ? "Active" : "Inactive"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/admin/rooms/${roomType.slug}/edit`}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-charcoal/15 px-3 text-sm font-medium text-charcoal/70 transition-colors hover:bg-charcoal/5"
            >
              <Pencil className="size-4" />
              Edit
            </Link>
            <ConfirmButton
              description={`Delete "${roomType.name}"? Its rooms and any historical bookings will be removed too.`}
              onConfirm={deleteRoomTypeAction.bind(null, roomType.slug)}
            />
          </div>
        </div>
      </div>

      {roomType.description ? (
        <p className="max-w-2xl text-sm leading-relaxed text-charcoal/70">
          {roomType.description}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { icon: BedDouble, label: "Price / night", value: formatNPR(Number(roomType.basePrice)) },
          { icon: Users, label: "Max occupancy", value: `${roomType.maxOccupancy} guests` },
          { icon: Ruler, label: "Size", value: roomType.sizeSqft ? `${roomType.sizeSqft} sq ft` : "—" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-3 rounded-xl border border-charcoal/10 bg-white p-4 shadow-sm"
          >
            <span className="flex size-10 items-center justify-center rounded-lg bg-pine/10 text-pine">
              <stat.icon className="size-5" />
            </span>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-charcoal/50">
                {stat.label}
              </p>
              <p className="font-display text-lg text-charcoal">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {roomType.images.length > 0 ? (
        <div className="flex flex-wrap gap-3">
          {roomType.images.map((img) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={img.id}
              src={img.url}
              alt={img.altText ?? ""}
              className="h-24 w-36 rounded-xl border border-charcoal/10 object-cover"
            />
          ))}
        </div>
      ) : null}

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="font-display text-xl text-charcoal">Rooms</h2>
          <p className="text-sm text-charcoal/60">
            {roomType.rooms.length} room{roomType.rooms.length === 1 ? "" : "s"} on this type
          </p>
        </div>

        <AddRoomForm roomTypeSlug={roomType.slug} />

        <div className="overflow-x-auto rounded-xl border border-charcoal/10 bg-white shadow-sm">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="border-b border-charcoal/10 text-xs uppercase tracking-wider text-charcoal/50">
              <tr>
                <th className="px-5 py-3 font-semibold">Room number</th>
                <th className="px-5 py-3 font-semibold">Floor</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal/5">
              {roomType.rooms.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-sm text-charcoal/50">
                    No rooms yet — add the first one above.
                  </td>
                </tr>
              ) : (
                roomType.rooms.map((room) => (
                  <tr key={room.id} className="transition-colors hover:bg-stone/50">
                    <td className="px-5 py-3 font-medium text-charcoal">
                      {room.roomNumber}
                    </td>
                    <td className="px-5 py-3 text-charcoal/70">{room.floor}</td>
                    <td className="px-5 py-3">
                      <RoomStatusSelect
                        roomId={room.id}
                        roomTypeSlug={roomType.slug}
                        status={room.status}
                      />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end">
                        <ConfirmButton
                          label="Remove"
                          confirmLabel="Remove"
                          description={`Remove room ${room.roomNumber}?`}
                          onConfirm={deleteRoomAction.bind(null, room.id, roomType.slug)}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
