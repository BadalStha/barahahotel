/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { Mountain } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * CMS images can point anywhere (local seed paths, Cloudinary, pasted URLs)
 * and may be missing — this component swaps a broken/missing image for a
 * styled placeholder so cards never show a broken-image icon.
 */
export function CmsImage({
  src,
  alt,
  className,
  priority = false,
  iconClassName = "size-10",
}: {
  src?: string | null;
  alt: string;
  className?: string;
  priority?: boolean;
  iconClassName?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
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

  return (
    <img
      src={src}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
