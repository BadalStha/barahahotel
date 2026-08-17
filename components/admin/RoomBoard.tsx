"use client";

import { useMemo, useState } from "react";
import { BedDouble, DollarSign, Users } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatNPR } from "@/lib/format";
import { RoomDetailDialog } from "@/components/admin/RoomDetailDialog";

type PrismaRoom = {
  id: string;
  roomNumber: string;
  status: string;
  roomType: { name: string; basePrice: string };
};

type PrismaRoomEntry = {
  id: string;
  guestName: string;
  guestPhone: string | null;
  numGuests: number;
  checkIn: Date;
  checkOut: Date | null;
  ratePerNight: string;
  status: string;
  notes: string | null;
  charges: {
    id: string;
    itemName: string;
    quantity: number;
    priceAtAdd: string;
  }[];
  invoice: {
    id: string;
    roomTotal: string;
    chargeTotal: string;
    taxAmount: string;
    discountAmount: string;
    grandTotal: string;
    paymentStatus: string;
  } | null;
  room: PrismaRoom;
};

type Props = {
  user: {
    name: string | null;
    email: string | null;
    role: string;
  };
  rooms: PrismaRoom[];
  activeEntries: PrismaRoomEntry[];
};

export function RoomBoard({ user, rooms, activeEntries }: Props) {
  const [selectedRoom, setSelectedRoom] = useState<PrismaRoom | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<PrismaRoomEntry | undefined>();

  const activeEntryMap = useMemo(
    () => new Map(activeEntries.map((e) => [e.room.id, e])),
    [activeEntries],
  );

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-2xl text-charcoal sm:text-3xl">Room board</h1>
        <p className="mt-1 text-sm text-charcoal/60">
          {user.name ?? user.email}
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-charcoal/10 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-charcoal/50">
            Rooms total
          </p>
          <p className="mt-2 font-display text-3xl text-charcoal">{rooms.length}</p>
        </div>
        <div className="rounded-xl border border-terracotta/20 bg-terracotta/5 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-terracotta/70">
            Occupied now
          </p>
          <p className="mt-2 font-display text-3xl text-terracotta">
            {activeEntries.length}
          </p>
        </div>
        <div className="rounded-xl border border-charcoal/10 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-charcoal/50">
            Vacant now
          </p>
          <p className="mt-2 font-display text-3xl text-charcoal">
            {rooms.length - activeEntries.length}
          </p>
        </div>
      </div>

      <section className="rounded-xl border border-charcoal/10 bg-white shadow-sm">
        <div className="border-b border-charcoal/10 px-5 py-4">
          <h2 className="font-display text-lg text-charcoal">All rooms</h2>
        </div>
        <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {rooms.map((room) => {
            const entry = activeEntryMap.get(room.id);
            const isOccupied = room.status === "OCCUPIED" && !!entry;
            const isVacant = room.status === "AVAILABLE";

            return (
              <button
                key={room.id}
                type="button"
                onClick={() => {
                  setSelectedRoom(room);
                  setSelectedEntry(entry);
                }}
                className={cn(
                  "flex flex-col gap-3 rounded-xl border p-4 text-left transition-colors hover:shadow-md",
                  isOccupied
                    ? "border-terracotta/40 bg-terracotta/10"
                    : isVacant
                      ? "border-pine/30 bg-pine/5"
                      : "border-charcoal/10 bg-charcoal/5",
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BedDouble className="size-5 text-pine" />
                    <span className="font-display text-lg text-charcoal">
                      Room {room.roomNumber}
                    </span>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                      isOccupied
                        ? "bg-terracotta/20 text-terracotta"
                        : isVacant
                          ? "bg-pine/15 text-pine"
                          : "bg-charcoal/10 text-charcoal/60",
                    )}
                  >
                    {isOccupied ? "Occupied" : isVacant ? "Vacant" : room.status}
                  </span>
                </div>
                <p className="text-xs text-charcoal/60">{room.roomType.name}</p>

                {isOccupied && entry ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-1.5 text-sm text-charcoal/80">
                      <Users className="size-3.5 text-terracotta" />
                      <span className="font-medium">{entry.guestName}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-charcoal/60">
                      <DollarSign className="size-3.5" />
                      <span>{formatNPR(Number(entry.ratePerNight))} / night</span>
                    </div>
                    {entry.charges.length > 0 ? (
                      <p className="text-xs text-charcoal/60">
                        {entry.charges.length} charge{entry.charges.length === 1 ? "" : "s"} added
                      </p>
                    ) : null}
                  </div>
                ) : isVacant ? (
                  <p className="text-xs text-pine/80">Tap to check in</p>
                ) : (
                  <p className="text-xs text-charcoal/50">Not available</p>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {selectedRoom && (
        <RoomDetailDialog
          room={selectedRoom}
          entry={selectedEntry}
          onClose={() => {
            setSelectedRoom(null);
            setSelectedEntry(undefined);
          }}
        />
      )}
    </div>
  );
}
