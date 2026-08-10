"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  createPageAction,
  updatePageAction,
} from "@/app/admin/content/actions";
import { Field, inputClass, inputErrorClass } from "@/components/admin/fields";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import {
  pageSchema,
  type ContentBlock,
  type PageInput,
} from "@/lib/validators/content";
import { BlocksEditor } from "./BlocksEditor";

export type PageFormData = {
  slug: string;
  title: string;
  metaTitle: string | null;
  metaDescription: string | null;
  blocks: ContentBlock[];
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function PageForm({ page }: { page?: PageFormData }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [slugTouched, setSlugTouched] = useState(Boolean(page));

  const defaultValues: PageInput = page
    ? {
        slug: page.slug,
        title: page.title,
        metaTitle: page.metaTitle ?? "",
        metaDescription: page.metaDescription ?? "",
        blocks: page.blocks,
      }
    : {
        slug: "",
        title: "",
        metaTitle: "",
        metaDescription: "",
        blocks: [],
      };

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<PageInput>({
    resolver: zodResolver(pageSchema),
    defaultValues,
  });

  const blocks = useWatch({ control, name: "blocks" }) ?? [];

  function onSubmit(values: PageInput) {
    setError(null);
    startTransition(async () => {
      try {
        const result = page
          ? await updatePageAction(page.slug, values)
          : await createPageAction(values);
        if (result?.error) setError(result.error);
      } catch (caught) {
        const digest = (caught as { digest?: string } | null)?.digest;
        if (!digest?.startsWith("NEXT_REDIRECT")) {
          console.error("Page save failed:", caught);
          setError("Something went wrong. Please try again.");
        }
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Title" error={errors.title?.message}>
          <input
            {...register("title", {
              onChange: (e) => {
                if (!slugTouched) {
                  setValue("slug", slugify(e.target.value ?? ""), {
                    shouldValidate: true,
                  });
                }
              },
            })}
            placeholder="About Us"
            className={cn(inputClass, errors.title && inputErrorClass)}
          />
        </Field>
        <Field
          label="Slug"
          hint="Used in the page URL — auto-generated from the title."
          error={errors.slug?.message}
        >
          <input
            {...register("slug")}
            onFocus={() => setSlugTouched(true)}
            placeholder="about"
            className={cn(inputClass, errors.slug && inputErrorClass)}
          />
        </Field>
      </div>

      <Field label="Meta title" hint="Shown in search results. Defaults to the title." error={errors.metaTitle?.message}>
        <input
          {...register("metaTitle")}
          placeholder="About Baraha Hotel and Lodge"
          className={cn(inputClass, errors.metaTitle && inputErrorClass)}
        />
      </Field>

      <Field label="Meta description" hint="Short summary for search engines." error={errors.metaDescription?.message}>
        <textarea
          {...register("metaDescription")}
          rows={2}
          placeholder="A hill-station retreat in Bhedetar, Dhankuta…"
          className={cn(inputClass, "h-auto py-2.5", errors.metaDescription && inputErrorClass)}
        />
      </Field>

      <Field label="Page content" hint="Compose the body from headings, paragraphs, and images.">
        <BlocksEditor
          blocks={blocks}
          onChange={(next) => setValue("blocks", next, { shouldValidate: true })}
        />
      </Field>

      {error ? (
        <div className="rounded-xl border border-terracotta/30 bg-terracotta/10 px-4 py-3 text-sm text-terracotta">
          {error}
        </div>
      ) : null}

      <div className="flex items-center gap-3 border-t border-charcoal/10 pt-5">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving…" : page ? "Save changes" : "Create page"}
        </Button>
        <Link
          href="/admin/content/pages"
          className="inline-flex h-11 items-center rounded-full px-6 text-sm font-medium text-charcoal/70 transition-colors hover:text-charcoal"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
