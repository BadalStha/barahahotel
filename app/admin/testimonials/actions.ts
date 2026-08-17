"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { revalidatePublicSite } from "@/lib/revalidate";
import {
  testimonialSchema,
  type TestimonialInput,
} from "@/lib/validators/content";

export type ActionResult = { error?: string };

export async function createTestimonialAction(
  input: TestimonialInput,
): Promise<ActionResult> {
  const parsed = testimonialSchema.safeParse(input);
  if (!parsed.success) return { error: "Please fix the highlighted fields." };

  const testimonial = await db.testimonial.create({
    data: {
      guestName: parsed.data.guestName,
      quote: parsed.data.quote,
      rating: parsed.data.rating,
      isPublished: parsed.data.isPublished,
    },
  });
  revalidatePath("/admin/testimonials");
  revalidatePublicSite();
  redirect(`/admin/testimonials/${testimonial.id}/edit`);
}

export async function updateTestimonialAction(
  id: string,
  input: TestimonialInput,
): Promise<ActionResult> {
  const parsed = testimonialSchema.safeParse(input);
  if (!parsed.success) return { error: "Please fix the highlighted fields." };

  const existing = await db.testimonial.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existing) return { error: "Testimonial not found." };

  await db.testimonial.update({
    where: { id },
    data: {
      guestName: parsed.data.guestName,
      quote: parsed.data.quote,
      rating: parsed.data.rating,
      isPublished: parsed.data.isPublished,
    },
  });
  revalidatePath("/admin/testimonials");
  revalidatePublicSite();
  redirect(`/admin/testimonials/${id}/edit`);
}

export async function toggleTestimonialPublishedAction(
  id: string,
  isPublished: boolean,
): Promise<ActionResult> {
  const existing = await db.testimonial.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existing) return { error: "Testimonial not found." };

  await db.testimonial.update({ where: { id }, data: { isPublished } });
  revalidatePath("/admin/testimonials");
  revalidatePublicSite();
  return {};
}

export async function deleteTestimonialAction(id: string): Promise<void> {
  const existing = await db.testimonial.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existing) throw new Error("Testimonial not found.");

  await db.testimonial.delete({ where: { id } });
  revalidatePath("/admin/testimonials");
  revalidatePublicSite();
  redirect("/admin/testimonials");
}
