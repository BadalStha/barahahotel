import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";

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

/**
 * Derives FAQPage Q&A pairs from the CMS blocks by convention: every
 * "heading" block starts a question, and the "paragraph" blocks that
 * follow it (until the next heading or image) form its answer.
 */
function faqJsonLd(blocks: ContentBlock[]) {
  const questions: { question: string; answer: string }[] = [];
  let current: { question: string; answer: string[] } | null = null;

  for (const block of blocks) {
    if (block.type === "heading" && block.text?.trim()) {
      if (current) {
        questions.push({
          question: current.question,
          answer: current.answer.join("\n\n"),
        });
      }
      current = { question: block.text.trim(), answer: [] };
    } else if (block.type === "paragraph" && block.text?.trim() && current) {
      current.answer.push(block.text.trim());
    }
  }
  if (current) {
    questions.push({
      question: current.question,
      answer: current.answer.join("\n\n"),
    });
  }

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions
      .filter((q) => q.answer.length > 0)
      .map((q) => ({
        "@type": "Question",
        name: q.question,
        acceptedAnswer: { "@type": "Answer", text: q.answer },
      })),
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const [page, settings] = await Promise.all([
    db.page.findUnique({ where: { slug: "faq" } }),
    getSiteSettings(),
  ]);
  const title =
    page?.metaTitle ?? page?.title ?? "FAQs — Baraha Hotel and Lodge, Bhedetar";
  const description =
    page?.metaDescription ??
    "Answers about staying at Baraha Hotel and Lodge — best time to visit Bhedetar, how to reach us, hot water, WiFi, food and check-in times.";
  return {
    title,
    description,
    ...socialMetadata({
      title,
      description,
      path: "/faq",
      image: getSetting(settings, "homepage_hero_image") || null,
    }),
  };
}

export default async function FaqPage() {
  const page = await db.page.findUnique({ where: { slug: "faq" } });
  if (!page) notFound();

  const blocks = (Array.isArray(page.content) ? page.content : []) as ContentBlock[];

  return (
    <div>
      <PageHero
        title={page.title}
        subtitle={page.metaDescription ?? undefined}
      />

      <Container className="py-12">
        {blocks.length > 0 ? (
          <BlocksRenderer
            blocks={blocks}
            className="mx-auto max-w-3xl"
          />
        ) : (
          <p className="py-10 text-center text-charcoal/50">
            Answers are being written — check back soon.
          </p>
        )}

        <div className="mx-auto mt-10 flex max-w-3xl flex-col items-start gap-3 rounded-2xl bg-pine px-6 py-6 text-stone">
          <h2 className="font-display text-xl">Still have a question?</h2>
          <p className="text-sm leading-relaxed text-stone/80">
            Call, message, or browse our rooms — we usually reply within a day.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="inline-flex h-11 items-center gap-2 rounded-full bg-saffron px-6 text-sm font-semibold text-charcoal transition-colors hover:bg-saffron/90"
            >
              Contact us
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/rooms"
              className="inline-flex h-11 items-center rounded-full border border-white/30 px-6 text-sm font-semibold text-stone transition-colors hover:bg-white/10"
            >
              View rooms
            </Link>
          </div>
        </div>
      </Container>

      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: page.title, path: "/faq" },
          ]),
          faqJsonLd(blocks),
        ]}
      />
    </div>
  );
}
