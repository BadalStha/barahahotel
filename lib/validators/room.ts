import { z } from "zod";

export const roomTypeSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Max 100 characters"),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Use lowercase letters, numbers, and hyphens",
    ),
  description: z
    .string()
    .trim()
    .max(1000, "Max 1000 characters")
    .optional()
    .or(z.literal("")),
  basePrice: z.coerce
    .number({ message: "Enter a price" })
    .positive("Price must be greater than 0")
    .max(9_999_999, "Price too large"),
  maxOccupancy: z.coerce
    .number({ message: "Enter a number" })
    .int("Whole number")
    .min(1, "At least 1")
    .max(50, "Max 50"),
  sizeSqft: z
    .union([
      z.coerce.number({ message: "Enter a number" }).int("Whole number").positive("Positive number").max(100_000),
      z.literal(""),
      z.null(),
    ])
    .optional(),
  amenities: z.array(z.string().trim().min(1)).max(30).default([]),
  images: z
    .array(
      z.object({
        url: z.string().min(1, "Image URL is required").max(500),
        altText: z.string().max(200).optional().or(z.literal("")),
      }),
    )
    .max(12, "Max 12 images")
    .default([]),
  isActive: z.boolean().default(true),
});

export type RoomTypeFormInput = z.input<typeof roomTypeSchema>;
export type RoomTypeFormValues = z.output<typeof roomTypeSchema>;

export const roomStatusSchema = z.enum([
  "AVAILABLE",
  "OCCUPIED",
  "MAINTENANCE",
  "CLEANING",
]);

export const roomSchema = z.object({
  roomNumber: z.string().trim().min(1, "Room number is required").max(10),
  floor: z.coerce
    .number({ message: "Enter a floor" })
    .int("Whole number")
    .min(0)
    .max(99),
  status: roomStatusSchema,
});

export type RoomFormInput = z.input<typeof roomSchema>;
