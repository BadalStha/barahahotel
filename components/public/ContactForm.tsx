"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Send } from "lucide-react";

import { sendContactMessageAction } from "@/app/(public)/contact/actions";
import { Field, inputClass, inputErrorClass } from "@/components/admin/fields";
import { cn } from "@/lib/utils";
import {
  contactMessageSchema,
  type ContactMessageInput,
} from "@/lib/validators/content";

const textareaClass =
  "w-full rounded-xl border border-charcoal/15 bg-white px-4 py-3 text-sm text-charcoal placeholder:text-charcoal/40 outline-none transition focus:border-pine focus:ring-2 focus:ring-pine/20";

export function ContactForm() {
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactMessageInput>({
    resolver: zodResolver(contactMessageSchema),
    defaultValues: { name: "", email: "", phone: "", message: "" },
  });

  function onSubmit(values: ContactMessageInput) {
    setError(null);
    setNotice(null);
    startTransition(async () => {
      const result = await sendContactMessageAction(values);
      if (result?.notice) {
        setNotice(result.notice);
        setSent(true);
        reset();
        return;
      }
      if (result?.error) {
        setError(result.error);
        return;
      }
      setSent(true);
      reset();
    });
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-pine/20 bg-pine/5 p-10 text-center">
        <CheckCircle2 className="size-10 text-pine" />
        <h3 className="font-display text-xl text-charcoal">Message sent</h3>
        <p className="max-w-sm text-sm text-charcoal/70">
          {notice ??
            "Thank you for reaching out — we'll get back to you as soon as we can. (Dhanyabad!)"}
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" error={errors.name?.message}>
          <input
            {...register("name")}
            placeholder="Your full name"
            className={cn(inputClass, errors.name && inputErrorClass)}
          />
        </Field>
        <Field label="Phone (optional)" error={errors.phone?.message}>
          <input
            {...register("phone")}
            type="tel"
            placeholder="+977…"
            className={cn(inputClass, errors.phone && inputErrorClass)}
          />
        </Field>
      </div>

      <Field label="Email" error={errors.email?.message}>
        <input
          {...register("email")}
          type="email"
          placeholder="you@example.com"
          className={cn(inputClass, errors.email && inputErrorClass)}
        />
      </Field>

      <Field label="Message" error={errors.message?.message}>
        <textarea
          {...register("message")}
          rows={5}
          placeholder="How can we help?"
          className={cn(textareaClass, errors.message && inputErrorClass)}
        />
      </Field>

      {error ? (
        <p className="rounded-xl border border-terracotta/20 bg-terracotta/5 px-4 py-3 text-sm text-terracotta">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-pine px-6 text-sm font-medium text-stone shadow-[0_10px_20px_-10px_rgba(31,77,58,0.6)] transition-colors hover:bg-pine/90 disabled:opacity-50"
      >
        <Send className="size-4" />
        {isPending ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
