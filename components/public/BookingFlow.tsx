"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowRight,
  BedDouble,
  CheckCircle2,
  Users,
} from "lucide-react";

import {
  checkAvailabilityAction,
  createBookingAction,
  type BookingConfirmation,
} from "@/app/(public)/booking/actions";
import { Field, inputClass, inputErrorClass } from "@/components/admin/fields";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { AvailableRoomTypeGroup } from "@/lib/availability";
import { nightsBetweenStrings } from "@/lib/dates";
import { formatDate, formatNPR } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  dateRangeSchema,
  guestDetailsSchema,
  type DateRangeInput,
  type GuestDetailsValues,
} from "@/lib/validators/booking";

const STEPS = ["Dates", "Room", "Details", "Confirmed"] as const;

export type BookingFlowInitial = {
  checkIn?: string;
  checkOut?: string;
  guests?: string;
  roomTypeSlug?: string;
};

export function BookingFlow({ initial }: { initial: BookingFlowInitial }) {
  const [step, setStep] = useState(0);
  const [roomTypes, setRoomTypes] = useState<AvailableRoomTypeGroup[] | null>(
    null,
  );
  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(
    null,
  );
  const [isPending, startTransition] = useTransition();

  const parsedGuests = Number(initial.guests);
  const defaultRange: DateRangeInput = {
    checkIn: initial.checkIn ?? "",
    checkOut: initial.checkOut ?? "",
    numGuests: Number.isFinite(parsedGuests) && parsedGuests > 0 ? parsedGuests : 2,
  };

  const rangeForm = useForm<DateRangeInput>({
    resolver: zodResolver(dateRangeSchema),
    defaultValues: defaultRange,
  });

  const guestForm = useForm<GuestDetailsValues>({
    resolver: zodResolver(guestDetailsSchema),
    defaultValues: { fullName: "", email: "", phone: "", address: "", notes: "" },
  });

  function goToAvailability(values: DateRangeInput) {
    setError(null);
    setStep(1);
    setRoomTypes(null);
    startTransition(async () => {
      const result = await checkAvailabilityAction(values);
      if ("error" in result) {
        setError(result.error);
        setStep(0);
        return;
      }
      setRoomTypes(result.available);
      // Preselect the room type the user came from (room-page widget).
      if (initial.roomTypeSlug) {
        const match = result.available.find(
          (g) => g.slug === initial.roomTypeSlug,
        );
        if (match) setSelectedTypeId(match.roomTypeId);
      }
    });
  }

  const range = rangeForm.watch();
  const nights = nightsBetweenStrings(range.checkIn, range.checkOut);
  const selectedType = roomTypes?.find((t) => t.roomTypeId === selectedTypeId);

  function submitBooking(values: GuestDetailsValues) {
    if (!range.checkIn || !range.checkOut || !selectedTypeId) return;
    setError(null);
    setStep(3);
    startTransition(async () => {
      const result = await createBookingAction({
        ...range,
        ...values,
        roomTypeId: selectedTypeId,
      });
      if ("error" in result) {
        setError(result.error);
        setStep(2);
        return;
      }
      setConfirmation(result.booking);
    });
  }

  function reset() {
    setStep(0);
    setRoomTypes(null);
    setSelectedTypeId(null);
    setConfirmation(null);
    setError(null);
    rangeForm.reset(defaultRange);
    guestForm.reset();
  }

  // ── Step 4: confirmation ──────────────────────────────────────────
  if (confirmation) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-6 py-10 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-pine/10 text-pine">
          <CheckCircle2 className="size-9" />
        </span>
        <div>
          <h1 className="font-display text-3xl text-charcoal">
            Request received!
          </h1>
          <p className="mt-2 text-charcoal/70">
            Thanks {confirmation.guestName.split(" ")[0]} — your booking
            request is <strong>pending confirmation</strong>. We&apos;ll be in
            touch shortly.
          </p>
        </div>

        <Card className="w-full text-left">
          <div className="flex items-center justify-between border-b border-charcoal/10 pb-3">
            <span className="text-sm text-charcoal/60">Booking code</span>
            <span className="rounded-full bg-saffron px-3 py-1 font-mono text-sm font-bold tracking-wider text-charcoal">
              {confirmation.bookingCode}
            </span>
          </div>
          <dl className="divide-y divide-charcoal/5 text-sm">
            {[
              ["Room", `${confirmation.roomTypeName} · Room ${confirmation.roomNumber}`],
              ["Check-in", formatDate(confirmation.checkIn)],
              ["Check-out", formatDate(confirmation.checkOut)],
              ["Nights", String(confirmation.nights)],
              ["Guests", String(confirmation.numGuests)],
              [
                "Rate",
                `${formatNPR(confirmation.ratePerNight)} / night`,
              ],
              [
                "Estimated total",
                formatNPR(confirmation.total),
              ],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between py-2">
                <dt className="text-charcoal/60">{label}</dt>
                <dd className="font-medium text-charcoal">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 border-t border-charcoal/10 pt-3 text-xs text-charcoal/60">
            {confirmation.emailSent
              ? `A confirmation email is on its way to ${confirmation.guestEmail}.`
              : "Email sending isn't configured in this environment, so no email was sent — please keep your booking code safe."}
          </p>
        </Card>

        <div className="flex flex-wrap justify-center gap-3">
          <Button onClick={reset}>Make another booking</Button>
          <Link
            href="/rooms"
            className="inline-flex h-11 items-center rounded-full px-6 text-sm font-medium text-charcoal/70 transition-colors hover:text-charcoal"
          >
            Browse rooms
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 py-10">
      <div className="text-center">
        <h1 className="font-display text-3xl text-charcoal sm:text-4xl">
          Book your stay
        </h1>
        <p className="mt-2 text-sm text-charcoal/60">
          Bhedetar, Dhankuta · hill-station quiet, mountain views
        </p>
      </div>

      {/* Step indicator */}
      <ol className="flex items-center justify-center gap-1.5 sm:gap-2">
        {STEPS.map((label, index) => (
          <li key={label} className="flex items-center gap-1.5 sm:gap-2">
            <span
              className={cn(
                "flex size-6 items-center justify-center rounded-full text-xs font-bold transition-colors",
                index < step && "bg-pine text-stone",
                index === step && "bg-saffron text-charcoal",
                index > step && "bg-charcoal/10 text-charcoal/40",
              )}
            >
              {index < step ? "✓" : index + 1}
            </span>
            <span
              className={cn(
                "text-xs font-medium sm:text-sm",
                index === step ? "text-charcoal" : "text-charcoal/40",
              )}
            >
              {label}
            </span>
            {index < STEPS.length - 1 ? (
              <span className="mx-1 h-px w-4 bg-charcoal/15 sm:w-8" />
            ) : null}
          </li>
        ))}
      </ol>

      {error ? (
        <div className="rounded-xl border border-terracotta/30 bg-terracotta/10 px-4 py-3 text-sm text-terracotta">
          {error}
        </div>
      ) : null}

      {/* Step 1 — dates */}
      {step === 0 ? (
        <Card className="flex flex-col gap-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Check-in"
              error={rangeForm.formState.errors.checkIn?.message}
            >
              <input
                type="date"
                min={new Date().toISOString().slice(0, 10)}
                className={cn(
                  inputClass,
                  rangeForm.formState.errors.checkIn && inputErrorClass,
                )}
                {...rangeForm.register("checkIn")}
              />
            </Field>
            <Field
              label="Check-out"
              error={rangeForm.formState.errors.checkOut?.message}
            >
              <input
                type="date"
                min={range.checkIn || undefined}
                className={cn(
                  inputClass,
                  rangeForm.formState.errors.checkOut && inputErrorClass,
                )}
                {...rangeForm.register("checkOut")}
              />
            </Field>
          </div>
          <Field
            label="Guests"
            error={rangeForm.formState.errors.numGuests?.message}
          >
            <select
              className={cn(inputClass, "cursor-pointer")}
              {...rangeForm.register("numGuests")}
            >
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? "guest" : "guests"}
                </option>
              ))}
            </select>
          </Field>
          <Button
            type="button"
            onClick={rangeForm.handleSubmit(goToAvailability)}
            disabled={isPending}
            size="lg"
            className="self-start"
          >
            {isPending ? "Checking availability…" : "Check availability"}
            {!isPending ? <ArrowRight className="size-4" /> : null}
          </Button>
        </Card>
      ) : null}

      {/* Step 2 — choose room type */}
      {step === 1 ? (
        <div className="flex flex-col gap-4">
          {roomTypes === null ? (
            <Card className="text-center text-sm text-charcoal/60">
              Checking availability…
            </Card>
          ) : roomTypes.length === 0 ? (
            <Card className="flex flex-col items-center gap-3 text-center">
              <BedDouble className="size-8 text-charcoal/30" />
              <p className="text-charcoal/70">
                Sorry — no rooms are available for{" "}
                {formatDate(range.checkIn)} to {formatDate(range.checkOut)}.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setStep(0);
                  setError(null);
                }}
              >
                Try different dates
              </Button>
            </Card>
          ) : (
            <>
              <p className="text-sm text-charcoal/60">
                {nights} night{nights === 1 ? "" : "s"} ·{" "}
                {Number(range.numGuests)} guest{Number(range.numGuests) === 1 ? "" : "s"} —{" "}
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="font-medium text-pine underline underline-offset-2"
                >
                  change
                </button>
              </p>
              <ul className="flex flex-col gap-3">
                {roomTypes.map((type) => (
                  <li key={type.roomTypeId}>
                    <label
                      className={cn(
                        "flex cursor-pointer items-center gap-4 rounded-2xl border bg-white p-4 transition-all",
                        selectedTypeId === type.roomTypeId
                          ? "border-pine ring-2 ring-pine/20"
                          : "border-charcoal/10 hover:border-pine/40",
                      )}
                    >
                      <input
                        type="radio"
                        name="roomType"
                        value={type.roomTypeId}
                        checked={selectedTypeId === type.roomTypeId}
                        onChange={() => setSelectedTypeId(type.roomTypeId)}
                        className="size-4 accent-pine"
                      />
                      {type.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={type.imageUrl}
                          alt=""
                          className="hidden h-16 w-24 shrink-0 rounded-lg object-cover sm:block"
                        />
                      ) : (
                        <span className="hidden h-16 w-24 shrink-0 items-center justify-center rounded-lg bg-pine/10 text-pine sm:flex">
                          <BedDouble className="size-6" />
                        </span>
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span className="font-display text-lg text-charcoal">
                            {type.name}
                          </span>
                          <span className="shrink-0 text-sm font-semibold text-pine">
                            {formatNPR(type.basePrice)}
                            <span className="font-normal text-charcoal/50">
                              {" "}
                              / night
                            </span>
                          </span>
                        </span>
                        <span className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-charcoal/60">
                          <span className="flex items-center gap-1">
                            <Users className="size-3.5" /> Sleeps{" "}
                            {type.maxOccupancy}
                          </span>
                          <span>
                            {type.availableRooms} room
                            {type.availableRooms === 1 ? "" : "s"} left
                          </span>
                          {type.sizeSqft ? (
                            <span>{type.sizeSqft} sq ft</span>
                          ) : null}
                        </span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
              <Button
                type="button"
                size="lg"
                disabled={!selectedTypeId}
                onClick={() => {
                  setError(null);
                  setStep(2);
                }}
                className="self-start"
              >
                Continue
                <ArrowRight className="size-4" />
              </Button>
            </>
          )}
        </div>
      ) : null}

      {/* Step 3 — guest details */}
      {step === 2 ? (
        <div className="grid gap-6 md:grid-cols-[1fr_260px]">
          <Card className="flex flex-col gap-4">
            <h2 className="font-display text-xl text-charcoal">
              Your details
            </h2>
            <Field
              label="Full name"
              error={guestForm.formState.errors.fullName?.message}
            >
              <input
                placeholder="Sita Rai"
                className={cn(
                  inputClass,
                  guestForm.formState.errors.fullName && inputErrorClass,
                )}
                {...guestForm.register("fullName")}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Email"
                error={guestForm.formState.errors.email?.message}
              >
                <input
                  type="email"
                  placeholder="you@example.com"
                  className={cn(
                    inputClass,
                    guestForm.formState.errors.email && inputErrorClass,
                  )}
                  {...guestForm.register("email")}
                />
              </Field>
              <Field
                label="Phone"
                error={guestForm.formState.errors.phone?.message}
              >
                <input
                  type="tel"
                  placeholder="+977 98…"
                  className={cn(
                    inputClass,
                    guestForm.formState.errors.phone && inputErrorClass,
                  )}
                  {...guestForm.register("phone")}
                />
              </Field>
            </div>
            <Field
              label="Address"
              hint="Optional"
              error={guestForm.formState.errors.address?.message}
            >
              <input
                placeholder="Kathmandu, Nepal"
                className={cn(
                  inputClass,
                  guestForm.formState.errors.address && inputErrorClass,
                )}
                {...guestForm.register("address")}
              />
            </Field>
            <Field
              label="Notes"
              hint="Optional — arrival time, requests…"
              error={guestForm.formState.errors.notes?.message}
            >
              <textarea
                rows={3}
                placeholder="We'll arrive around 4pm."
                className={cn(
                  inputClass,
                  "h-auto py-3",
                  guestForm.formState.errors.notes && inputErrorClass,
                )}
                {...guestForm.register("notes")}
              />
            </Field>
            <div className="flex items-center gap-3 border-t border-charcoal/10 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
              >
                <ArrowLeft className="size-4" /> Back
              </Button>
              <Button
                type="button"
                onClick={guestForm.handleSubmit(submitBooking)}
                disabled={isPending}
              >
                {isPending ? "Confirming…" : "Confirm booking"}
              </Button>
            </div>
          </Card>

          <Card className="h-fit">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-charcoal/50">
              Your stay
            </h3>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-charcoal/60">Room</dt>
                <dd className="font-medium text-charcoal">
                  {selectedType?.name}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-charcoal/60">Check-in</dt>
                <dd className="text-charcoal">{formatDate(range.checkIn)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-charcoal/60">Check-out</dt>
                <dd className="text-charcoal">{formatDate(range.checkOut)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-charcoal/60">Nights</dt>
                <dd className="text-charcoal">{nights}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-charcoal/60">Rate</dt>
                <dd className="text-charcoal">
                  {formatNPR(selectedType?.basePrice ?? 0)} / night
                </dd>
              </div>
              <div className="flex justify-between border-t border-charcoal/10 pt-2 font-semibold text-charcoal">
                <dt>Total</dt>
                <dd>{formatNPR((selectedType?.basePrice ?? 0) * nights)}</dd>
              </div>
            </dl>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
