"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";

import { db } from "@/lib/db";
import { revalidatePublicSite } from "@/lib/revalidate";
import {
  blogPostSchema,
  type BlogPostInput,
} from "@/lib/validators/content";

export type ActionResult = { error?: string };

function isUniqueError(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002"
  );
}

function toData(input: BlogPostInput) {
  return {
    title: input.title,
    slug: input.slug,
    excerpt: input.excerpt || null,
    content: input.content,
    coverImageUrl: input.coverImageUrl || null,
    metaTitle: input.metaTitle || null,
    metaDescription: input.metaDescription || null,
    isPublished: input.isPublished,
  };
}

export async function createBlogPostAction(
  input: BlogPostInput,
): Promise<ActionResult> {
  const parsed = blogPostSchema.safeParse(input);
  if (!parsed.success) return { error: "Please fix the highlighted fields." };

  try {
    const post = await db.blogPost.create({
      data: {
        ...toData(parsed.data),
        // First publication stamps the date.
        publishedAt: parsed.data.isPublished ? new Date() : null,
      },
    });
    revalidatePath("/admin/blog");
    revalidatePublicSite();
    redirect(`/admin/blog/${post.slug}/edit`);
  } catch (error) {
    if (isUniqueError(error)) {
      return { error: "A post with this slug already exists." };
    }
    throw error;
  }
}

export async function updateBlogPostAction(
  slug: string,
  input: BlogPostInput,
): Promise<ActionResult> {
  const parsed = blogPostSchema.safeParse(input);
  if (!parsed.success) return { error: "Please fix the highlighted fields." };

  const existing = await db.blogPost.findUnique({
    where: { slug },
    select: { id: true, slug: true, publishedAt: true },
  });
  if (!existing) return { error: "Post not found." };

  try {
    await db.blogPost.update({
      where: { id: existing.id },
      data: {
        ...toData(parsed.data),
        publishedAt:
          parsed.data.isPublished && !existing.publishedAt
            ? new Date()
            : existing.publishedAt,
      },
    });
    revalidatePath("/admin/blog");
    revalidatePath(`/admin/blog/${existing.slug}/edit`);
    revalidatePath(`/admin/blog/${parsed.data.slug}/edit`);
    revalidatePublicSite();
    redirect(`/admin/blog/${parsed.data.slug}/edit`);
  } catch (error) {
    if (isUniqueError(error)) {
      return { error: "A post with this slug already exists." };
    }
    throw error;
  }
}

export async function toggleBlogPostPublishedAction(
  slug: string,
  isPublished: boolean,
): Promise<ActionResult> {
  const post = await db.blogPost.findUnique({
    where: { slug },
    select: { id: true, publishedAt: true },
  });
  if (!post) return { error: "Post not found." };

  await db.blogPost.update({
    where: { id: post.id },
    data: {
      isPublished,
      // Stamp the publish date only on the first publish.
      ...(isPublished && !post.publishedAt ? { publishedAt: new Date() } : {}),
    },
  });

  revalidatePath("/admin/blog");
  revalidatePublicSite();
  return {};
}

export async function deleteBlogPostAction(slug: string): Promise<void> {
  const post = await db.blogPost.findUnique({
    where: { slug },
    select: { id: true },
  });
  if (!post) throw new Error("Post not found.");

  await db.blogPost.delete({ where: { id: post.id } });
  revalidatePath("/admin/blog");
  revalidatePublicSite();
  redirect("/admin/blog");
}
