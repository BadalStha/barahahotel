"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { revalidatePublicSite } from "@/lib/revalidate";
import { requireAdmin } from "@/lib/admin-auth";
import {
  menuItemSchema,
  type MenuItemInput,
} from "@/lib/validators/content";

export type ActionResult = { error?: string };

export async function createMenuItemAction(
  input: MenuItemInput,
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = menuItemSchema.safeParse(input);
  if (!parsed.success) return { error: "Please fix the highlighted fields." };

  const item = await db.menuItem.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description || null,
      price: parsed.data.price,
      category: parsed.data.category || null,
      isAvailable: parsed.data.isAvailable,
      sortOrder: parsed.data.sortOrder,
    },
  });
  revalidatePath("/admin/dining");
  revalidatePublicSite();
  redirect(`/admin/dining/${item.id}/edit`);
}

export async function updateMenuItemAction(
  id: string,
  input: MenuItemInput,
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = menuItemSchema.safeParse(input);
  if (!parsed.success) return { error: "Please fix the highlighted fields." };

  const existing = await db.menuItem.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existing) return { error: "Menu item not found." };

  await db.menuItem.update({
    where: { id },
    data: {
      name: parsed.data.name,
      description: parsed.data.description || null,
      price: parsed.data.price,
      category: parsed.data.category || null,
      isAvailable: parsed.data.isAvailable,
      sortOrder: parsed.data.sortOrder,
    },
  });
  revalidatePath("/admin/dining");
  revalidatePublicSite();
  redirect(`/admin/dining/${id}/edit`);
}

export async function toggleMenuItemAvailableAction(
  id: string,
  isAvailable: boolean,
): Promise<ActionResult> {
  await requireAdmin();
  const existing = await db.menuItem.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existing) return { error: "Menu item not found." };

  await db.menuItem.update({ where: { id }, data: { isAvailable } });
  revalidatePath("/admin/dining");
  revalidatePublicSite();
  return {};
}

export async function deleteMenuItemAction(id: string): Promise<void> {
  await requireAdmin();
  const existing = await db.menuItem.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existing) throw new Error("Menu item not found.");

  await db.menuItem.delete({ where: { id } });
  revalidatePath("/admin/dining");
  revalidatePublicSite();
  redirect("/admin/dining");
}
