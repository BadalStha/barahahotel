import type { FoodCategory, PaymentStatus } from "@prisma/client";
import { z } from "zod";

export const FOOD_CATEGORIES = [
  "BREAKFAST",
  "LUNCH",
  "DINNER",
  "SNACKS",
  "BEVERAGES",
] as const satisfies readonly FoodCategory[];

export const FOOD_CATEGORY_LABELS: Record<FoodCategory, string> = {
  BREAKFAST: "Breakfast",
  LUNCH: "Lunch",
  DINNER: "Dinner",
  SNACKS: "Snacks",
  BEVERAGES: "Beverages",
};

export const foodMenuItemSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Max 100 characters"),
  category: z.enum(FOOD_CATEGORIES),
  price: z.coerce
    .number({ message: "Enter a price" })
    .positive("Price must be greater than 0")
    .max(9_999_999, "Price too large"),
  description: z
    .string()
    .trim()
    .max(500, "Max 500 characters")
    .optional()
    .or(z.literal("")),
  imageUrl: z
    .string()
    .trim()
    .max(500, "Image URL too long")
    .optional()
    .or(z.literal("")),
  isAvailable: z.boolean().default(true),
});

export type FoodMenuItemFormInput = z.input<typeof foodMenuItemSchema>;
export type FoodMenuItemFormValues = z.output<typeof foodMenuItemSchema>;

/** One line item in an order: the menu item + how many. */
export const foodOrderItemInputSchema = z.object({
  foodMenuItemId: z.string().min(1, "Choose an item"),
  quantity: z.coerce
    .number({ message: "Enter a quantity" })
    .int("Whole number")
    .min(1, "At least 1")
    .max(999, "Max 999"),
});

export const foodOrderInputSchema = z.object({
  items: z
    .array(foodOrderItemInputSchema)
    .min(1, "Add at least one item to the order"),
  notes: z
    .string()
    .trim()
    .max(500, "Notes too long")
    .optional()
    .or(z.literal("")),
});

export type FoodOrderInput = z.input<typeof foodOrderInputSchema>;
export type FoodOrderValues = z.output<typeof foodOrderInputSchema>;

/** Invoice settings — tax (persisted globally), discount, payment fields. */
export const invoiceSettingsSchema = z.object({
  taxRate: z.coerce
    .number({ message: "Enter a tax rate" })
    .min(0, "Tax rate can't be negative")
    .max(100, "Max 100%"),
  discountAmount: z.coerce
    .number({ message: "Enter a discount" })
    .min(0, "Discount can't be negative")
    .max(9_999_999, "Discount too large")
    .default(0),
  paymentStatus: z.enum(["UNPAID", "PARTIAL", "PAID"] satisfies readonly PaymentStatus[]),
  paymentMethod: z
    .string()
    .trim()
    .max(50, "Max 50 characters")
    .optional()
    .or(z.literal("")),
});

export type InvoiceSettingsInput = z.input<typeof invoiceSettingsSchema>;
export type InvoiceSettingsValues = z.output<typeof invoiceSettingsSchema>;
