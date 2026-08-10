"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { CmsImage } from "./CmsImage";

export type GalleryPhoto = {
  id: string;
  url: string;
  altText: string | null;
  category: string | null;
};

export function GalleryGrid({ photos }: { photos: GalleryPhoto[] }) {
  const categories = useMemo(() => {
    const set = new Set<string>();
    photos.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return [...set].sort();
  }, [photos]);

  const [category, setCategory] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filtered = useMemo(
    () => (category ? photos.filter((p) => p.category === category) : photos),
    [photos, category],
  );

  const close = useCallback(() => setLightboxIndex(null), []);
  const step = useCallback(
    (dir: 1 | -1) => {
      setLightboxIndex((i) =>
        i === null ? null : (i + dir + filtered.length) % filtered.length,
      );
    },
    [filtered.length],
  );

  // Keyboard: arrows navigate, Escape closes.
  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightboxIndex, close, step]);

  if (photos.length === 0) {
    return (
      <p className="py-16 text-center text-charcoal/50">
        Photos are on their way — check back soon.
      </p>
    );
  }

  const active = lightboxIndex !== null ? filtered[lightboxIndex] : null;

  return (
    <div className="flex flex-col gap-6">
      {/* Category filter */}
      {categories.length > 1 ? (
        <div className="flex flex-wrap justify-center gap-1.5">
          <button
            type="button"
            onClick={() => setCategory(null)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              category === null
                ? "bg-pine text-stone"
                : "bg-white text-charcoal/70 ring-1 ring-charcoal/10 hover:bg-charcoal/5",
            )}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                category === c
                  ? "bg-pine text-stone"
                  : "bg-white text-charcoal/70 ring-1 ring-charcoal/10 hover:bg-charcoal/5",
              )}
            >
              {c}
            </button>
          ))}
        </div>
      ) : null}

      {/* Masonry grid */}
      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
        {filtered.map((photo, index) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => setLightboxIndex(index)}
            aria-label={`View ${photo.altText ?? "photo"} enlarged`}
            className="group mb-4 block w-full cursor-zoom-in overflow-hidden rounded-xl border border-pine/15 shadow-[0_14px_32px_-16px_rgba(43,38,32,0.32)] transition-transform duration-300 hover:-translate-y-0.5"
          >
            <CmsImage
              src={photo.url}
              alt={photo.altText ?? ""}
              className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
              iconClassName="size-10"
            />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {active ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={active.altText ?? "Photo viewer"}
          className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/90 p-4 backdrop-blur-sm"
          onClick={close}
        >
          <button
            type="button"
            aria-label="Close viewer"
            onClick={close}
            className="absolute right-4 top-4 flex size-11 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <X className="size-5" />
          </button>

          <button
            type="button"
            aria-label="Previous photo"
            onClick={(e) => {
              e.stopPropagation();
              step(-1);
            }}
            className="absolute left-2 flex size-11 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:left-6"
          >
            <ChevronLeft className="size-6" />
          </button>

          <figure className="max-h-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <CmsImage
              src={active.url}
              alt={active.altText ?? ""}
              className="max-h-[80vh] w-auto rounded-xl object-contain"
              priority
              iconClassName="size-14"
            />
            {active.altText ? (
              <figcaption className="mt-3 text-center text-sm text-stone/80">
                {active.altText}
              </figcaption>
            ) : null}
            <p className="mt-1 text-center text-xs text-stone/50">
              {lightboxIndex! + 1} / {filtered.length}
            </p>
          </figure>

          <button
            type="button"
            aria-label="Next photo"
            onClick={(e) => {
              e.stopPropagation();
              step(1);
            }}
            className="absolute right-2 flex size-11 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:right-6"
          >
            <ChevronRight className="size-6" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
