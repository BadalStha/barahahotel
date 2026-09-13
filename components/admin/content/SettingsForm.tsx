"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { updateSiteSettingsAction } from "@/app/admin/content/actions";
import { Field, inputClass, inputErrorClass } from "@/components/admin/fields";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import {
  siteSettingsSchema,
  type SiteSettingsInput,
} from "@/lib/validators/content";
import { SingleImageField } from "./SingleImageField";

export type SiteSettingsFormData = {
  hotelName: string;
  tagline: string;
  location: string;
  phone: string;
  email: string;
  socialFacebook: string;
  socialInstagram: string;
  socialTwitter: string;
  socialYoutube: string;
  businessHours: string;
  checkInTime: string;
  checkOutTime: string;
  taxRate: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  heroBadge: string;
  uspTitle: string;
  uspSubtitle: string;
  usp1Title: string;
  usp1Text: string;
  usp2Title: string;
  usp2Text: string;
  usp3Title: string;
  usp3Text: string;
  viewpointLabel: string;
  viewpointTitle: string;
  viewpointText: string;
  viewpointImage: string;
  homeRoomsTitle: string;
  homeRoomsSubtitle: string;
  homeTestimonialsTitle: string;
  homeTestimonialsSubtitle: string;
  homeCtaTitle: string;
  homeCtaText: string;
  roomsTitle: string;
  roomsSubtitle: string;
  diningTitle: string;
  diningSubtitle: string;
  galleryTitle: string;
  gallerySubtitle: string;
  blogTitle: string;
  blogSubtitle: string;
  contactTitle: string;
  contactSubtitle: string;
  contactFormTitle: string;
  contactFormText: string;
  diningIntroTitle: string;
  diningIntroText: string;
  diningMenuTitle: string;
  diningCtaTitle: string;
  diningCtaText: string;
};

const textareaClass =
  "w-full rounded-xl border border-charcoal/15 bg-white px-4 py-3 text-sm text-charcoal placeholder:text-charcoal/40 outline-none transition focus:border-pine focus:ring-2 focus:ring-pine/20";

