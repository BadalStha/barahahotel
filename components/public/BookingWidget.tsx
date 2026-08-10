"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { CalendarCheck, CheckCircle2, Users, XCircle } from "lucide-react";

import { checkAvailabilityAction } from "@/app/(public)/booking/actions";
import { inputClass } from "@/components/admin/fields";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { formatNPR } from "@/lib/format";

type WidgetStatus = "idle" | "checking" | "available" | "unavailable" | "error";

/**
 * Minimal booking widget: pick dates + guests, check live availability, and
 * hand off to the full booking flow with the choices prefilled.
 * When `roomTypeSlug` is given, availability is scoped to that room type.
 */
export function BookingWidget({
  roomTypeSlug,
  roomTypeName,
  basePrice,
  maxOccupancy,
}: {
  roomTypeSlug?: string;
  roomTypeName?: string;
  basePrice?: number;
  maxOccupancy?: number;
}) {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [numGuests, setNumGuests] = useState(maxOccupancy ? Math.min(2, maxOccupancy) : 2);
  const [status, setStatus] = useState<WidgetStatus>("idle");
  const [availableCount, setAvailableCount] = useState(0);
  const [isPending, startTransition] = useTransition();

  const query = new URLSearchParams({
    checkIn,
    checkOut,
    guests: String(numGuests),
    ...(roomTypeSlug ? { roomType: roomTypeSlug } : {}),
  });

  function submit() {
    if (!checkIn || !checkOut) {
      setStatus("error");
      return;
    }
    setStatus("checking");
    startTransition(async () => {
      const result = await checkAvailabilityAction({
        checkIn,
        checkOut,
        numGuests,
      });
      if ("error" in result) {
        setStatus("error");
        return;
      }
      if (roomTypeSlug) {
        const match = result.available.find((g) => g.slug === roomTypeSlug);
        if (match) {
          setAvailableCount(match.availableRooms);
          setStatus("available");
        } else {
          setStatus("unavailable");
        }
      } else {
        setAvailableCount(result.available.length);
        setStatus("available");
      }
    });
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-pine/15 bg-white p-5 shadow-[0_14px_32px_-16px_rgba(43,38,32,0.32)]">
      <div className="flex items-center gap-2">
        <CalendarCheck className="size-5 text-pine" />
        <h3 className="font-display text-lg text-charcoal">
          {roomTypeName ? `Book ${roomTypeName}` : "Check availability"}
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-xs font-medium text-charcoal/70">
          Check-in
          <input
            type="date"
            min={today}
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className={cn(inputClass, "h-11")}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-charcoal/70">
          Check-out
          <input
            type="date"
            min={checkIn || today}
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className={cn(inputClass, "h-11")}
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-xs font-medium text-charcoal/70">
        <span className="flex items-center gap-1">
          <Users className="size-3.5" /> Guests
        </span>
        <select
          value={numGuests}
          onChange={(e) => setNumGuests(Number(e.target.value))}
          className={cn(inputClass, "h-11 cursor-pointer")}
        >
          {Array.from(
            { length: maxOccupancy ?? 6 },
            (_, i) => i + 1,
          ).map((n) => (
            <option key={n} value={n}>
              {n} {n === 1 ? "guest" : "guests"}
            </option>
          ))}
        </select>
      </label>

      {basePrice ? (
        <p className="text-sm text-charcoal/70">
          <span className="font-semibold text-pine">
            {formatNPR(basePrice)}
          </span>{" "}
          / night
        </p>
      ) : null}

      <Button type="button" onClick={submit} disabled={isPending} size="md">
        {isPending ? "Checking…" : "Check availability"}
      </Button>

      {status === "available" ? (
        <div className="flex flex-col gap-2 rounded-xl border border-pine/20 bg-pine/5 p-3 text-sm text-pine">
          <p className="flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="size-4" />
            {roomTypeSlug
              ? `${availableCount} room${availableCount === 1 ? "" : "s"} available for these dates`
              : `${availableCount} room type${availableCount === 1 ? "" : "s"} available for these dates`}
          </p>
          <Link
            href={`/booking?${query.toString()}`}
            className="inline-flex h-10 items-center justify-center rounded-full bg-pine px-5 text-sm font-medium text-stone transition-colors hover:bg-pine/90"
          >
            Continue to booking
          </Link>
        </div>
      ) : null}

      {status === "unavailable" ? (
        <p className="flex items-center gap-1.5 rounded-xl border border-terracotta/20 bg-terracotta/5 p-3 text-sm text-terracotta">
          <XCircle className="size-4 shrink-0" />
          {roomTypeName} is booked for those dates — try different dates, or{" "}
          <Link href="/booking" className="underline underline-offset-2">
            see other rooms
          </Link>
          .
        </p>
      ) : null}

      {status === "error" ? (
        <p className="rounded-xl border border-terracotta/20 bg-terracotta/5 p-3 text-sm text-terracotta">
          Pick both dates first.
        </p>
      ) : null}
    </div>
  );
}
