import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import {
  PageForm,
  type PageFormData,
} from "@/components/admin/content/PageForm";
import { db } from "@/lib/db";

export default async function EditContentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await db.page.findUnique({ where: { slug } });
  if (!page) notFound();

  const blocks = Array.isArray(page.content) ? page.content : [];

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <Link
          href="/admin/content/pages"
          className="inline-flex items-center gap-1.5 text-sm text-charcoal/60 transition-colors hover:text-pine"
        >
          <ArrowLeft className="size-4" />
          Pages
        </Link>
        <h1 className="mt-2 font-display text-2xl text-charcoal sm:text-3xl">
          Edit page
        </h1>
        <p className="mt-1 text-sm text-charcoal/60">/{page.slug}</p>
      </div>

      <div className="rounded-xl border border-charcoal/10 bg-white p-6 shadow-sm sm:p-8">
        <PageForm
          page={{
            slug: page.slug,
            title: page.title,
            metaTitle: page.metaTitle,
            metaDescription: page.metaDescription,
            blocks: blocks as PageFormData["blocks"],
          }}
        />
      </div>
    </div>
  );
}
