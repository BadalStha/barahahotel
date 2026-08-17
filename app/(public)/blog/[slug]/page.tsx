import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";

import { CmsImage } from "@/components/public/CmsImage";
import { JsonLd } from "@/components/public/JsonLd";
import { Container } from "@/components/ui/Container";
import { MountainDivider } from "@/components/ui/SectionHeading";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import {
  absoluteImage,
  breadcrumbJsonLd,
  socialMetadata,
  url,
} from "@/lib/seo";

// ISR: cached for an hour, revalidated immediately by admin blog edits.
export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await db.blogPost.findUnique({ where: { slug } });
  if (!post || !post.isPublished) return { title: "Story not found" };
  const title = post.metaTitle ?? post.title;
  const description = post.metaDescription ?? post.excerpt ?? undefined;
  return {
    title: `${title} — Baraha Hotel and Lodge, Bhedetar`,
    description,
    ...socialMetadata({
      title: `${title} — Baraha Hotel and Lodge, Bhedetar`,
      description,
      path: `/blog/${post.slug}`,
      image: post.coverImageUrl,
      type: "article",
    }),
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const post = await db.blogPost.findUnique({ where: { slug } });
  if (!post || !post.isPublished) notFound();

  const paragraphs = post.content
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const blogPostingJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt ?? undefined,
    image: absoluteImage(post.coverImageUrl),
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    url: url(`/blog/${post.slug}`),
    author: { "@type": "Organization", name: "Baraha Hotel and Lodge" },
    publisher: { "@type": "Organization", name: "Baraha Hotel and Lodge" },
  };

  return (
    <div>
      <Container className="py-8 sm:py-12">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-charcoal/60 transition-colors hover:text-pine"
        >
          <ArrowLeft className="size-4" /> All stories
        </Link>

        <article className="mx-auto mt-6 max-w-3xl">
          {post.coverImageUrl ? (
            <CmsImage
              src={post.coverImageUrl}
              alt={post.title}
              priority
              sizes="(max-width: 768px) 100vw, 768px"
              className="aspect-[16/8] w-full rounded-2xl border border-pine/15"
            />
          ) : null}

          <div className="mt-8">
            {post.publishedAt ? (
              <p className="text-sm font-medium uppercase tracking-wider text-charcoal/50">
                {formatDate(post.publishedAt)}
              </p>
            ) : null}
            <h1 className="mt-2 font-display text-3xl leading-tight text-charcoal sm:text-4xl">
              {post.title}
            </h1>
            <MountainDivider className="mt-4" />
          </div>

          <div className="mt-6 flex flex-col gap-5">
            {paragraphs.map((paragraph, i) => (
              <p
                key={i}
                className="text-base leading-relaxed text-charcoal/80"
              >
                {paragraph}
              </p>
            ))}
          </div>

          {post.excerpt ? (
            <p className="mt-8 rounded-2xl border border-pine/15 bg-pine/5 px-5 py-4 text-sm italic text-charcoal/70">
              {post.excerpt}
            </p>
          ) : null}
        </article>
      </Container>

      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
            { name: post.title, path: `/blog/${post.slug}` },
          ]),
          blogPostingJsonLd,
        ]}
      />
    </div>
  );
}
