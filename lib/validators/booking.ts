import type { BookingStatus } from "@prisma/client";
import { BookingSource } from "@prisma/client";
import { differenceInCalendarDays, format, parseISO } from "date-fns";
import { z } from "zod";

/** Allowed booking-status transitions, shared by the action and the UI. */
export const BOOKING_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  PENDING: ["CONFIRMED", "CHECKED_IN", "CANCELLED"],
  CONFIRMED: ["CHECKED_IN", "CANCELLED"],
  CHECKED_IN: ["CHECKED_OUT"],
  CHECKED_OUT: [],
  CANCELLED: [],
};

const dateString = z
  .string({ message: "Pick a date" })
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date");

/** Step 1 — dates + guest count, shared by the public flow and admin form. */
export const dateRangeSchema = z
  .object({
    checkIn: dateString,
    checkOut: dateString,
    numGuests: z.coerce
      .number({ message: "Enter the number of guests" })
      .int("Whole number")
      .min(1, "At least 1 guest")
      .max(20, "Max 20 guests"),
  })
  .superRefine((value, ctx) => {
    const today = format(new Date(), "yyyy-MM-dd");
    if (value.checkIn && value.checkIn < today) {
      ctx.addIssue({
        code: "custom",
        path: ["checkIn"],
        message: "Check-in can't be in the past",
      });
    }
    if (value.checkIn && value.checkOut && value.checkOut <= value.checkIn) {
      ctx.addIssue({
        code: "custom",
        path: ["checkOut"],
        message: "Check-out must be after check-in",
      });
    }
    if (value.checkIn && value.checkOut && value.checkOut > value.checkIn) {
      const nights = differenceInCalendarDays(
        parseISO(value.checkOut),
        parseISO(value.checkIn),
      );
      if (nights > 30) {
        ctx.addIssue({
          code: "custom",
          path: ["checkOut"],
          message: "Max stay is 30 nights",
        });
      }
    }
  });

export type DateRangeInput = z.input<typeof dateRangeSchema>;
export type DateRangeValues = z.output<typeof dateRangeSchema>;

export const guestDetailsSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(100),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid email address"),
  phone: z
    .string()
    .trim()
    .min(7, "Enter a valid phone number")
    .max(30, "Phone number too long"),
  address: z
    .string()
    .trim()
    .max(300, "Address too long")
    .optional()
    .or(z.literal("")),
  notes: z
    .string()
    .trim()
    .max(1000, "Notes too long")
    .optional()
    .or(z.literal("")),
});

export type GuestDetailsValues = z.output<typeof guestDetailsSchema>;

/** Public website booking — room type + guest details. */
export const publicBookingSchema = z.object({
  ...dateRangeSchema.shape,
  ...guestDetailsSchema.shape,
  roomTypeId: z.string().min(1, "Choose a room type"),
});

export type PublicBookingValues = z.output<typeof publicBookingSchema>;

/** Admin manual booking — specific room, optional guest email, source. */
export const adminBookingSchema = z.object({
  ...dateRangeSchema.shape,
  fullName: z.string().trim().min(2, "Enter the guest's full name").max(100),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid email address")
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .trim()
    .max(30, "Phone number too long")
    .optional()
    .or(z.literal("")),
  address: z
    .string()
    .trim()
    .max(300, "Address too long")
    .optional()
    .or(z.literal("")),
  notes: z
    .string()
    .trim()
    .max(1000, "Notes too long")
    .optional()
    .or(z.literal("")),
  roomId: z.string().min(1, "Choose a room"),
  source: z.enum([BookingSource.WALK_IN, BookingSource.PHONE]),
});

export type AdminBookingInput = z.input<typeof adminBookingSchema>;
export type AdminBookingValues = z.output<typeof adminBookingSchema>;
