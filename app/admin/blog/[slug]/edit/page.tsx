import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { BlogPostForm } from "@/components/admin/blog/BlogPostForm";
import { db } from "@/lib/db";

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await db.blogPost.findUnique({ where: { slug } });
  if (!post) notFound();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <Link
          href="/admin/blog"
          className="inline-flex items-center gap-1.5 text-sm text-charcoal/60 transition-colors hover:text-pine"
        >
          <ArrowLeft className="size-4" />
          Blog
        </Link>
        <h1 className="mt-2 font-display text-2xl text-charcoal sm:text-3xl">
          Edit post
        </h1>
        <p className="mt-1 text-sm text-charcoal/60">/{post.slug}</p>
      </div>

      <div className="rounded-xl border border-charcoal/10 bg-white p-6 shadow-sm sm:p-8">
        <BlogPostForm
          post={{
            slug: post.slug,
            title: post.title,
            excerpt: post.excerpt,
            content: post.content,
            coverImageUrl: post.coverImageUrl,
            metaTitle: post.metaTitle,
            metaDescription: post.metaDescription,
            isPublished: post.isPublished,
          }}
        />
      </div>
    </div>
  );
}
