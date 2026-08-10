import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { NewBookingForm } from "@/components/admin/bookings/NewBookingForm";

export default function NewBookingPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <Link
          href="/admin/bookings"
          className="inline-flex items-center gap-1.5 text-sm text-charcoal/60 transition-colors hover:text-pine"
        >
          <ArrowLeft className="size-4" />
          Bookings
        </Link>
        <h1 className="mt-2 font-display text-2xl text-charcoal sm:text-3xl">
          New booking
        </h1>
        <p className="mt-1 text-sm text-charcoal/60">
          For walk-in or phone reservations — availability is checked against
          live bookings.
        </p>
      </div>

      <div className="rounded-xl border border-charcoal/10 bg-white p-6 shadow-sm sm:p-8">
        <NewBookingForm />
      </div>
    </div>
  );
}
