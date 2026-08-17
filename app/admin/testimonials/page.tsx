import Link from "next/link";
import { Pencil, Plus, Star, Trash2 } from "lucide-react";

import { PublishToggle } from "@/components/admin/content/PublishToggle";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import {
  deleteTestimonialAction,
  toggleTestimonialPublishedAction,
} from "./actions";

export default async function AdminTestimonialsPage() {
  const testimonials = await db.testimonial.findMany({
    orderBy: [{ isPublished: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-charcoal sm:text-3xl">
            Testimonials
          </h1>
          <p className="mt-1 text-sm text-charcoal/60">
            {testimonials.length} testimonial{testimonials.length === 1 ? "" : "s"} ·{" "}
            {testimonials.filter((t) => t.isPublished).length} published
          </p>
        </div>
        <Link
          href="/admin/testimonials/new"
          className="inline-flex h-11 items-center gap-2 rounded-full bg-pine px-5 text-sm font-medium text-stone shadow-[0_10px_20px_-10px_rgba(31,77,58,0.6)] transition-colors hover:bg-pine/90"
        >
          <Plus className="size-4" />
          New testimonial
        </Link>
      </header>

      <div className="overflow-x-auto rounded-xl border border-charcoal/10 bg-white shadow-sm">
        <table className="w-full min-w-[620px] text-left text-sm">
          <thead className="border-b border-charcoal/10 text-xs uppercase tracking-wider text-charcoal/50">
            <tr>
              <th className="px-5 py-3 font-semibold">Guest</th>
              <th className="px-5 py-3 font-semibold">Quote</th>
              <th className="px-5 py-3 font-semibold">Rating</th>
              <th className="px-5 py-3 font-semibold">Live</th>
              <th className="px-5 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal/5">
            {testimonials.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-sm text-charcoal/50">
                  No testimonials yet — add your first guest review.
                </td>
              </tr>
            ) : (
              testimonials.map((testimonial) => (
                <tr
                  key={testimonial.id}
                  className={cn(
                    "transition-colors hover:bg-stone/50",
                    !testimonial.isPublished && "opacity-70",
                  )}
                >
                  <td className="px-5 py-3">
                    <Link
                      href={`/admin/testimonials/${testimonial.id}/edit`}
                      className="font-medium text-charcoal transition-colors hover:text-pine"
                    >
                      {testimonial.guestName}
                    </Link>
                  </td>
                  <td className="max-w-md px-5 py-3">
                    <p className="line-clamp-2 text-charcoal/70">
                      “{testimonial.quote}”
                    </p>
                  </td>
                  <td className="px-5 py-3">
                    <span className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "size-3.5",
                            i < testimonial.rating
                              ? "fill-saffron text-saffron"
                              : "text-charcoal/20",
                          )}
                        />
                      ))}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <PublishToggle
                      isPublished={testimonial.isPublished}
                      onToggle={(next) =>
                        toggleTestimonialPublishedAction(testimonial.id, next)
                      }
                    />
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/testimonials/${testimonial.id}/edit`}
                        className="inline-flex h-9 items-center gap-2 rounded-lg border border-charcoal/15 px-3 text-sm font-medium text-charcoal/70 transition-colors hover:bg-charcoal/5"
                      >
                        <Pencil className="size-4" />
                        Edit
                      </Link>
                      <form action={deleteTestimonialAction.bind(null, testimonial.id)}>
                        <button
                          type="submit"
                          className="inline-flex h-9 items-center gap-2 rounded-lg border border-terracotta/30 px-3 text-sm font-medium text-terracotta transition-colors hover:bg-terracotta/10"
                        >
                          <Trash2 className="size-4" />
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
