"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  createRoomTypeAction,
  updateRoomTypeAction,
} from "@/app/admin/rooms/actions";
import { Field, inputClass, inputErrorClass } from "@/components/admin/fields";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { roomTypeSchema, type RoomTypeFormInput } from "@/lib/validators/room";
import { ImageGalleryEditor } from "./ImageGalleryEditor";
import { TagInput } from "./TagInput";

export type RoomTypeFormData = {
  slug: string;
  name: string;
  description: string | null;
  basePrice: string;
  maxOccupancy: number;
  sizeSqft: number | null;
  amenities: string[];
  isActive: boolean;
  images: { url: string; altText: string | null }[];
};

const textareaClass =
  "w-full rounded-xl border border-charcoal/15 bg-white px-4 py-3 text-sm text-charcoal placeholder:text-charcoal/40 outline-none transition focus:border-pine focus:ring-2 focus:ring-pine/20";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function RoomTypeForm({ roomType }: { roomType?: RoomTypeFormData }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  // Once the user edits the slug by hand, stop auto-generating it
  const [slugTouched, setSlugTouched] = useState(Boolean(roomType));

  const defaultValues: RoomTypeFormInput = roomType
    ? {
        name: roomType.name,
        slug: roomType.slug,
        description: roomType.description ?? "",
        basePrice: roomType.basePrice,
        maxOccupancy: roomType.maxOccupancy,
        sizeSqft: roomType.sizeSqft?.toString() ?? "",
        amenities: roomType.amenities,
        images: roomType.images.map((img) => ({
          url: img.url,
          altText: img.altText ?? "",
        })),
        isActive: roomType.isActive,
      }
    : {
        name: "",
        slug: "",
        description: "",
        basePrice: "",
        maxOccupancy: 2,
        sizeSqft: "",
        amenities: [],
        images: [],
        isActive: true,
      };

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<RoomTypeFormInput>({
    resolver: zodResolver(roomTypeSchema),
    defaultValues,
  });

  const amenities = useWatch({ control, name: "amenities" }) ?? [];
  const images = useWatch({ control, name: "images" }) ?? [];
  const isActive = useWatch({ control, name: "isActive" }) ?? true;

  function onSubmit(values: RoomTypeFormInput) {
    setError(null);
    startTransition(async () => {
      try {
        const result = roomType
          ? await updateRoomTypeAction(roomType.slug, values)
          : await createRoomTypeAction(values);
        if (result?.error) setError(result.error);
      } catch (caught) {
        const digest = (caught as { digest?: string } | null)?.digest;
        if (!digest?.startsWith("NEXT_REDIRECT")) {
          console.error("Save failed:", caught);
          setError("Something went wrong. Please try again.");
        }
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-6"
    >
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Name" error={errors.name?.message}>
          <input
            {...register("name", {
              onChange: (e) => {
                if (!slugTouched) {
                  setValue("slug", slugify(e.target.value ?? ""), {
                    shouldValidate: true,
                  });
                }
              },
            })}
            placeholder="Deluxe Room"
            className={cn(inputClass, errors.name && inputErrorClass)}
          />
        </Field>
        <Field
          label="Slug"
          hint="Auto-generated from the name — you can edit it."
          error={errors.slug?.message}
        >
          <input
            {...register("slug")}
            onFocus={() => setSlugTouched(true)}
            placeholder="deluxe-room"
            className={cn(inputClass, errors.slug && inputErrorClass)}
          />
        </Field>
      </div>

      <Field label="Description" error={errors.description?.message}>
        <textarea
          {...register("description")}
          rows={3}
          placeholder="What makes this room special?"
          className={cn(textareaClass, errors.description && inputErrorClass)}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="Base price (NPR / night)" error={errors.basePrice?.message}>
          <input
            {...register("basePrice")}
            type="number"
            inputMode="decimal"
            step="0.01"
            min="1"
            placeholder="2500"
            className={cn(inputClass, errors.basePrice && inputErrorClass)}
          />
        </Field>
        <Field label="Max occupancy" error={errors.maxOccupancy?.message}>
          <input
            {...register("maxOccupancy")}
            type="number"
            inputMode="numeric"
            min="1"
            placeholder="2"
            className={cn(inputClass, errors.maxOccupancy && inputErrorClass)}
          />
        </Field>
        <Field
          label="Size (sq ft)"
          hint="Optional"
          error={errors.sizeSqft?.message}
        >
          <input
            {...register("sizeSqft")}
            type="number"
            inputMode="numeric"
            min="1"
            placeholder="260"
            className={cn(inputClass, errors.sizeSqft && inputErrorClass)}
          />
        </Field>
      </div>

      <Field label="Amenities" hint="Type an amenity and press Enter.">
        <TagInput
          value={amenities}
          onChange={(next) => setValue("amenities", next, { shouldValidate: true })}
        />
      </Field>

      <Field
        label="Images"
        hint="Upload several at once, then drag (or use the arrows) to reorder."
      >
        <ImageGalleryEditor
          images={images.map((img) => ({ url: img.url, altText: img.altText ?? "" }))}
          onChange={(next) => setValue("images", next, { shouldValidate: true })}
        />
      </Field>

      <div>
        <button
          type="button"
          role="switch"
          aria-checked={isActive}
          onClick={() => setValue("isActive", !isActive, { shouldValidate: true })}
          className="flex items-center gap-3"
        >
          <span
            className={cn(
              "relative h-6 w-11 rounded-full transition-colors",
              isActive ? "bg-pine" : "bg-charcoal/20",
            )}
          >
            <span
              className={cn(
                "absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow transition-transform",
                isActive && "translate-x-5",
              )}
            />
          </span>
          <span className="text-sm font-medium text-charcoal">
            {isActive ? "Active — shown on the website" : "Inactive — hidden from the website"}
          </span>
        </button>
      </div>

      {error ? (
        <div className="rounded-xl border border-terracotta/30 bg-terracotta/10 px-4 py-3 text-sm text-terracotta">
          {error}
        </div>
      ) : null}

      <div className="flex items-center gap-3 border-t border-charcoal/10 pt-5">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving…" : "Save room type"}
        </Button>
        <Link
          href="/admin/rooms"
          className="inline-flex h-11 items-center rounded-full px-6 text-sm font-medium text-charcoal/70 transition-colors hover:text-charcoal"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
