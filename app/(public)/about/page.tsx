import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { BlocksRenderer } from "@/components/public/BlocksRenderer";
import { JsonLd } from "@/components/public/JsonLd";
import { PageHero } from "@/components/public/PageHero";
import { Container } from "@/components/ui/Container";
import { db } from "@/lib/db";
import { breadcrumbJsonLd, socialMetadata } from "@/lib/seo";
import { getSetting, getSiteSettings } from "@/lib/settings";
import type { ContentBlock } from "@/lib/validators/content";

// ISR: cached for an hour, revalidated immediately by admin content edits.
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const [page, settings] = await Promise.all([
    db.page.findUnique({ where: { slug: "about" } }),
    getSiteSettings(),
  ]);
  const title = page?.metaTitle ?? page?.title ?? "About Us";
  const description = page?.metaDescription ?? undefined;
  return {
    title,
    description,
    ...socialMetadata({
      title,
      description,
      path: "/about",
      image: getSetting(settings, "homepage_hero_image") || null,
    }),
  };
}

export default async function AboutPage() {
  const page = await db.page.findUnique({ where: { slug: "about" } });
  if (!page) notFound();

  const blocks = Array.isArray(page.content) ? page.content : [];

  return (
    <div>
      <PageHero
        title={page.title}
        subtitle={page.metaDescription ?? undefined}
      />

      <Container className="py-12">
        {blocks.length > 0 ? (
          <BlocksRenderer
            blocks={blocks as ContentBlock[]}
            className="mx-auto max-w-3xl"
          />
        ) : (
          <p className="py-10 text-center text-charcoal/50">
            This page is being written — check back soon.
          </p>
        )}
      </Container>

      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
        ])}
      />
    </div>
  );
}
