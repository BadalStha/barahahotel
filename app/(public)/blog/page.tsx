import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";

import { CmsImage } from "@/components/public/CmsImage";
import { PageHero } from "@/components/public/PageHero";
import { Container } from "@/components/ui/Container";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Stories and travel notes from Baraha Hotel and Lodge — treks, food, and the Dhankuta hills.",
};

export default async function BlogListPage() {
  const posts = await db.blogPost.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div>
      <PageHero
        title="From the hills"
        subtitle="Travel notes, food stories, and tips from around Bhedetar and Dhankuta."
      />

      <Container className="py-12">
        {posts.length === 0 ? (
          <p className="py-16 text-center text-charcoal/50">
            Our first stories are on the way — check back soon.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-pine/15 bg-white shadow-[0_14px_32px_-16px_rgba(43,38,32,0.32)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-16px_rgba(31,77,58,0.4)]"
              >
                <CmsImage
                  src={post.coverImageUrl}
                  alt={post.title}
                  className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  iconClassName="size-10"
                />
                <div className="flex flex-1 flex-col p-5">
                  <p className="text-xs font-medium uppercase tracking-wider text-charcoal/50">
                    {post.publishedAt ? formatDate(post.publishedAt) : ""}
                  </p>
                  <h2 className="mt-1.5 font-display text-xl leading-snug text-charcoal group-hover:text-pine">
                    {post.title}
                  </h2>
                  {post.excerpt ? (
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-charcoal/70">
                      {post.excerpt}
                    </p>
                  ) : null}
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-pine">
                    Read story
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
