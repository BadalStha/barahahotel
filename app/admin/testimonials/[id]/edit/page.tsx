import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { TestimonialForm } from "@/components/admin/testimonials/TestimonialForm";
import { db } from "@/lib/db";

export default async function EditTestimonialPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const testimonial = await db.testimonial.findUnique({ where: { id } });
  if (!testimonial) notFound();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <Link
          href="/admin/testimonials"
          className="inline-flex items-center gap-1.5 text-sm text-charcoal/60 transition-colors hover:text-pine"
        >
          <ArrowLeft className="size-4" />
          Testimonials
        </Link>
        <h1 className="mt-2 font-display text-2xl text-charcoal sm:text-3xl">
          Edit testimonial
        </h1>
      </div>

      <div className="rounded-xl border border-charcoal/10 bg-white p-6 shadow-sm sm:p-8">
        <TestimonialForm
          testimonial={{
            id: testimonial.id,
            guestName: testimonial.guestName,
            quote: testimonial.quote,
            rating: testimonial.rating,
            isPublished: testimonial.isPublished,
          }}
        />
      </div>
    </div>
  );
}
