"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";

import { db } from "@/lib/db";
import { revalidatePublicSite } from "@/lib/revalidate";
import {
  foodMenuItemSchema,
  type FoodMenuItemFormInput,
} from "@/lib/validators/food";

export type ActionResult = { error?: string };

function isUniqueError(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002"
  );
}

// ── Food menu items ───────────────────────────────────────────────

export async function createFoodMenuItemAction(
  input: FoodMenuItemFormInput,
): Promise<ActionResult> {
  const parsed = foodMenuItemSchema.safeParse(input);
  if (!parsed.success) return { error: "Please fix the highlighted fields." };

  try {
    const { imageUrl, ...data } = parsed.data;
    await db.foodMenuItem.create({
      data: { ...data, imageUrl: imageUrl || null },
    });
    revalidatePath("/admin/food-menu");
    revalidatePublicSite();
    redirect("/admin/food-menu");
  } catch (error) {
    if (isUniqueError(error)) {
      return { error: "A menu item with this name already exists." };
    }
    throw error;
  }
}

export async function updateFoodMenuItemAction(
  id: string,
  input: FoodMenuItemFormInput,
): Promise<ActionResult> {
  const parsed = foodMenuItemSchema.safeParse(input);
  if (!parsed.success) return { error: "Please fix the highlighted fields." };

  const existing = await db.foodMenuItem.findUnique({ where: { id } });
  if (!existing) return { error: "Menu item not found." };

  try {
    const { imageUrl, ...data } = parsed.data;
    await db.foodMenuItem.update({
      where: { id },
      data: { ...data, imageUrl: imageUrl || null },
    });
    revalidatePath("/admin/food-menu");
    revalidatePublicSite();
    redirect("/admin/food-menu");
  } catch (error) {
    if (isUniqueError(error)) {
      return { error: "A menu item with this name already exists." };
    }
    throw error;
  }
}

export async function toggleFoodMenuItemAvailableAction(
  id: string,
  isAvailable: boolean,
): Promise<ActionResult> {
  await db.foodMenuItem.update({ where: { id }, data: { isAvailable } });
  revalidatePath("/admin/food-menu");
  revalidatePublicSite();
  return {};
}

export async function deleteFoodMenuItemAction(
  id: string,
): Promise<ActionResult> {
  const item = await db.foodMenuItem.findUnique({
    where: { id },
    select: { id: true, name: true },
  });
  if (!item) return { error: "Menu item not found." };

  const orderCount = await db.foodOrderItem.count({
    where: { foodMenuItemId: id },
  });
  if (orderCount > 0) {
    return {
      error: `Cannot delete — "${item.name}" appears on ${orderCount} past order line(s). Mark it unavailable instead.`,
    };
  }

  await db.foodMenuItem.delete({ where: { id } });
  revalidatePath("/admin/food-menu");
  revalidatePublicSite();
  return {};
}
