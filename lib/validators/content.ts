import { z } from "zod";

// ── Site settings ────────────────────────────────────────────────
// All values are stored as JSON-encoded SiteSetting rows (see lib/settings.ts).

const optionalString = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Max ${max} characters`)
    .optional()
    .or(z.literal(""));

export const siteSettingsSchema = z.object({
  hotelName: z.string().trim().min(1, "Hotel name is required").max(120),
  tagline: optionalString(300),
  location: optionalString(200),
  phone: optionalString(50),
  email: optionalString(120),
  socialFacebook: optionalString(300),
  socialInstagram: optionalString(300),
  socialTwitter: optionalString(300),
  socialYoutube: optionalString(300),
  businessHours: optionalString(300),
  checkInTime: optionalString(30),
  checkOutTime: optionalString(30),
  taxRate: z.coerce
    .number({ message: "Enter a tax rate" })
    .min(0, "Tax rate can't be negative")
    .max(100, "Max 100%"),
  heroTitle: optionalString(200),
  heroSubtitle: optionalString(500),
  heroImage: optionalString(500),
  heroBadge: optionalString(100),
  // Homepage USP section (three cards — icons are fixed per slot)
  uspTitle: optionalString(200),
  uspSubtitle: optionalString(500),
  usp1Title: optionalString(120),
  usp1Text: optionalString(500),
  usp2Title: optionalString(120),
  usp2Text: optionalString(500),
  usp3Title: optionalString(120),
  usp3Text: optionalString(500),
  // Homepage viewpoint highlight
  viewpointLabel: optionalString(100),
  viewpointTitle: optionalString(200),
  viewpointText: optionalString(1000),
  viewpointImage: optionalString(500),
  // Homepage rooms / testimonials / CTA banner sections
  homeRoomsTitle: optionalString(200),
  homeRoomsSubtitle: optionalString(500),
  homeTestimonialsTitle: optionalString(200),
  homeTestimonialsSubtitle: optionalString(500),
  homeCtaTitle: optionalString(200),
  homeCtaText: optionalString(500),
  // Page heroes (rooms / dining / gallery / blog / contact)
  roomsTitle: optionalString(200),
  roomsSubtitle: optionalString(500),
  diningTitle: optionalString(200),
  diningSubtitle: optionalString(500),
  galleryTitle: optionalString(200),
  gallerySubtitle: optionalString(500),
  blogTitle: optionalString(200),
  blogSubtitle: optionalString(500),
  contactTitle: optionalString(200),
  contactSubtitle: optionalString(500),
  contactFormTitle: optionalString(200),
  contactFormText: optionalString(300),
  // Dining page copy
  diningIntroTitle: optionalString(200),
  diningIntroText: optionalString(2000),
  diningMenuTitle: optionalString(200),
  diningCtaTitle: optionalString(200),
  diningCtaText: optionalString(500),
});

export type SiteSettingsInput = z.input<typeof siteSettingsSchema>;
export type SiteSettingsValues = z.output<typeof siteSettingsSchema>;

// ── Pages (structured block content) ─────────────────────────────

export const contentBlockSchema = z.object({
  type: z.enum(["heading", "paragraph", "image"]),
  text: optionalString(5000),
  url: optionalString(500),
  alt: optionalString(200),
});

export type ContentBlock = z.output<typeof contentBlockSchema>;

export const pageSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Use lowercase letters, numbers, and hyphens",
    ),
  title: z.string().trim().min(1, "Title is required").max(200),
  metaTitle: optionalString(200),
  metaDescription: optionalString(300),
  blocks: z.array(contentBlockSchema).max(50, "Max 50 blocks").default([]),
});

export type PageInput = z.input<typeof pageSchema>;
export type PageValues = z.output<typeof pageSchema>;

// ── Gallery ──────────────────────────────────────────────────────

const safeImageUrl = z.string().trim().url("Enter a valid image URL").max(500).refine((value) => {
  try {
    const url = new URL(value);
    return url.protocol === "https:";
  } catch {
    return false;
  }
}, "Image URLs must use HTTPS");

export const galleryImageSchema = z.object({
  url: safeImageUrl,
  altText: optionalString(200),
  category: optionalString(50),
});

export type GalleryImageInput = z.input<typeof galleryImageSchema>;
export type GalleryImageValues = z.output<typeof galleryImageSchema>;

// ── Dining menu items ────────────────────────────────────────────

export const menuItemSchema = z.object({
  name: z.string().trim().min(1, "Item name is required").max(120),
  description: optionalString(500),
  price: z.coerce
    .number({ message: "Enter a price" })
    .min(0, "Price can't be negative")
    .max(1000000, "Price is too high"),
  category: optionalString(60),
  isAvailable: z.boolean().default(true),
  sortOrder: z.coerce
    .number({ message: "Enter a sort order" })
    .int("Whole number")
    .min(0, "Can't be negative")
    .max(9999, "Too large")
    .default(0),
});

export type MenuItemInput = z.input<typeof menuItemSchema>;
export type MenuItemValues = z.output<typeof menuItemSchema>;

// ── Blog ─────────────────────────────────────────────────────────

export const blogPostSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Use lowercase letters, numbers, and hyphens",
    ),
  excerpt: optionalString(300),
  content: z.string().trim().min(1, "Body is required"),
  coverImageUrl: optionalString(500),
  metaTitle: optionalString(200),
  metaDescription: optionalString(300),
  isPublished: z.boolean().default(false),
});

export type BlogPostInput = z.input<typeof blogPostSchema>;
export type BlogPostValues = z.output<typeof blogPostSchema>;

// ── Public contact form ──────────────────────────────────────────

export const contactMessageSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(100),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  message: z.string().trim().min(10, "Message is a bit short").max(2000),
});

export type ContactMessageInput = z.input<typeof contactMessageSchema>;
export type ContactMessageValues = z.output<typeof contactMessageSchema>;

// ── Testimonials ─────────────────────────────────────────────────

export const testimonialSchema = z.object({
  guestName: z.string().trim().min(2, "Guest name is required").max(100),
  quote: z.string().trim().min(5, "Quote is too short").max(2000),
  rating: z.coerce
    .number({ message: "Pick a rating" })
    .int("Whole number")
    .min(1, "Min 1 star")
    .max(5, "Max 5 stars"),
  isPublished: z.boolean().default(true),
});

export type TestimonialInput = z.input<typeof testimonialSchema>;
export type TestimonialValues = z.output<typeof testimonialSchema>;
