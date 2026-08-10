import Link from "next/link";
import { FileText, Pencil, Plus } from "lucide-react";

import { ConfirmButton } from "@/components/admin/rooms/ConfirmButton";
import { db } from "@/lib/db";
import { deletePageAction } from "../actions";

function blockCountLabel(blocks: unknown): string {
  if (!Array.isArray(blocks)) return "No content";
  const count = blocks.length;
  return count === 0 ? "No content" : `${count} block${count === 1 ? "" : "s"}`;
}

export default async function AdminContentPagesPage() {
  const pages = await db.page.findMany({ orderBy: { title: "asc" } });

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/admin/content"
            className="inline-flex items-center gap-1.5 text-sm text-charcoal/60 transition-colors hover:text-pine"
          >
            ← Content
          </Link>
          <h1 className="mt-2 font-display text-2xl text-charcoal sm:text-3xl">Pages</h1>
          <p className="mt-1 text-sm text-charcoal/60">
            {pages.length} page{pages.length === 1 ? "" : "s"} — About, Amenities, and more
          </p>
        </div>
        <Link
          href="/admin/content/pages/new"
          className="inline-flex h-11 items-center gap-2 rounded-full bg-pine px-5 text-sm font-medium text-stone shadow-[0_10px_20px_-10px_rgba(31,77,58,0.6)] transition-colors hover:bg-pine/90"
        >
          <Plus className="size-4" />
          New page
        </Link>
      </header>

      <div className="overflow-x-auto rounded-xl border border-charcoal/10 bg-white shadow-sm">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="border-b border-charcoal/10 text-xs uppercase tracking-wider text-charcoal/50">
            <tr>
              <th className="px-5 py-3 font-semibold">Page</th>
              <th className="px-5 py-3 font-semibold">Slug</th>
              <th className="px-5 py-3 font-semibold">Content</th>
              <th className="px-5 py-3 font-semibold">Updated</th>
              <th className="px-5 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal/5">
            {pages.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-sm text-charcoal/50">
                  No pages yet — create your first one.
                </td>
              </tr>
            ) : (
              pages.map((page) => (
                <tr key={page.id} className="transition-colors hover:bg-stone/50">
                  <td className="px-5 py-3">
                    <Link
                      href={`/admin/content/pages/${page.slug}/edit`}
                      className="inline-flex items-center gap-2 font-medium text-charcoal transition-colors hover:text-pine"
                    >
                      <FileText className="size-4 text-charcoal/40" />
                      {page.title}
                    </Link>
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-charcoal/60">
                    /{page.slug}
                  </td>
                  <td className="px-5 py-3 text-charcoal/70">
                    {blockCountLabel(page.content)}
                  </td>
                  <td className="px-5 py-3 text-charcoal/60">
                    {page.updatedAt.toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/content/pages/${page.slug}/edit`}
                        className="inline-flex h-9 items-center gap-2 rounded-lg border border-charcoal/15 px-3 text-sm font-medium text-charcoal/70 transition-colors hover:bg-charcoal/5"
                      >
                        <Pencil className="size-4" />
                        Edit
                      </Link>
                      <ConfirmButton
                        description={`Delete the "${page.title}" page?`}
                        onConfirm={deletePageAction.bind(null, page.slug)}
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
