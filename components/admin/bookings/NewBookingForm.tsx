"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BedDouble, CalendarSearch } from "lucide-react";

import {
  adminCreateBookingAction,
} from "@/app/admin/bookings/actions";
import { checkAvailabilityAction } from "@/app/(public)/booking/actions";
import { Field, inputClass, inputErrorClass } from "@/components/admin/fields";
import { Button } from "@/components/ui/Button";
import type { AvailableRoomTypeGroup } from "@/lib/availability";
import { formatNPR } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  adminBookingSchema,
  type AdminBookingInput,
} from "@/lib/validators/booking";

const defaultValues: AdminBookingInput = {
  checkIn: "",
  checkOut: "",
  numGuests: 2,
  fullName: "",
  email: "",
  phone: "",
  address: "",
  notes: "",
  roomId: "",
  source: "WALK_IN",
};

export function NewBookingForm() {
  const [available, setAvailable] = useState<AvailableRoomTypeGroup[] | null>(
    null,
  );
  const [checking, setChecking] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(
    null,
  );
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AdminBookingInput>({
    resolver: zodResolver(adminBookingSchema),
    defaultValues,
  });

  const checkIn = watch("checkIn");
  const checkOut = watch("checkOut");
  const numGuests = Number(watch("numGuests"));

  function checkRooms() {
    if (!checkIn || !checkOut) {
      setAvailabilityError("Pick check-in and check-out dates first.");
      return;
    }
    setChecking(true);
    setAvailabilityError(null);
    setAvailable(null);
    setValue("roomId", "", { shouldValidate: true });
    startTransition(async () => {
      const result = await checkAvailabilityAction({
        checkIn,
        checkOut,
        numGuests,
      });
      setChecking(false);
      if ("error" in result) {
        setAvailabilityError(result.error);
        return;
      }
      setAvailable(result.available);
    });
  }

  function onSubmit(values: AdminBookingInput) {
    setSubmitError(null);
    startTransition(async () => {
      try {
        const result = await adminCreateBookingAction(values);
        if (result?.error) setSubmitError(result.error);
      } catch (caught) {
        const digest = (caught as { digest?: string } | null)?.digest;
        if (!digest?.startsWith("NEXT_REDIRECT")) {
          console.error("Create booking failed:", caught);
          setSubmitError("Something went wrong. Please try again.");
        }
      }
    });
  }

  const roomId = watch("roomId");

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-6"
    >
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Guest name" error={errors.fullName?.message}>
          <input
            placeholder="Hari Tamang"
            className={cn(inputClass, errors.fullName && inputErrorClass)}
            {...register("fullName")}
          />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Email" hint="Optional" error={errors.email?.message}>
            <input
              type="email"
              placeholder="hari@example.com"
              className={cn(inputClass, errors.email && inputErrorClass)}
              {...register("email")}
            />
          </Field>
          <Field label="Phone" hint="Optional" error={errors.phone?.message}>
            <input
              type="tel"
              placeholder="+977 98…"
              className={cn(inputClass, errors.phone && inputErrorClass)}
              {...register("phone")}
            />
          </Field>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="Check-in" error={errors.checkIn?.message}>
          <input
            type="date"
            className={cn(inputClass, errors.checkIn && inputErrorClass)}
            {...register("checkIn")}
          />
        </Field>
        <Field label="Check-out" error={errors.checkOut?.message}>
          <input
            type="date"
            min={checkIn || undefined}
            className={cn(inputClass, errors.checkOut && inputErrorClass)}
            {...register("checkOut")}
          />
        </Field>
        <Field label="Guests" error={errors.numGuests?.message}>
          <input
            type="number"
            min={1}
            max={20}
            className={cn(inputClass, errors.numGuests && inputErrorClass)}
            {...register("numGuests")}
          />
        </Field>
      </div>

      <Field label="Booking source" error={errors.source?.message}>
        <select
          className={cn(inputClass, "cursor-pointer")}
          {...register("source")}
        >
          <option value="WALK_IN">Walk-in</option>
          <option value="PHONE">Phone</option>
        </select>
      </Field>

      {/* Room picker */}
      <div className="rounded-xl border border-charcoal/10 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-charcoal">Room</p>
            <p className="text-xs text-charcoal/50">
              {checkIn && checkOut
                ? "Check availability to see free rooms for those dates."
                : "Pick dates first, then check availability."}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={checkRooms}
            disabled={checking}
          >
            <CalendarSearch className="size-4" />
            {checking ? "Checking…" : "Check availability"}
          </Button>
        </div>

        {availabilityError ? (
          <p className="mt-3 text-sm text-terracotta">{availabilityError}</p>
        ) : null}

        {available === null ? null : available.length === 0 ? (
          <p className="mt-3 rounded-lg bg-stone px-3 py-2 text-sm text-charcoal/60">
            No rooms are available for those dates.
          </p>
        ) : (
          <div className="mt-3 flex flex-col gap-3">
            {available.map((group) => (
              <fieldset
                key={group.roomTypeId}
                className="rounded-lg border border-charcoal/10 p-3"
              >
                <legend className="px-1 text-sm font-medium text-charcoal">
                  {group.name}{" "}
                  <span className="font-normal text-charcoal/50">
                    · {formatNPR(group.basePrice)} / night
                  </span>
                </legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {group.rooms.map((room) => (
                    <label
                      key={room.id}
                      className={cn(
                        "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors",
                        roomId === room.id
                          ? "border-pine bg-pine/5 text-pine"
                          : "border-charcoal/15 text-charcoal/80 hover:bg-charcoal/5",
                      )}
                    >
                      <input
                        type="radio"
                        name="room"
                        value={room.id}
                        checked={roomId === room.id}
                        onChange={() =>
                          setValue("roomId", room.id, {
                            shouldValidate: true,
                          })
                        }
                        className="size-4 accent-pine"
                      />
                      Room {room.roomNumber}
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}
            <p className="text-xs text-charcoal/50">
              {roomId
                ? "Room selected — ready to create."
                : "Select a specific room."}
            </p>
            {errors.roomId ? (
              <p className="text-xs text-terracotta">{errors.roomId.message}</p>
            ) : null}
          </div>
        )}
      </div>

      <Field label="Notes" hint="Optional" error={errors.notes?.message}>
        <textarea
          rows={3}
          placeholder="Arrival time, special requests…"
          className={cn(inputClass, "h-auto py-3", errors.notes && inputErrorClass)}
          {...register("notes")}
        />
      </Field>

      {submitError ? (
        <div className="rounded-xl border border-terracotta/30 bg-terracotta/10 px-4 py-3 text-sm text-terracotta">
          {submitError}
        </div>
      ) : null}

      <div className="flex items-center gap-3 border-t border-charcoal/10 pt-5">
        <Button type="submit" disabled={isPending}>
          <BedDouble className="size-4" />
          {isPending ? "Creating…" : "Create booking"}
        </Button>
      </div>
    </form>
  );
}
