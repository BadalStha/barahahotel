"use client";

import type { PaymentStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RefreshCw } from "lucide-react";

import { updateInvoiceAction } from "@/app/admin/bookings/actions";
import { Field, inputClass, inputErrorClass } from "@/components/admin/fields";
import { cn } from "@/lib/utils";
import {
  invoiceSettingsSchema,
  type InvoiceSettingsInput,
} from "@/lib/validators/food";

const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  UNPAID: "Unpaid",
  PARTIAL: "Partially paid",
  PAID: "Paid",
};

export function InvoiceSettingsForm({
  bookingId,
  taxRate,
  discountAmount,
  paymentStatus,
  paymentMethod,
}: {
  bookingId: string;
  taxRate: number;
  discountAmount: number;
  paymentStatus: PaymentStatus;
  paymentMethod: string | null;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const defaultValues: InvoiceSettingsInput = {
    taxRate,
    discountAmount,
    paymentStatus,
    paymentMethod: paymentMethod ?? "",
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InvoiceSettingsInput>({
    resolver: zodResolver(invoiceSettingsSchema),
    defaultValues,
  });

  function onSubmit(values: InvoiceSettingsInput) {
    setError(null);
    startTransition(async () => {
      try {
        const result = await updateInvoiceAction(bookingId, values);
        if (result?.error) {
          setError(result.error);
          return;
        }
        router.refresh();
      } catch (caught) {
        const digest = (caught as { digest?: string } | null)?.digest;
        if (!digest?.startsWith("NEXT_REDIRECT")) {
          console.error("Invoice update failed:", caught);
          setError("Something went wrong. Please try again.");
        }
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-6 rounded-xl border border-charcoal/10 bg-white p-5 shadow-sm sm:p-6"
    >
      <div>
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-charcoal/50">
          <RefreshCw className="size-4" />
          Invoice settings
        </h2>
        <p className="mt-1 text-xs text-charcoal/50">
          Recalculate totals with a new tax rate or discount, and record how
          this invoice was paid. Tax rate is stored as a global site setting.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <Field
          label="Tax rate (%)"
          hint="Applies to the whole hotel"
          error={errors.taxRate?.message}
        >
          <input
            {...register("taxRate")}
            type="number"
            inputMode="decimal"
            step="0.1"
            min="0"
            max="100"
            className={cn(inputClass, errors.taxRate && inputErrorClass)}
          />
        </Field>
        <Field
          label="Discount (NPR)"
          hint="Manual adjustment, per invoice"
          error={errors.discountAmount?.message}
        >
          <input
            {...register("discountAmount")}
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            className={cn(inputClass, errors.discountAmount && inputErrorClass)}
          />
        </Field>
        <Field label="Payment status" error={errors.paymentStatus?.message}>
          <select
            {...register("paymentStatus")}
            className={cn(inputClass, "cursor-pointer")}
          >
            {(["UNPAID", "PARTIAL", "PAID"] as const).map((status) => (
              <option key={status} value={status}>
                {PAYMENT_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field
        label="Payment method"
        hint="e.g. Cash, Card, eSewa, Khalti, Bank transfer"
        error={errors.paymentMethod?.message}
      >
        <input
          {...register("paymentMethod")}
          placeholder="Cash"
          className={cn(inputClass, "max-w-md", errors.paymentMethod && inputErrorClass)}
        />
      </Field>

      {error ? (
        <p className="text-xs font-medium text-terracotta">{error}</p>
      ) : null}

      <div>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-full bg-pine px-6 text-sm font-medium text-stone shadow-[0_10px_20px_-10px_rgba(31,77,58,0.6)] transition-colors hover:bg-pine/90 disabled:opacity-50"
        >
          {isPending ? "Updating…" : "Update invoice"}
        </button>
      </div>
    </form>
  );
}
