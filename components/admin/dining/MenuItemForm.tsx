"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  createMenuItemAction,
  updateMenuItemAction,
} from "@/app/admin/dining/actions";
import { Field, inputClass, inputErrorClass } from "@/components/admin/fields";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import {
  menuItemSchema,
  type MenuItemInput,
} from "@/lib/validators/content";

export type MenuItemFormData = {
  id: string;
  name: string;
  description: string;
  price: string;
  category: string;
  isAvailable: boolean;
  sortOrder: number;
};

const textareaClass =
  "w-full rounded-xl border border-charcoal/15 bg-white px-4 py-3 text-sm text-charcoal placeholder:text-charcoal/40 outline-none transition focus:border-pine focus:ring-2 focus:ring-pine/20";

export function MenuItemForm({ item }: { item?: MenuItemFormData }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const defaultValues: MenuItemInput = item
    ? {
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.category,
        isAvailable: item.isAvailable,
        sortOrder: item.sortOrder,
      }
    : {
        name: "",
        description: "",
        price: "",
        category: "",
        isAvailable: true,
        sortOrder: 0,
      };

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<MenuItemInput>({
    resolver: zodResolver(menuItemSchema),
    defaultValues,
  });

  const isAvailable = useWatch({ control, name: "isAvailable" }) ?? true;

  function onSubmit(values: MenuItemInput) {
    setError(null);
    startTransition(async () => {
      try {
        const result = item
          ? await updateMenuItemAction(item.id, values)
          : await createMenuItemAction(values);
        if (result?.error) setError(result.error);
      } catch (caught) {
        const digest = (caught as { digest?: string } | null)?.digest;
        if (!digest?.startsWith("NEXT_REDIRECT")) {
          console.error("Menu item save failed:", caught);
          setError("Something went wrong. Please try again.");
        }
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
      <Field label="Item name" error={errors.name?.message}>
        <input
          {...register("name")}
          placeholder="Dal Bhat"
          className={cn(inputClass, errors.name && inputErrorClass)}
        />
      </Field>

      <Field
        label="Description"
        error={errors.description?.message}
        hint="One line about the dish — shown under the name on the menu."
      >
        <textarea
          {...register("description")}
          rows={2}
          placeholder="Steamed rice with lentil soup, seasonal vegetables, and pickle."
          className={cn(textareaClass, errors.description && inputErrorClass)}
        />
      </Field>

      <div className="grid gap-5 md:grid-cols-3">
        <Field label="Price (NPR)" error={errors.price?.message}>
          <input
            {...register("price")}
            type="number"
            inputMode="decimal"
            step="1"
            min="0"
            placeholder="350"
            className={cn(inputClass, errors.price && inputErrorClass)}
          />
        </Field>
        <Field
          label="Category"
          error={errors.category?.message}
          hint="Groups items on the menu."
        >
          <input
            {...register("category")}
            placeholder="Mains"
            className={cn(inputClass, errors.category && inputErrorClass)}
          />
        </Field>
        <Field
          label="Sort order"
          error={errors.sortOrder?.message}
          hint="Lower numbers show first."
        >
          <input
            {...register("sortOrder")}
            type="number"
            inputMode="numeric"
            min="0"
            className={cn(inputClass, errors.sortOrder && inputErrorClass)}
          />
        </Field>
      </div>

      <div>
        <button
          type="button"
          role="switch"
          aria-checked={isAvailable}
          onClick={() => setValue("isAvailable", !isAvailable, { shouldValidate: true })}
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
            {isAvailable ? "Available — shown on the menu" : "Hidden from the menu"}
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
          href="/admin/dining"
          className="inline-flex h-11 items-center rounded-full px-6 text-sm font-medium text-charcoal/70 transition-colors hover:text-charcoal"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
