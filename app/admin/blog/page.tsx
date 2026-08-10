import Link from "next/link";
import { Newspaper, Pencil, Plus } from "lucide-react";

import { PublishToggle } from "@/components/admin/content/PublishToggle";
import { ConfirmButton } from "@/components/admin/rooms/ConfirmButton";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import { deleteBlogPostAction, toggleBlogPostPublishedAction } from "./actions";

export default async function AdminBlogPage() {
  const posts = await db.blogPost.findMany({
    orderBy: [{ isPublished: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-charcoal sm:text-3xl">Blog</h1>
          <p className="mt-1 text-sm text-charcoal/60">
            {posts.length} post{posts.length === 1 ? "" : "s"} ·{" "}
            {posts.filter((p) => p.isPublished).length} published
          </p>
        </div>
        <Link
          href="/admin/blog/new"
          className="inline-flex h-11 items-center gap-2 rounded-full bg-pine px-5 text-sm font-medium text-stone shadow-[0_10px_20px_-10px_rgba(31,77,58,0.6)] transition-colors hover:bg-pine/90"
        >
          <Plus className="size-4" />
          New post
        </Link>
      </header>

      <div className="overflow-x-auto rounded-xl border border-charcoal/10 bg-white shadow-sm">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="border-b border-charcoal/10 text-xs uppercase tracking-wider text-charcoal/50">
            <tr>
              <th className="px-5 py-3 font-semibold">Post</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold">Published</th>
              <th className="px-5 py-3 font-semibold">Live</th>
              <th className="px-5 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal/5">
            {posts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-sm text-charcoal/50">
                  No posts yet — write your first one.
                </td>
              </tr>
            ) : (
              posts.map((post) => (
                <tr
                  key={post.id}
                  className={cn(
                    "transition-colors hover:bg-stone/50",
                    !post.isPublished && "opacity-70",
                  )}
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {post.coverImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={post.coverImageUrl}
                          alt=""
                          className="size-11 shrink-0 rounded-lg border border-charcoal/10 object-cover"
                        />
                      ) : (
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-pine/10 text-pine">
                          <Newspaper className="size-5" />
                        </div>
                      )}
                      <div>
                        <Link
                          href={`/admin/blog/${post.slug}/edit`}
                          className="font-medium text-charcoal transition-colors hover:text-pine"
                        >
                          {post.title}
                        </Link>
                        <p className="font-mono text-xs text-charcoal/50">
                          /blog/{post.slug}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                        post.isPublished
                          ? "bg-pine/10 text-pine"
                          : "bg-charcoal/10 text-charcoal/60",
                      )}
                    >
                      {post.isPublished ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-charcoal/60">
                    {post.publishedAt
                      ? post.publishedAt.toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="px-5 py-3">
                    <PublishToggle
                      isPublished={post.isPublished}
                      onToggle={(next) =>
                        toggleBlogPostPublishedAction(post.slug, next)
                      }
                    />
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/blog/${post.slug}/edit`}
                        className="inline-flex h-9 items-center gap-2 rounded-lg border border-charcoal/15 px-3 text-sm font-medium text-charcoal/70 transition-colors hover:bg-charcoal/5"
                      >
                        <Pencil className="size-4" />
                        Edit
                      </Link>
                      <ConfirmButton
                        description={`Delete "${post.title}"?`}
                        onConfirm={deleteBlogPostAction.bind(null, post.slug)}
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
