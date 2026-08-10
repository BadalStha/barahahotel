"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  createBlogPostAction,
  updateBlogPostAction,
} from "@/app/admin/blog/actions";
import { Field, inputClass, inputErrorClass } from "@/components/admin/fields";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { blogPostSchema, type BlogPostInput } from "@/lib/validators/content";
import { SingleImageField } from "@/components/admin/content/SingleImageField";

export type BlogPostFormData = {
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  coverImageUrl: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  isPublished: boolean;
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

export function BlogPostForm({ post }: { post?: BlogPostFormData }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [slugTouched, setSlugTouched] = useState(Boolean(post));

  const defaultValues: BlogPostInput = post
    ? {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt ?? "",
        content: post.content,
        coverImageUrl: post.coverImageUrl ?? "",
        metaTitle: post.metaTitle ?? "",
        metaDescription: post.metaDescription ?? "",
        isPublished: post.isPublished,
      }
    : {
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        coverImageUrl: "",
        metaTitle: "",
        metaDescription: "",
        isPublished: false,
      };

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<BlogPostInput>({
    resolver: zodResolver(blogPostSchema),
    defaultValues,
  });

  const coverImageUrl = useWatch({ control, name: "coverImageUrl" }) ?? "";
  const isPublished = useWatch({ control, name: "isPublished" }) ?? false;

  function onSubmit(values: BlogPostInput) {
    setError(null);
    startTransition(async () => {
      try {
        const result = post
          ? await updateBlogPostAction(post.slug, values)
          : await createBlogPostAction(values);
        if (result?.error) setError(result.error);
      } catch (caught) {
        const digest = (caught as { digest?: string } | null)?.digest;
        if (!digest?.startsWith("NEXT_REDIRECT")) {
          console.error("Post save failed:", caught);
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
            placeholder="A day trek from Bhedetar"
            className={cn(inputClass, errors.title && inputErrorClass)}
          />
        </Field>
        <Field
          label="Slug"
          hint="Auto-generated from the title — you can edit it."
          error={errors.slug?.message}
        >
          <input
            {...register("slug")}
            onFocus={() => setSlugTouched(true)}
            placeholder="a-day-trek-from-bhedetar"
            className={cn(inputClass, errors.slug && inputErrorClass)}
          />
        </Field>
      </div>

      <Field label="Excerpt" hint="Short summary shown in post listings." error={errors.excerpt?.message}>
        <textarea
          {...register("excerpt")}
          rows={2}
          placeholder="What's this post about?"
          className={cn(textareaClass, errors.excerpt && inputErrorClass)}
        />
      </Field>

      <Field label="Body" error={errors.content?.message}>
        <textarea
          {...register("content")}
          rows={10}
          placeholder="Write the post…"
          className={cn(textareaClass, errors.content && inputErrorClass)}
        />
      </Field>

      <Field label="Cover image" error={errors.coverImageUrl?.message}>
        <SingleImageField
          value={coverImageUrl}
          onChange={(url) => setValue("coverImageUrl", url, { shouldValidate: true })}
          folder="baraha-hotel/blog"
        />
      </Field>

      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Meta title" hint="Shown in search results." error={errors.metaTitle?.message}>
          <input
            {...register("metaTitle")}
            className={cn(inputClass, errors.metaTitle && inputErrorClass)}
          />
        </Field>
        <Field label="Meta description" error={errors.metaDescription?.message}>
          <input
            {...register("metaDescription")}
            className={cn(inputClass, errors.metaDescription && inputErrorClass)}
          />
        </Field>
      </div>

      <div>
        <button
          type="button"
          role="switch"
          aria-checked={isPublished}
          onClick={() => setValue("isPublished", !isPublished, { shouldValidate: true })}
          className="flex cursor-pointer items-center gap-3"
        >
          <span
            className={cn(
              "relative h-6 w-11 rounded-full transition-colors",
              isPublished ? "bg-pine" : "bg-charcoal/20",
            )}
          >
            <span
              className={cn(
                "absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow transition-transform",
                isPublished && "translate-x-5",
              )}
            />
          </span>
          <span className="text-sm font-medium text-charcoal">
            {isPublished
              ? "Published — live on the website"
              : "Draft — hidden until published"}
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
          {isPending ? "Saving…" : post ? "Save changes" : "Create post"}
        </Button>
        <Link
          href="/admin/blog"
          className="inline-flex h-11 items-center rounded-full px-6 text-sm font-medium text-charcoal/70 transition-colors hover:text-charcoal"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
