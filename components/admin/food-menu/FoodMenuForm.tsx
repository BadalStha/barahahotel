"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlus, Link2, Trash2, Utensils } from "lucide-react";
import { CldUploadWidget } from "next-cloudinary";

import {
  createFoodMenuItemAction,
  updateFoodMenuItemAction,
} from "@/app/admin/food-menu/actions";
import { Field, inputClass, inputErrorClass } from "@/components/admin/fields";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import {
  FOOD_CATEGORIES,
  FOOD_CATEGORY_LABELS,
  foodMenuItemSchema,
  type FoodMenuItemFormInput,
} from "@/lib/validators/food";

const textareaClass =
  "w-full rounded-xl border border-charcoal/15 bg-white px-4 py-3 text-sm text-charcoal placeholder:text-charcoal/40 outline-none transition focus:border-pine focus:ring-2 focus:ring-pine/20";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

export type FoodMenuItemFormData = {
  id: string;
  name: string;
  category: (typeof FOOD_CATEGORIES)[number];
  price: string;
  description: string | null;
  imageUrl: string | null;
  isAvailable: boolean;
};

export function FoodMenuForm({ item }: { item?: FoodMenuItemFormData }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [urlInput, setUrlInput] = useState("");

  const defaultValues: FoodMenuItemFormInput = item
    ? {
        name: item.name,
        category: item.category,
        price: item.price,
        description: item.description ?? "",
        imageUrl: item.imageUrl ?? "",
        isAvailable: item.isAvailable,
      }
    : {
        name: "",
        category: "BREAKFAST",
        price: "",
        description: "",
        imageUrl: "",
        isAvailable: true,
      };

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<FoodMenuItemFormInput>({
    resolver: zodResolver(foodMenuItemSchema),
    defaultValues,
  });

  const imageUrl = useWatch({ control, name: "imageUrl" }) ?? "";
  const isAvailable = useWatch({ control, name: "isAvailable" }) ?? true;

  function addUrl() {
    const url = urlInput.trim();
    if (!url) return;
    setValue("imageUrl", url, { shouldValidate: true });
    setUrlInput("");
  }

  function onSubmit(values: FoodMenuItemFormInput) {
    setError(null);
    startTransition(async () => {
      try {
        const result = item
          ? await updateFoodMenuItemAction(item.id, values)
          : await createFoodMenuItemAction(values);
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
            {...register("name")}
            placeholder="Dal Bhat"
            className={cn(inputClass, errors.name && inputErrorClass)}
          />
        </Field>
        <Field label="Category" error={errors.category?.message}>
          <select
            {...register("category")}
            className={cn(inputClass, "cursor-pointer")}
          >
            {FOOD_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {FOOD_CATEGORY_LABELS[category]}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Price (NPR)" error={errors.price?.message}>
        <input
          {...register("price")}
          type="number"
          inputMode="decimal"
          step="0.01"
          min="1"
          placeholder="350"
          className={cn(inputClass, "max-w-56", errors.price && inputErrorClass)}
        />
      </Field>

      <Field label="Description" error={errors.description?.message}>
        <textarea
          {...register("description")}
          rows={3}
          placeholder="What's in the dish?"
          className={cn(textareaClass, errors.description && inputErrorClass)}
        />
      </Field>

      <Field
        label="Photo"
        hint="Optional — uploaded photos show on the menu and order screen."
        error={errors.imageUrl?.message}
      >
        <div className="flex flex-col gap-3">
          {imageUrl ? (
            <div className="flex w-fit items-center gap-3 rounded-xl border border-charcoal/10 p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt=""
                className="size-20 rounded-lg border border-charcoal/10 object-cover"
              />
              <button
                type="button"
                onClick={() => setValue("imageUrl", "", { shouldValidate: true })}
                aria-label="Remove photo"
                className="shrink-0 cursor-pointer rounded-lg p-2 text-terracotta/70 transition-colors hover:bg-terracotta/10 hover:text-terracotta"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ) : (
            <div className="flex size-20 items-center justify-center rounded-xl border border-dashed border-charcoal/20 text-charcoal/30">
              <Utensils className="size-6" />
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            {CLOUD_NAME ? (
              <CldUploadWidget
                signatureEndpoint="/api/cloudinary/sign"
                options={{ multiple: false, folder: "baraha-hotel/food" }}
                onSuccess={(result) => {
                  if (
                    result.event === "success" &&
                    typeof result.info === "object" &&
                    result.info?.secure_url
                  ) {
                    setValue("imageUrl", result.info.secure_url, {
                      shouldValidate: true,
                    });
                  }
                }}
              >
                {({ open }) => (
                  <button
                    type="button"
                    onClick={() => open()}
                    className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-pine/30 px-4 text-sm font-medium text-pine transition-colors hover:bg-pine/10"
                  >
                    <ImagePlus className="size-4" />
                    Upload photo
                  </button>
                )}
              </CldUploadWidget>
            ) : null}

            <input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addUrl();
                }
              }}
              placeholder="…or paste an image URL"
              className={cn(inputClass, "w-64")}
            />
            <button
              type="button"
              onClick={addUrl}
              className="inline-flex h-11 shrink-0 cursor-pointer items-center gap-2 rounded-xl border border-charcoal/15 px-4 text-sm font-medium text-charcoal/80 transition-colors hover:bg-charcoal/5"
            >
              <Link2 className="size-4" />
              Add
            </button>
          </div>
        </div>
      </Field>

      <div>
        <button
          type="button"
          role="switch"
          aria-checked={isAvailable}
          onClick={() => setValue("isAvailable", !isAvailable, {
            shouldValidate: true,
          })}
          className="flex cursor-pointer items-center gap-3"
        >
          <span
            className={cn(
              "relative h-6 w-11 rounded-full transition-colors",
              isAvailable ? "bg-pine" : "bg-charcoal/20",
            )}
          >
            <span
              className={cn(
                "absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow transition-transform",
                isAvailable && "translate-x-5",
              )}
            />
          </span>
          <span className="text-sm font-medium text-charcoal">
            {isAvailable
              ? "Available — shown in the menu"
              : "Unavailable — hidden from orders"}
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
          {isPending ? "Saving…" : item ? "Save changes" : "Add menu item"}
        </Button>
        <Link
          href="/admin/food-menu"
          className="inline-flex h-11 items-center rounded-full px-6 text-sm font-medium text-charcoal/70 transition-colors hover:text-charcoal"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