export function SettingsForm({ settings }: { settings: SiteSettingsFormData }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const defaultValues: SiteSettingsInput = {
    hotelName: settings.hotelName,
    tagline: settings.tagline,
    location: settings.location,
    phone: settings.phone,
    email: settings.email,
    socialFacebook: settings.socialFacebook,
    socialInstagram: settings.socialInstagram,
    socialTwitter: settings.socialTwitter,
    socialYoutube: settings.socialYoutube,
    businessHours: settings.businessHours,
    checkInTime: settings.checkInTime,
    checkOutTime: settings.checkOutTime,
    taxRate: settings.taxRate,
    heroTitle: settings.heroTitle,
    heroSubtitle: settings.heroSubtitle,
    heroImage: settings.heroImage,
    heroBadge: settings.heroBadge,
    uspTitle: settings.uspTitle,
    uspSubtitle: settings.uspSubtitle,
    usp1Title: settings.usp1Title,
    usp1Text: settings.usp1Text,
    usp2Title: settings.usp2Title,
    usp2Text: settings.usp2Text,
    usp3Title: settings.usp3Title,
    usp3Text: settings.usp3Text,
    viewpointLabel: settings.viewpointLabel,
    viewpointTitle: settings.viewpointTitle,
    viewpointText: settings.viewpointText,
    viewpointImage: settings.viewpointImage,
    homeRoomsTitle: settings.homeRoomsTitle,
    homeRoomsSubtitle: settings.homeRoomsSubtitle,
    homeTestimonialsTitle: settings.homeTestimonialsTitle,
    homeTestimonialsSubtitle: settings.homeTestimonialsSubtitle,
    homeCtaTitle: settings.homeCtaTitle,
    homeCtaText: settings.homeCtaText,
    roomsTitle: settings.roomsTitle,
    roomsSubtitle: settings.roomsSubtitle,
    diningTitle: settings.diningTitle,
    diningSubtitle: settings.diningSubtitle,
    galleryTitle: settings.galleryTitle,
    gallerySubtitle: settings.gallerySubtitle,
    blogTitle: settings.blogTitle,
    blogSubtitle: settings.blogSubtitle,
    contactTitle: settings.contactTitle,
    contactSubtitle: settings.contactSubtitle,
    contactFormTitle: settings.contactFormTitle,
    contactFormText: settings.contactFormText,
    diningIntroTitle: settings.diningIntroTitle,
    diningIntroText: settings.diningIntroText,
    diningMenuTitle: settings.diningMenuTitle,
    diningCtaTitle: settings.diningCtaTitle,
    diningCtaText: settings.diningCtaText,
  };

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<SiteSettingsInput>({
    resolver: zodResolver(siteSettingsSchema),
    defaultValues,
  });

  const heroImage = useWatch({ control, name: "heroImage" }) ?? "";
  const viewpointImage = useWatch({ control, name: "viewpointImage" }) ?? "";

  function onSubmit(values: SiteSettingsInput) {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      try {
        const result = await updateSiteSettingsAction(values);
        if (result?.error) {
          setError(result.error);
          return;
        }
        setSaved(true);
        router.refresh();
      } catch (caught) {
        const digest = (caught as { digest?: string } | null)?.digest;
        if (!digest?.startsWith("NEXT_REDIRECT")) {
          console.error("Settings save failed:", caught);
          setError("Something went wrong. Please try again.");
        }
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-8"
    >
      {/* Hotel basics */}
      <section className="flex flex-col gap-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-charcoal/50">
          Hotel basics
        </h2>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Hotel name" error={errors.hotelName?.message}>
            <input
              {...register("hotelName")}
              className={cn(inputClass, errors.hotelName && inputErrorClass)}
            />
          </Field>
          <Field label="Tagline" error={errors.tagline?.message}>
            <input
              {...register("tagline")}
              placeholder="A Himalayan hill-station retreat"
              className={cn(inputClass, errors.tagline && inputErrorClass)}
            />
          </Field>
          <Field label="Address / location" error={errors.location?.message}>
            <input
              {...register("location")}
              placeholder="Bhedetar, Dhankuta, Nepal"
              className={cn(inputClass, errors.location && inputErrorClass)}
            />
          </Field>
          <Field label="Phone" error={errors.phone?.message}>
            <input
              {...register("phone")}
              placeholder="+977-00-0000000"
              className={cn(inputClass, errors.phone && inputErrorClass)}
            />
          </Field>
          <Field label="Email" error={errors.email?.message}>
            <input
              {...register("email")}
              type="email"
              placeholder="info@barahahotel.com"
              className={cn(inputClass, errors.email && inputErrorClass)}
            />
          </Field>
          <Field label="Default tax rate (%)" error={errors.taxRate?.message}>
            <input
              {...register("taxRate")}
              type="number"
              inputMode="decimal"
              step="0.1"
              min="0"
              max="100"
              className={cn(inputClass, errors.taxRate && inputErrorClass)}
            />
          </Field>
        </div>
      </section>

      {/* Hours */}
      <section className="flex flex-col gap-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-charcoal/50">
          Business hours
        </h2>
        <div className="grid gap-5 md:grid-cols-3">
          <Field
            label="Hours"
            hint="e.g. Mon–Sun: 6:00 AM – 10:00 PM"
            error={errors.businessHours?.message}
            className="md:col-span-1"
          >
            <input
              {...register("businessHours")}
              className={cn(inputClass, errors.businessHours && inputErrorClass)}
            />
          </Field>
          <Field label="Check-in time" error={errors.checkInTime?.message}>
            <input
              {...register("checkInTime")}
              placeholder="2:00 PM"
              className={cn(inputClass, errors.checkInTime && inputErrorClass)}
            />
          </Field>
          <Field label="Check-out time" error={errors.checkOutTime?.message}>
            <input
              {...register("checkOutTime")}
              placeholder="12:00 PM"
              className={cn(inputClass, errors.checkOutTime && inputErrorClass)}
            />
          </Field>
        </div>
      </section>

      {/* Social */}
      <section className="flex flex-col gap-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-charcoal/50">
          Social links
        </h2>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Facebook" error={errors.socialFacebook?.message}>
            <input
              {...register("socialFacebook")}
              placeholder="https://facebook.com/…"
              className={cn(inputClass, errors.socialFacebook && inputErrorClass)}
            />
          </Field>
          <Field label="Instagram" error={errors.socialInstagram?.message}>
            <input
              {...register("socialInstagram")}
              placeholder="https://instagram.com/…"
              className={cn(inputClass, errors.socialInstagram && inputErrorClass)}
            />
          </Field>
          <Field label="Twitter / X" error={errors.socialTwitter?.message}>
            <input
              {...register("socialTwitter")}
              placeholder="https://x.com/…"
              className={cn(inputClass, errors.socialTwitter && inputErrorClass)}
            />
          </Field>
          <Field label="YouTube" error={errors.socialYoutube?.message}>
            <input
              {...register("socialYoutube")}
              placeholder="https://youtube.com/…"
              className={cn(inputClass, errors.socialYoutube && inputErrorClass)}
            />
          </Field>
        </div>
      </section>

      {/* Homepage hero */}
      <section className="flex flex-col gap-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-charcoal/50">
          Homepage hero
        </h2>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Hero title" error={errors.heroTitle?.message}>
            <input
              {...register("heroTitle")}
              placeholder="Welcome to Baraha"
              className={cn(inputClass, errors.heroTitle && inputErrorClass)}
            />
          </Field>
          <Field
            label="Hero badge"
            error={errors.heroBadge?.message}
            hint="Small pill above the title."
          >
            <input
              {...register("heroBadge")}
              placeholder="Bhedetar · Dhankuta · Nepal"
              className={cn(inputClass, errors.heroBadge && inputErrorClass)}
            />
          </Field>
          <Field
            label="Hero subtitle"
            error={errors.heroSubtitle?.message}
            className="md:col-span-2"
          >
            <textarea
              {...register("heroSubtitle")}
              rows={2}
              placeholder="A Himalayan hill-station retreat…"
              className={cn(textareaClass, errors.heroSubtitle && inputErrorClass)}
            />
          </Field>
        </div>
        <Field label="Hero image" error={errors.heroImage?.message}>
          <SingleImageField
            value={heroImage}
            onChange={(url) => setValue("heroImage", url, { shouldValidate: true })}
            folder="baraha-hotel/hero"
          />
        </Field>
      </section>

      {/* Why stay with us — three cards */}
      <section className="flex flex-col gap-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-charcoal/50">
          Homepage — why stay with us
        </h2>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Section title" error={errors.uspTitle?.message}>
            <input
              {...register("uspTitle")}
              placeholder="Why stay with us"
              className={cn(inputClass, errors.uspTitle && inputErrorClass)}
            />
          </Field>
          <Field
            label="Section subtitle"
            error={errors.uspSubtitle?.message}
            className="md:col-span-2"
          >
            <textarea
              {...register("uspSubtitle")}
              rows={2}
              placeholder="A short line under the heading…"
              className={cn(textareaClass, errors.uspSubtitle && inputErrorClass)}
            />
          </Field>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {([1, 2, 3] as const).map((n) => (
            <div
              key={n}
              className="flex flex-col gap-4 rounded-xl border border-charcoal/10 p-4"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-charcoal/40">
                Card {n}
              </p>
              <Field
                label={`Title ${n}`}
                error={errors[`usp${n}Title` as const]?.message}
              >
                <input
                  {...register(`usp${n}Title` as const)}
                  placeholder={n === 1 ? "Mountain views" : n === 2 ? "Home-style food" : "Free WiFi"}
                  className={cn(inputClass, errors[`usp${n}Title` as const] && inputErrorClass)}
                />
              </Field>
              <Field label={`Text ${n}`} error={errors[`usp${n}Text` as const]?.message}>
                <textarea
                  {...register(`usp${n}Text` as const)}
                  rows={3}
                  placeholder="What makes this promise true?"
                  className={cn(textareaClass, errors[`usp${n}Text` as const] && inputErrorClass)}
                />
              </Field>
            </div>
          ))}
        </div>
        <p className="text-xs text-charcoal/50">
          Icons are fixed per card (views, dining, connectivity) — the text is
          yours to edit.
        </p>
      </section>

      {/* Viewpoint highlight */}
      <section className="flex flex-col gap-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-charcoal/50">
          Homepage — viewpoint highlight
        </h2>
        <div className="grid gap-5 md:grid-cols-2">
          <Field
            label="Eyebrow label"
            error={errors.viewpointLabel?.message}
            hint="Small text above the title."
          >
            <input
              {...register("viewpointLabel")}
              placeholder="A local favourite"
              className={cn(inputClass, errors.viewpointLabel && inputErrorClass)}
            />
          </Field>
          <Field label="Title" error={errors.viewpointTitle?.message}>
            <input
              {...register("viewpointTitle")}
              placeholder="The Bhedetar viewpoint"
              className={cn(inputClass, errors.viewpointTitle && inputErrorClass)}
            />
          </Field>
          <Field
            label="Text"
            error={errors.viewpointText?.message}
            className="md:col-span-2"
          >
            <textarea
              {...register("viewpointText")}
              rows={4}
              placeholder="Describe the viewpoint experience…"
              className={cn(textareaClass, errors.viewpointText && inputErrorClass)}
            />
          </Field>
        </div>
        <Field label="Image" error={errors.viewpointImage?.message}>
          <SingleImageField
            value={viewpointImage}
            onChange={(url) => setValue("viewpointImage", url, { shouldValidate: true })}
            folder="baraha-hotel/hero"
          />
        </Field>
      </section>

      {/* Homepage — featured rooms / testimonials / CTA banner */}
      <section className="flex flex-col gap-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-charcoal/50">
          Homepage — rooms &amp; suites section
        </h2>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Section title" error={errors.homeRoomsTitle?.message}>
            <input
              {...register("homeRoomsTitle")}
              placeholder="Rooms & suites"
              className={cn(inputClass, errors.homeRoomsTitle && inputErrorClass)}
            />
          </Field>
          <Field
            label="Section subtitle"
            error={errors.homeRoomsSubtitle?.message}
          >
            <textarea
              {...register("homeRoomsSubtitle")}
              rows={2}
              placeholder="Simple, warm rooms with mountain air…"
              className={cn(textareaClass, errors.homeRoomsSubtitle && inputErrorClass)}
            />
          </Field>
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-charcoal/50">
          Homepage — guest testimonials section
        </h2>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Section title" error={errors.homeTestimonialsTitle?.message}>
            <input
              {...register("homeTestimonialsTitle")}
              placeholder="What our guests say"
              className={cn(
                inputClass,
                errors.homeTestimonialsTitle && inputErrorClass,
              )}
            />
          </Field>
          <Field
            label="Section subtitle"
            error={errors.homeTestimonialsSubtitle?.message}
          >
            <textarea
              {...register("homeTestimonialsSubtitle")}
              rows={2}
              placeholder="Real words from real stays."
              className={cn(
                textareaClass,
                errors.homeTestimonialsSubtitle && inputErrorClass,
              )}
            />
          </Field>
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-charcoal/50">
          Homepage — closing call-to-action banner
        </h2>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Banner title" error={errors.homeCtaTitle?.message}>
            <input
              {...register("homeCtaTitle")}
              placeholder="Ready for the hills?"
              className={cn(inputClass, errors.homeCtaTitle && inputErrorClass)}
            />
          </Field>
          <Field label="Banner text" error={errors.homeCtaText?.message}>
            <textarea
              {...register("homeCtaText")}
              rows={2}
              placeholder="Call, WhatsApp, or email us to check availability…"
              className={cn(textareaClass, errors.homeCtaText && inputErrorClass)}
            />
          </Field>
        </div>
      </section>

      {/* Page heroes */}
      <section className="flex flex-col gap-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-charcoal/50">
          Rooms page heading
        </h2>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Page title" error={errors.roomsTitle?.message}>
            <input
              {...register("roomsTitle")}
              placeholder="Rooms & suites"
              className={cn(inputClass, errors.roomsTitle && inputErrorClass)}
            />
          </Field>
          <Field label="Page subtitle" error={errors.roomsSubtitle?.message}>
            <textarea
              {...register("roomsSubtitle")}
              rows={2}
              placeholder="Simple, warm rooms with mountain air…"
              className={cn(textareaClass, errors.roomsSubtitle && inputErrorClass)}
            />
          </Field>
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-charcoal/50">
          Dining page heading &amp; intro
        </h2>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Page title" error={errors.diningTitle?.message}>
            <input
              {...register("diningTitle")}
              placeholder="Dining"
              className={cn(inputClass, errors.diningTitle && inputErrorClass)}
            />
          </Field>
          <Field label="Page subtitle" error={errors.diningSubtitle?.message}>
            <textarea
              {...register("diningSubtitle")}
              rows={2}
              placeholder="Food cooked the way we cook at home…"
              className={cn(textareaClass, errors.diningSubtitle && inputErrorClass)}
            />
          </Field>
          <Field label="Intro title" error={errors.diningIntroTitle?.message}>
            <input
              {...register("diningIntroTitle")}
              placeholder="Our food"
              className={cn(inputClass, errors.diningIntroTitle && inputErrorClass)}
            />
          </Field>
          <Field
            label="Menu section title"
            error={errors.diningMenuTitle?.message}
          >
            <input
              {...register("diningMenuTitle")}
              placeholder="Our menu"
              className={cn(inputClass, errors.diningMenuTitle && inputErrorClass)}
            />
          </Field>
          <Field
            label="Intro text"
            error={errors.diningIntroText?.message}
            className="md:col-span-2"
          >
            <textarea
              {...register("diningIntroText")}
              rows={3}
              placeholder="We serve simple, home-style meals made with local ingredients…"
              className={cn(textareaClass, errors.diningIntroText && inputErrorClass)}
            />
          </Field>
          <Field label="Closing card title" error={errors.diningCtaTitle?.message}>
            <input
              {...register("diningCtaTitle")}
              placeholder="Hungry outside menu hours?"
              className={cn(inputClass, errors.diningCtaTitle && inputErrorClass)}
            />
          </Field>
          <Field label="Closing card text" error={errors.diningCtaText?.message}>
            <textarea
              {...register("diningCtaText")}
              rows={2}
              placeholder="Ask our team about seasonal specials…"
              className={cn(textareaClass, errors.diningCtaText && inputErrorClass)}
            />
          </Field>
        </div>
        <p className="text-xs text-charcoal/50">
          Menu items (dishes and prices) are managed separately under{" "}
          <Link
            href="/admin/dining"
            className="font-medium text-pine hover:underline"
          >
            Dining menu
          </Link>
          .
        </p>
      </section>

      <section className="flex flex-col gap-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-charcoal/50">
          Gallery page heading
        </h2>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Page title" error={errors.galleryTitle?.message}>
            <input
              {...register("galleryTitle")}
              placeholder="Gallery"
              className={cn(inputClass, errors.galleryTitle && inputErrorClass)}
            />
          </Field>
          <Field label="Page subtitle" error={errors.gallerySubtitle?.message}>
            <textarea
              {...register("gallerySubtitle")}
              rows={2}
              placeholder="A glimpse of the hotel, the food, and the hills…"
              className={cn(textareaClass, errors.gallerySubtitle && inputErrorClass)}
            />
          </Field>
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-charcoal/50">
          Blog page heading
        </h2>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Page title" error={errors.blogTitle?.message}>
            <input
              {...register("blogTitle")}
              placeholder="From the hills"
              className={cn(inputClass, errors.blogTitle && inputErrorClass)}
            />
          </Field>
          <Field label="Page subtitle" error={errors.blogSubtitle?.message}>
            <textarea
              {...register("blogSubtitle")}
              rows={2}
              placeholder="Travel notes, food stories, and tips…"
              className={cn(textareaClass, errors.blogSubtitle && inputErrorClass)}
            />
          </Field>
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-charcoal/50">
          Contact page headings
        </h2>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Page title" error={errors.contactTitle?.message}>
            <input
              {...register("contactTitle")}
              placeholder="Contact us"
              className={cn(inputClass, errors.contactTitle && inputErrorClass)}
            />
          </Field>
          <Field label="Page subtitle" error={errors.contactSubtitle?.message}>
            <textarea
              {...register("contactSubtitle")}
              rows={2}
              placeholder="Questions, requests, or just saying hello…"
              className={cn(textareaClass, errors.contactSubtitle && inputErrorClass)}
            />
          </Field>
          <Field label="Form card title" error={errors.contactFormTitle?.message}>
            <input
              {...register("contactFormTitle")}
              placeholder="Send us a message"
              className={cn(inputClass, errors.contactFormTitle && inputErrorClass)}
            />
          </Field>
          <Field label="Form card note" error={errors.contactFormText?.message}>
            <textarea
              {...register("contactFormText")}
              rows={2}
              placeholder="We usually reply within a day."
              className={cn(textareaClass, errors.contactFormText && inputErrorClass)}
            />
          </Field>
        </div>
      </section>

      {error ? (
        <div className="rounded-xl border border-terracotta/30 bg-terracotta/10 px-4 py-3 text-sm text-terracotta">
          {error}
        </div>
      ) : null}

      <div className="flex items-center gap-3 border-t border-charcoal/10 pt-5">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving…" : "Save settings"}
        </Button>
        {saved ? (
          <span className="text-sm font-medium text-pine">Saved ✓</span>
        ) : null}
        <Link
          href="/admin/content"
          className="inline-flex h-11 items-center rounded-full px-6 text-sm font-medium text-charcoal/70 transition-colors hover:text-charcoal"
        >
          Back to content
        </Link>
      </div>
    </form>
  );
}
