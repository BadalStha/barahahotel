import type { ReactNode } from "react";

import type { ContentBlock } from "@/lib/validators/content";
import { cn } from "@/lib/utils";
import { CmsImage } from "./CmsImage";

function renderBlock(block: ContentBlock, index: number): ReactNode {
  switch (block.type) {
    case "heading":
      return (
        <h2
          key={index}
          className="font-display text-2xl leading-tight text-charcoal sm:text-3xl"
        >
          {block.text}
        </h2>
      );
    case "paragraph":
      return (
        <p
          key={index}
          className="max-w-2xl text-base leading-relaxed text-charcoal/75"
        >
          {block.text}
        </p>
      );
    case "image":
      return block.url ? (
        <CmsImage
          key={index}
          src={block.url}
          alt={block.alt || ""}
          className="aspect-[16/9] w-full rounded-2xl border border-pine/15 object-cover shadow-[0_14px_32px_-16px_rgba(43,38,32,0.35)]"
        />
      ) : null;
    default:
      return null;
  }
}

export function BlocksRenderer({
  blocks,
  className,
}: {
  blocks: ContentBlock[];
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-5", className)}>
      {blocks.map(renderBlock)}
    </div>
  );
}
