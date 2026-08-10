"use client";

import Image from "next/image";
import { useState } from "react";
import { Mountain } from "lucide-react";

import { optimizeCloudinaryUrl } from "@/lib/seo";
import { cn } from "@/lib/utils";

/**
 * CMS images can point anywhere (local seed paths, Vercel Blob, Cloudinary,
 * pasted URLs) and may be missing — this component renders a `next/image`
 * (fill + sizes) and swaps a broken/missing image for a styled placeholder
 * so cards never show a broken-image icon. Legacy Cloudinary URLs get
 * f_auto,q_auto appended; Blob URLs pass through unchanged.
 *
 * `className` is applied to the positioned wrapper — pass an aspect-ratio
 * (e.g. `aspect-[16/9] w-full`), a fixed height (e.g. `h-48 w-full`), or
 * `absolute inset-0 size-full` for full-bleed heroes.
 */
export function CmsImage({
  src,
  alt,
  className,
  imageClassName,
  priority = false,
  sizes = "100vw",
  objectFit = "cover",
  iconClassName = "size-10",
}: {
  src?: string | null;
  alt: string;
  /** Applied to the positioned wrapper (aspect ratio / fixed size). */
  className?: string;
  /** Applied to the <img> itself (hover transforms etc.). */
  imageClassName?: string;
  priority?: boolean;
  sizes?: string;
  objectFit?: "cover" | "contain";
  iconClassName?: string;
}) {
  const [failed, setFailed] = useState(false);
  const imageSrc = optimizeCloudinaryUrl(src);

  if (!imageSrc || failed) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gradient-to-br from-pine/20 to-pine/5 text-pine/60",
          className,
        )}
      >
        <Mountain className={iconClassName} />
      </div>
    );
  }

  // `fill` needs a positioned wrapper; callers that pass `absolute` (heroes)
  // already position themselves, everyone else gets `relative`.
  const hasExplicitPosition = /(^|\s)(absolute|fixed|sticky)(\s|$)/.test(
    className ?? "",
  );

  return (
    <div
      className={cn(
        "overflow-hidden",
        hasExplicitPosition ? "" : "relative",
        className,
      )}
    >
      <Image
        src={imageSrc}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        onError={() => setFailed(true)}
        className={cn(
          objectFit === "contain" ? "object-contain" : "object-cover",
          imageClassName,
        )}
      />
    </div>
  );
}
