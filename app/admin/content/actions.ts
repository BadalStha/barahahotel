"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";

import { db } from "@/lib/db";
import { revalidatePublicSite } from "@/lib/revalidate";
import { setSiteSettings } from "@/lib/settings";
import {
  pageSchema,
  siteSettingsSchema,
  type PageInput,
  type SiteSettingsInput,
} from "@/lib/validators/content";

export type ActionResult = { error?: string };

function isUniqueError(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002"
  );
}

// ── Site settings ────────────────────────────────────────────────

const SETTING_KEY_MAP: Record<string, string> = {
  hotelName: "hotel_name",
  tagline: "tagline",
  location: "location",
  phone: "phone",
  email: "email",
  socialFacebook: "social_facebook",
  socialInstagram: "social_instagram",
  socialTwitter: "social_twitter",
  socialYoutube: "social_youtube",
  businessHours: "business_hours",
  checkInTime: "check_in_time",
  checkOutTime: "check_out_time",
  taxRate: "invoice_tax_rate",
  heroTitle: "homepage_hero_title",
  heroSubtitle: "homepage_hero_subtitle",
  heroImage: "homepage_hero_image",
  heroBadge: "homepage_hero_badge",
  uspTitle: "homepage_usp_title",
  uspSubtitle: "homepage_usp_subtitle",
  usp1Title: "homepage_usp_1_title",
  usp1Text: "homepage_usp_1_text",
  usp2Title: "homepage_usp_2_title",
  usp2Text: "homepage_usp_2_text",
  usp3Title: "homepage_usp_3_title",
  usp3Text: "homepage_usp_3_text",
  viewpointLabel: "homepage_viewpoint_label",
  viewpointTitle: "homepage_viewpoint_title",
  viewpointText: "homepage_viewpoint_text",
  viewpointImage: "homepage_viewpoint_image",
  homeRoomsTitle: "homepage_rooms_title",
  homeRoomsSubtitle: "homepage_rooms_subtitle",
  homeTestimonialsTitle: "homepage_testimonials_title",
  homeTestimonialsSubtitle: "homepage_testimonials_subtitle",
  homeCtaTitle: "homepage_cta_title",
  homeCtaText: "homepage_cta_text",
  roomsTitle: "rooms_page_title",
  roomsSubtitle: "rooms_page_subtitle",
  diningTitle: "dining_page_title",
  diningSubtitle: "dining_page_subtitle",
  galleryTitle: "gallery_page_title",
  gallerySubtitle: "gallery_page_subtitle",
  blogTitle: "blog_page_title",
  blogSubtitle: "blog_page_subtitle",
  contactTitle: "contact_page_title",
  contactSubtitle: "contact_page_subtitle",
  contactFormTitle: "contact_form_title",
  contactFormText: "contact_form_text",
  diningIntroTitle: "dining_intro_title",
  diningIntroText: "dining_intro_text",
  diningMenuTitle: "dining_menu_title",
  diningCtaTitle: "dining_cta_title",
  diningCtaText: "dining_cta_text",
};

export async function updateSiteSettingsAction(
  input: SiteSettingsInput,
): Promise<ActionResult> {
  const parsed = siteSettingsSchema.safeParse(input);
  if (!parsed.success) return { error: "Please fix the highlighted fields." };

  const entries: Record<string, unknown> = {};
  for (const [field, key] of Object.entries(SETTING_KEY_MAP)) {
    const value = parsed.data[field as keyof SiteSettingsInput];
    entries[key] = typeof value === "string" ? value.trim() : value;
  }
  await setSiteSettings(entries);

  revalidatePath("/admin/content/settings");
  revalidatePublicSite();
  return {};
}

// ── Pages ────────────────────────────────────────────────────────

export async function createPageAction(input: PageInput): Promise<ActionResult> {
  const parsed = pageSchema.safeParse(input);
  if (!parsed.success) return { error: "Please fix the highlighted fields." };

  try {
    const page = await db.page.create({
      data: {
        slug: parsed.data.slug,
        title: parsed.data.title,
        metaTitle: parsed.data.metaTitle || null,
        metaDescription: parsed.data.metaDescription || null,
        content: parsed.data.blocks,
      },
    });
    revalidatePath("/admin/content/pages");
    revalidatePublicSite();
    redirect(`/admin/content/pages/${page.slug}/edit`);
  } catch (error) {
    if (isUniqueError(error)) {
      return { error: "A page with this slug already exists." };
    }
    throw error;
  }
}

export async function updatePageAction(
  slug: string,
  input: PageInput,
): Promise<ActionResult> {
  const parsed = pageSchema.safeParse(input);
  if (!parsed.success) return { error: "Please fix the highlighted fields." };

  const existing = await db.page.findUnique({ where: { slug } });
  if (!existing) return { error: "Page not found." };

  try {
    await db.page.update({
      where: { id: existing.id },
      data: {
        slug: parsed.data.slug,
        title: parsed.data.title,
        metaTitle: parsed.data.metaTitle || null,
        metaDescription: parsed.data.metaDescription || null,
        content: parsed.data.blocks,
      },
    });
    revalidatePath("/admin/content/pages");
    revalidatePath(`/admin/content/pages/${existing.slug}/edit`);
    revalidatePath(`/admin/content/pages/${parsed.data.slug}/edit`);
    revalidatePublicSite();
    redirect(`/admin/content/pages/${parsed.data.slug}/edit`);
  } catch (error) {
    if (isUniqueError(error)) {
      return { error: "A page with this slug already exists." };
    }
    throw error;
  }
}

export async function deletePageAction(slug: string): Promise<void> {
  const page = await db.page.findUnique({ where: { slug }, select: { id: true } });
  if (!page) throw new Error("Page not found.");

  await db.page.delete({ where: { id: page.id } });
  revalidatePath("/admin/content/pages");
  revalidatePublicSite();
  redirect("/admin/content/pages");
}
