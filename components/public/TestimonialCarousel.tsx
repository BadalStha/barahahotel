"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

import { cn } from "@/lib/utils";

export type CarouselTestimonial = {
  id: string;
  guestName: string;
  quote: string;
  rating: number;
};

const AUTOPLAY_MS = 6000;

export function TestimonialCarousel({
  testimonials,
}: {
  testimonials: CarouselTestimonial[];
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const count = testimonials.length;

  useEffect(() => {
    if (count <= 1 || paused) return;
    timer.current = setInterval(
      () => setIndex((i) => (i + 1) % count),
      AUTOPLAY_MS,
    );
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [count, paused]);

  if (count === 0) return null;

  const current = testimonials[index];

  return (
    <div
      className="relative mx-auto max-w-2xl"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        key={current.id}
        className="flex flex-col items-center gap-4 rounded-2xl border border-pine/15 bg-white p-8 text-center shadow-[0_14px_32px_-16px_rgba(43,38,32,0.32)] sm:p-10"
      >
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                "size-5",
                i < current.rating
                  ? "fill-saffron text-saffron"
                  : "text-charcoal/20",
              )}
            />
          ))}
        </div>
        <blockquote className="font-display text-xl leading-relaxed text-charcoal sm:text-2xl">
          “{current.quote}”
        </blockquote>
        <p className="text-sm font-semibold uppercase tracking-wider text-pine">
          {current.guestName}
        </p>
      </div>

      {count > 1 ? (
        <>
          <button
            type="button"
            aria-label="Previous testimonial"
            onClick={() => setIndex((index - 1 + count) % count)}
            className="absolute -left-3 top-1/2 flex size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-pine/15 bg-white text-pine shadow-md transition-colors hover:bg-pine hover:text-stone sm:-left-5"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            aria-label="Next testimonial"
            onClick={() => setIndex((index + 1) % count)}
            className="absolute -right-3 top-1/2 flex size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-pine/15 bg-white text-pine shadow-md transition-colors hover:bg-pine hover:text-stone sm:-right-5"
          >
            <ChevronRight className="size-5" />
          </button>

          <div className="mt-5 flex items-center justify-center gap-2">
            {testimonials.map((t, i) => (
              <button
                key={t.id}
                type="button"
                aria-label={`Show testimonial ${i + 1}`}
                onClick={() => setIndex(i)}
                className={cn(
                  "h-2 cursor-pointer rounded-full transition-all",
                  i === index ? "w-6 bg-pine" : "w-2 bg-charcoal/20 hover:bg-charcoal/40",
                )}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
