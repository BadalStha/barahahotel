"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import {
  galleryImageSchema,
  type GalleryImageInput,
} from "@/lib/validators/content";

export type ActionResult = { error?: string };

export async function createGalleryImageAction(
  input: GalleryImageInput,
): Promise<ActionResult> {
  const parsed = galleryImageSchema.safeParse(input);
  if (!parsed.success) return { error: "Please fix the highlighted fields." };

  const last = await db.galleryImage.findFirst({
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });
  await db.galleryImage.create({
    data: {
      url: parsed.data.url,
      altText: parsed.data.altText || null,
      category: parsed.data.category || null,
      sortOrder: (last?.sortOrder ?? -1) + 1,
    },
  });

  revalidatePath("/admin/gallery");
  return {};
}

export async function updateGalleryImageAction(
  id: string,
  input: GalleryImageInput,
): Promise<ActionResult> {
  const parsed = galleryImageSchema.safeParse(input);
  if (!parsed.success) return { error: "Please fix the highlighted fields." };

  const existing = await db.galleryImage.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existing) return { error: "Image not found." };

  await db.galleryImage.update({
    where: { id },
    data: {
      url: parsed.data.url,
      altText: parsed.data.altText || null,
      category: parsed.data.category || null,
    },
  });

  revalidatePath("/admin/gallery");
  return {};
}

export async function reorderGalleryImageAction(
  id: string,
  direction: "up" | "down",
): Promise<ActionResult> {
  const image = await db.galleryImage.findUnique({
    where: { id },
    select: { id: true, sortOrder: true },
  });
  if (!image) return { error: "Image not found." };

  const neighbor = await db.galleryImage.findFirst({
    where:
      direction === "up"
        ? { sortOrder: { lt: image.sortOrder } }
        : { sortOrder: { gt: image.sortOrder } },
    orderBy:
      direction === "up"
        ? { sortOrder: "desc" }
        : { sortOrder: "asc" },
    select: { id: true, sortOrder: true },
  });
  if (!neighbor) return {}; // Already at the edge — nothing to swap.

  await db.$transaction([
    db.galleryImage.update({
      where: { id: image.id },
      data: { sortOrder: neighbor.sortOrder },
    }),
    db.galleryImage.update({
      where: { id: neighbor.id },
      data: { sortOrder: image.sortOrder },
    }),
  ]);

  revalidatePath("/admin/gallery");
  return {};
}

export async function deleteGalleryImageAction(id: string): Promise<ActionResult> {
  const image = await db.galleryImage.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!image) return { error: "Image not found." };

  await db.galleryImage.delete({ where: { id } });
  revalidatePath("/admin/gallery");
  return {};
}
