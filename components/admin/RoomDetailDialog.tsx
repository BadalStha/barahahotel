"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatNPR } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Field, inputClass } from "@/components/admin/fields";
import {
  checkInFormAction,
  checkOutFormAction,
  addRoomChargeFormAction,
} from "@/app/admin/dialog-actions";

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
  room: PrismaRoom;
  entry?: PrismaRoomEntry;
  onClose: () => void;
};

export function RoomDetailDialog({ room, entry, onClose }: Props) {
  const isOccupied = room.status === "OCCUPIED" && !!entry;
  const isVacant = room.status === "AVAILABLE";

  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [numGuests, setNumGuests] = useState(1);
  const [ratePerNight, setRatePerNight] = useState(
    Number(room.roomType.basePrice) || 0,
  );
  const [notes, setNotes] = useState("");

  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [priceAtAdd, setPriceAtAdd] = useState(0);

  const [checkOutConfirm, setCheckOutConfirm] = useState(false);

  const totalCharges = useMemo(
    () =>
      entry
        ? entry.charges.reduce(
            (sum, c) => sum + Number(c.priceAtAdd) * c.quantity,
            0,
          )
        : 0,
    [entry],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-charcoal/10 px-5 py-4">
          <div>
            <h3 className="font-display text-lg text-charcoal">
              Room {room.roomNumber}
            </h3>
            <p className="text-xs text-charcoal/60">{room.roomType.name}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-lg text-charcoal/60 transition-colors hover:bg-charcoal/5"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {isVacant ? (
            <form action={checkInFormAction} className="flex flex-col gap-4">
              <input type="hidden" name="roomId" value={room.id} />
              <Field label="Guest name" htmlFor="guestName">
                <input
                  id="guestName"
                  name="guestName"
                  type="text"
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className={cn(inputClass, "h-12 text-base")}
                  placeholder="Full name"
                />
              </Field>
              <Field label="Phone (optional)" htmlFor="guestPhone">
                <input
                  id="guestPhone"
                  name="guestPhone"
                  type="tel"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  className={cn(inputClass, "h-12 text-base")}
                  placeholder="+977-..."
                />
              </Field>
              <Field label="Number of guests" htmlFor="numGuests">
                <input
                  id="numGuests"
                  name="numGuests"
                  type="number"
                  min={1}
                  max={20}
                  value={numGuests}
                  onChange={(e) => setNumGuests(Number(e.target.value))}
                  className={cn(inputClass, "h-12 text-base")}
                />
              </Field>
              <Field label="Rate per night (NPR)" htmlFor="ratePerNight">
                <input
                  id="ratePerNight"
                  name="ratePerNight"
                  type="number"
                  min={1}
                  step={50}
                  value={ratePerNight}
                  onChange={(e) => setRatePerNight(Number(e.target.value))}
                  className={cn(inputClass, "h-12 text-base")}
                />
              </Field>
              <Field label="Notes (optional)" htmlFor="notes">
                <textarea
                  id="notes"
                  name="notes"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className={cn(inputClass, "text-base")}
                  placeholder="Any special requests..."
                />
              </Field>
              <Button type="submit" variant="primary" size="lg" className="w-full">
                Check in
              </Button>
            </form>
          ) : isOccupied && entry ? (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-charcoal">
                  {entry.guestName}
                </p>
                {entry.guestPhone ? (
                  <p className="text-xs text-charcoal/60">{entry.guestPhone}</p>
                ) : null}
                <p className="text-xs text-charcoal/60">
                  {entry.numGuests} guest{entry.numGuests === 1 ? "" : "s"} ·{" "}
                  {formatNPR(Number(entry.ratePerNight))} / night
                </p>
                {entry.notes ? (
                  <p className="text-xs text-charcoal/50 italic">
                    Note: {entry.notes}
                  </p>
                ) : null}
              </div>

              <div className="border-t border-charcoal/10 pt-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-charcoal/50">
                  Charges
                </h4>
                {entry.charges.length === 0 ? (
                  <p className="mt-2 text-sm text-charcoal/50">
                    No charges added yet.
                  </p>
                ) : (
                  <ul className="mt-2 divide-y divide-charcoal/5">
                    {entry.charges.map((charge) => (
                      <li
                        key={charge.id}
                        className="flex items-center justify-between py-2 text-sm"
                      >
                        <span className="text-charcoal/80">
                          {charge.itemName} × {charge.quantity}
                        </span>
                        <span className="font-medium text-charcoal">
                          {formatNPR(Number(charge.priceAtAdd) * charge.quantity)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                <p className="mt-2 text-sm font-semibold text-charcoal">
                  Charges total: {formatNPR(totalCharges)}
                </p>
              </div>

              <form
                action={addRoomChargeFormAction.bind(null, entry.id)}
                className="flex flex-col gap-3 border-t border-charcoal/10 pt-4"
              >
                <h4 className="text-xs font-semibold uppercase tracking-wider text-charcoal/50">
                  Add charge
                </h4>
                <Field label="Item name" htmlFor="itemName">
                  <input
                    id="itemName"
                    name="itemName"
                    type="text"
                    required
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    className={cn(inputClass, "h-12 text-base")}
                    placeholder="e.g. Dal Bhat, Chai..."
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Qty" htmlFor="quantity">
                    <input
                      id="quantity"
                      name="quantity"
                      type="number"
                      min={1}
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className={cn(inputClass, "h-12 text-base")}
                    />
                  </Field>
                  <Field label="Price (NPR)" htmlFor="priceAtAdd">
                    <input
                      id="priceAtAdd"
                      name="priceAtAdd"
                      type="number"
                      min={1}
                      step={50}
                      value={priceAtAdd}
                      onChange={(e) => setPriceAtAdd(Number(e.target.value))}
                      className={cn(inputClass, "h-12 text-base")}
                    />
                  </Field>
                </div>
                <Button type="submit" variant="outline" size="md" className="w-full">
                  Add item
                </Button>
              </form>

              <div className="border-t border-charcoal/10 pt-4">
                {checkOutConfirm ? (
                  <div className="flex flex-col gap-3">
                    <p className="text-sm text-charcoal/80">
                      Are you sure you want to check out Room {room.roomNumber}?
                    </p>
                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="md"
                        className="flex-1"
                        onClick={() => setCheckOutConfirm(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        form="checkout-form"
                        variant="secondary"
                        size="md"
                        className="flex-1"
                      >
                        Yes, check out
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="secondary"
                    size="lg"
                    className="w-full"
                    onClick={() => setCheckOutConfirm(true)}
                  >
                    Check out
                  </Button>
                )}
                <form
                  id="checkout-form"
                  action={checkOutFormAction.bind(null, entry.id)}
                  className="hidden"
                />
              </div>
            </div>
          ) : (
            <p className="text-sm text-charcoal/60">
              This room is currently {room.status.toLowerCase()}.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
