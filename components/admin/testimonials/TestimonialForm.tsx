"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Star } from "lucide-react";

import {
  createTestimonialAction,
  updateTestimonialAction,
} from "@/app/admin/testimonials/actions";
import { Field, inputClass, inputErrorClass } from "@/components/admin/fields";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import {
  testimonialSchema,
  type TestimonialInput,
} from "@/lib/validators/content";

export type TestimonialFormData = {
  id: string;
  guestName: string;
  quote: string;
  rating: number;
  isPublished: boolean;
};

const textareaClass =
  "w-full rounded-xl border border-charcoal/15 bg-white px-4 py-3 text-sm text-charcoal placeholder:text-charcoal/40 outline-none transition focus:border-pine focus:ring-2 focus:ring-pine/20";

export function TestimonialForm({ testimonial }: { testimonial?: TestimonialFormData }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const defaultValues: TestimonialInput = testimonial
    ? {
        guestName: testimonial.guestName,
        quote: testimonial.quote,
        rating: testimonial.rating,
        isPublished: testimonial.isPublished,
      }
    : {
        guestName: "",
        quote: "",
        rating: 5,
        isPublished: true,
      };

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<TestimonialInput>({
    resolver: zodResolver(testimonialSchema),
    defaultValues,
  });

  const rating = Number(useWatch({ control, name: "rating" }) ?? 5);
  const isPublished = useWatch({ control, name: "isPublished" }) ?? true;

  function onSubmit(values: TestimonialInput) {
    setError(null);
    startTransition(async () => {
      try {
        const result = testimonial
          ? await updateTestimonialAction(testimonial.id, values)
          : await createTestimonialAction(values);
        if (result?.error) setError(result.error);
      } catch (caught) {
        const digest = (caught as { digest?: string } | null)?.digest;
        if (!digest?.startsWith("NEXT_REDIRECT")) {
          console.error("Testimonial save failed:", caught);
          setError("Something went wrong. Please try again.");
        }
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
      <Field label="Guest name" error={errors.guestName?.message}>
        <input
          {...register("guestName")}
          placeholder="Sita Rai"
          className={cn(inputClass, errors.guestName && inputErrorClass)}
        />
      </Field>

      <Field label="Quote" error={errors.quote?.message}>
        <textarea
          {...register("quote")}
          rows={4}
          placeholder="What did they say about their stay?"
          className={cn(textareaClass, errors.quote && inputErrorClass)}
        />
      </Field>

      <Field label="Rating" error={errors.rating?.message}>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              aria-label={`${star} star${star === 1 ? "" : "s"}`}
              onClick={() => setValue("rating", star, { shouldValidate: true })}
              className="cursor-pointer p-0.5 transition-transform hover:scale-110"
            >
              <Star
                className={cn(
                  "size-7",
                  star <= rating
                    ? "fill-saffron text-saffron"
                    : "text-charcoal/20",
                )}
              />
            </button>
          ))}
          <span className="ml-2 text-sm font-medium text-charcoal/70">
            {rating} / 5
          </span>
        </div>
      </Field>

      <div>
        <button
          type="button"
          role="switch"
          aria-checked={isPublished}
          onClick={() => setValue("isPublished", !isPublished, { shouldValidate: true })}
          className="flex cursor-pointer items-center gap-3"
        >
          <span
            className={cn(
              "relative h-6 w-11 rounded-full transition-colors",
              isPublished ? "bg-pine" : "bg-charcoal/20",
            )}
          >
            <span
              className={cn(
                "absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow transition-transform",
                isPublished && "translate-x-5",
              )}
            />
          </span>
          <span className="text-sm font-medium text-charcoal">
            {isPublished ? "Published — shown on the website" : "Hidden from the website"}
          </span>
        </button>
      </div>

      {error ? (
        <div className="rounded-xl border border-terracotta/30 bg-terracotta/10 px-4 py-3 text-sm text-terracotta">
          {error}
        </div>
      ) : null}

      <div className="flex items-center gap-3 border-t border-charcoal/10 pt-5">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving…" : testimonial ? "Save changes" : "Add testimonial"}
        </Button>
        <Link
          href="/admin/testimonials"
          className="inline-flex h-11 items-center rounded-full px-6 text-sm font-medium text-charcoal/70 transition-colors hover:text-charcoal"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
