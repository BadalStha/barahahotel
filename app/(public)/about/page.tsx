import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { BlocksRenderer } from "@/components/public/BlocksRenderer";
import { PageHero } from "@/components/public/PageHero";
import { Container } from "@/components/ui/Container";
import { db } from "@/lib/db";
import type { ContentBlock } from "@/lib/validators/content";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const page = await db.page.findUnique({ where: { slug: "about" } });
  return {
    title: page?.metaTitle ?? page?.title ?? "About Us",
    description: page?.metaDescription ?? undefined,
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
    </div>
  );
}
