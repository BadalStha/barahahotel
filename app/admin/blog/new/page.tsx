import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { BlogPostForm } from "@/components/admin/blog/BlogPostForm";

export default function NewBlogPostPage() {
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
          New post
        </h1>
      </div>

      <div className="rounded-xl border border-charcoal/10 bg-white p-6 shadow-sm sm:p-8">
        <BlogPostForm />
      </div>
    </div>
  );
}
