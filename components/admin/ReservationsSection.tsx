import { format } from "date-fns";
import { CalendarPlus, Phone, Users } from "lucide-react";

import {
  cancelReservationFormAction,
  checkInReservationFormAction,
  createReservationFormAction,
} from "@/app/admin/reservation-actions";
import { Button } from "@/components/ui/Button";
import { Field, inputClass } from "@/components/admin/fields";
import { cn } from "@/lib/utils";

export type BookingView = {
  id: string;
  guestName: string;
  guestPhone: string | null;
  numGuests: number;
  roomTypeId: string;
  roomTypeName: string;
  roomId: string | null;
  roomNumber: string | null;
  arrivalDate: Date;
  nights: number;
  notes: string | null;
};

export type BookingOption = {
  id: string;
  name: string;
};

export type BookableRoom = {
  id: string;
  roomNumber: string;
  roomTypeId: string;
  status: string;
};

type Props = {
  bookings: BookingView[];
  roomTypes: BookingOption[];
  rooms: BookableRoom[];
  justBooked: boolean;
  bookingError: boolean;
};

const arrivalLabel = (d: Date) => format(d, "EEE d MMM");

export function ReservationsSection({
  bookings,
  roomTypes,
  rooms,
  justBooked,
  bookingError,
}: Props) {
  const todayIso = new Date().toISOString().split("T")[0];
  const availableRooms = rooms.filter((r) => r.status === "AVAILABLE");

  return (
    <section id="bookings" aria-label="Upcoming bookings" className="flex flex-col gap-4">
      <div>
        <h2 className="font-display text-xl text-charcoal sm:text-2xl">
          Upcoming bookings
        </h2>
        <p className="mt-1 text-sm text-charcoal/60">
          Who is arriving in the next few days — no payment, just names and
          dates.
        </p>
      </div>

      {justBooked ? (
        <p className="rounded-xl border border-pine/20 bg-pine/5 px-4 py-3 text-sm font-medium text-pine">
          Booking saved — it is on the list below.
        </p>
      ) : null}
      {bookingError ? (
        <p className="rounded-xl border border-terracotta/30 bg-terracotta/5 px-4 py-3 text-sm font-medium text-terracotta">
          Couldn&apos;t save that booking — check the name and arrival date
          and try again.
        </p>
      ) : null}

      {bookings.length === 0 ? (
        <p className="rounded-xl border border-charcoal/10 bg-white px-4 py-5 text-center text-sm text-charcoal/50 shadow-sm">
          No upcoming bookings. When a guest calls, tap “Book a room” below.
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {bookings.map((booking) => {
            const typeRooms = availableRooms.filter(
              (r) => r.roomTypeId === booking.roomTypeId,
            );
            const checkInRooms =
              typeRooms.length > 0 ? typeRooms : availableRooms;
            return (
              <li
                key={booking.id}
                className="flex flex-col gap-3 rounded-xl border border-charcoal/10 bg-white p-4 shadow-sm"
              >
                <div>
                  <p className="font-display text-lg leading-tight text-charcoal">
                    {booking.guestName}
                  </p>
                  <p className="mt-1 text-sm text-charcoal/70">
                    {booking.roomTypeName} · arrives{" "}
                    <span className="font-semibold">
                      {arrivalLabel(booking.arrivalDate)}
                    </span>{" "}
                    · {booking.nights} night{booking.nights === 1 ? "" : "s"}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-charcoal/60">
                    <span className="inline-flex items-center gap-1">
                      <Users className="size-3.5" />
                      {booking.numGuests} guest{booking.numGuests === 1 ? "" : "s"}
                    </span>
                    {booking.guestPhone ? (
                      <span className="inline-flex items-center gap-1">
                        <Phone className="size-3.5" />
                        {booking.guestPhone}
                      </span>
                    ) : null}
                    {booking.roomNumber ? (
                      <span>Wants Room {booking.roomNumber}</span>
                    ) : null}
                  </div>
                  {booking.notes ? (
                    <p className="mt-1 text-xs italic text-charcoal/50">
                      {booking.notes}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-col gap-2 border-t border-charcoal/10 pt-3">
                  {checkInRooms.length > 0 ? (
                    <form
                      action={checkInReservationFormAction.bind(null, booking.id)}
                      className="flex gap-2"
                    >
                      <select
                        name="roomId"
                        aria-label="Room to check into"
                        defaultValue={
                          checkInRooms.find((r) => r.id === booking.roomId)?.id ??
                          checkInRooms[0]?.id ??
                          ""
                        }
                        className={cn(inputClass, "h-11 flex-1 text-base")}
                      >
                        {checkInRooms.map((r) => (
                          <option key={r.id} value={r.id}>
                            Room {r.roomNumber}
                          </option>
                        ))}
                      </select>
                      <Button type="submit" variant="primary" size="md">
                        Check in
                      </Button>
                    </form>
                  ) : (
                    <p className="text-sm font-medium text-terracotta">
                      No rooms free right now.
                    </p>
                  )}
                  <form action={cancelReservationFormAction.bind(null, booking.id)}>
                    <button
                      type="submit"
                      className="cursor-pointer text-sm font-medium text-charcoal/50 underline-offset-2 hover:text-terracotta hover:underline"
                    >
                      Cancel booking
                    </button>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <details id="book-room" className="group">
        <summary className="inline-flex h-12 cursor-pointer list-none items-center gap-2 rounded-xl bg-pine px-6 text-sm font-semibold text-cream transition-colors hover:bg-pine/90 [&::-webkit-details-marker]:hidden">
          <CalendarPlus className="size-4" />
          Book a room
        </summary>
        <form
          action={createReservationFormAction}
          className="mt-3 grid gap-4 rounded-xl border border-charcoal/10 bg-white p-5 shadow-sm sm:grid-cols-2"
        >
          <Field label="Guest name" htmlFor="res-guestName">
            <input
              id="res-guestName"
              name="guestName"
              type="text"
              required
              placeholder="Full name"
              className={cn(inputClass, "h-12 text-base")}
            />
          </Field>
          <Field label="Phone" htmlFor="res-guestPhone">
            <input
              id="res-guestPhone"
              name="guestPhone"
              type="tel"
              placeholder="+977-..."
              className={cn(inputClass, "h-12 text-base")}
            />
          </Field>
          <Field label="Arrival date" htmlFor="res-arrivalDate">
            <input
              id="res-arrivalDate"
              name="arrivalDate"
              type="date"
              required
              min={todayIso}
              className={cn(inputClass, "h-12 text-base")}
            />
          </Field>
          <Field label="Nights" htmlFor="res-nights">
            <input
              id="res-nights"
              name="nights"
              type="number"
              min={1}
              max={60}
              defaultValue={1}
              className={cn(inputClass, "h-12 text-base")}
            />
          </Field>
          <Field label="Room type" htmlFor="res-roomTypeId">
            <select
              id="res-roomTypeId"
              name="roomTypeId"
              required
              defaultValue=""
              className={cn(inputClass, "h-12 text-base")}
            >
              <option value="" disabled>
                Choose a room type…
              </option>
              {roomTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Room (optional)" htmlFor="res-roomId">
            <select
              id="res-roomId"
              name="roomId"
              defaultValue=""
              className={cn(inputClass, "h-12 text-base")}
            >
              <option value="">Any room of that type</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  Room {r.roomNumber}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Guests" htmlFor="res-numGuests">
            <input
              id="res-numGuests"
              name="numGuests"
              type="number"
              min={1}
              max={20}
              defaultValue={1}
              className={cn(inputClass, "h-12 text-base")}
            />
          </Field>
          <Field label="Notes (optional)" htmlFor="res-notes">
            <input
              id="res-notes"
              name="notes"
              type="text"
              placeholder="Anything to remember…"
              className={cn(inputClass, "h-12 text-base")}
            />
          </Field>
          <div className="sm:col-span-2">
            <Button type="submit" variant="primary" size="lg" className="w-full sm:w-auto">
              Save booking
            </Button>
          </div>
        </form>
      </details>
    </section>
  );
}
