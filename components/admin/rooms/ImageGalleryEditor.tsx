"use client";

import { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ImagePlus,
  Link2,
  Trash2,
} from "lucide-react";
import { CldUploadWidget } from "next-cloudinary";

import { inputClass } from "@/components/admin/fields";
import { cn } from "@/lib/utils";

type GalleryImage = { url: string; altText: string };

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

export function ImageGalleryEditor({
  images,
  onChange,
}: {
  images: GalleryImage[];
  onChange: (next: GalleryImage[]) => void;
}) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [urlInput, setUrlInput] = useState("");

  function move(from: number, to: number) {
    if (to < 0 || to >= images.length || from === to) return;
    const next = [...images];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  }

  function updateAlt(index: number, altText: string) {
    const next = [...images];
    next[index] = { ...next[index], altText };
    onChange(next);
  }

  function remove(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  function addUrl() {
    const url = urlInput.trim();
    if (!url) return;
    onChange([...images, { url, altText: "" }]);
    setUrlInput("");
  }

  return (
    <div className="flex flex-col gap-3">
      {CLOUD_NAME ? (
        <CldUploadWidget
          signatureEndpoint="/api/cloudinary/sign"
          options={{ multiple: true, maxFiles: 6, folder: "baraha-hotel/rooms" }}
          onSuccess={(result) => {
            if (
              result.event === "success" &&
              typeof result.info === "object" &&
              result.info?.secure_url
            ) {
              onChange([...images, { url: result.info.secure_url, altText: "" }]);
            }
          }}
        >
          {({ open }) => (
            <button
              type="button"
              onClick={() => open()}
              className="inline-flex h-10 w-fit cursor-pointer items-center gap-2 rounded-xl border border-pine/30 px-4 text-sm font-medium text-pine transition-colors hover:bg-pine/10"
            >
              <ImagePlus className="size-4" />
              Upload images
            </button>
          )}
        </CldUploadWidget>
      ) : (
        <p className="text-xs text-charcoal/50">
          Cloudinary isn&apos;t configured yet — add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
          NEXT_PUBLIC_CLOUDINARY_API_KEY, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET
          to .env to enable widget uploads. You can still paste image URLs below.
        </p>
      )}

      <div className="flex gap-2">
        <input
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addUrl();
            }
          }}
          placeholder="…or paste an image URL"
          className={inputClass}
        />
        <button
          type="button"
          onClick={addUrl}
          className="inline-flex h-11 shrink-0 cursor-pointer items-center gap-2 rounded-xl border border-charcoal/15 px-4 text-sm font-medium text-charcoal/80 transition-colors hover:bg-charcoal/5"
        >
          <Link2 className="size-4" />
          Add
        </button>
      </div>

      {images.length === 0 ? (
        <p className="text-xs text-charcoal/50">No images yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {images.map((img, index) => (
            <li
              key={`${img.url}-${index}`}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragOver={(e) => {
                e.preventDefault();
                setOverIndex(index);
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (dragIndex !== null && dragIndex !== index) move(dragIndex, index);
                setDragIndex(null);
                setOverIndex(null);
              }}
              onDragEnd={() => {
                setDragIndex(null);
                setOverIndex(null);
              }}
              className={cn(
                "flex items-center gap-3 rounded-xl border bg-white px-3 py-2 transition-colors",
                overIndex === index
                  ? "border-pine/50 bg-pine/5"
                  : "border-charcoal/10",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt=""
                className="size-16 shrink-0 rounded-lg border border-charcoal/10 object-cover"
              />
              <input
                value={img.altText}
                onChange={(e) => updateAlt(index, e.target.value)}
                placeholder="Alt text"
                className="h-9 w-full min-w-0 flex-1 rounded-lg border border-transparent bg-transparent px-2 text-sm text-charcoal placeholder:text-charcoal/40 outline-none transition focus:border-pine/40"
              />
              <div className="flex shrink-0 flex-col gap-0.5">
                <button
                  type="button"
                  onClick={() => move(index, index - 1)}
                  disabled={index === 0}
                  aria-label="Move image up"
                  className="cursor-pointer rounded p-1 text-charcoal/50 transition-colors hover:bg-charcoal/5 hover:text-charcoal disabled:opacity-30"
                >
                  <ArrowUp className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => move(index, index + 1)}
                  disabled={index === images.length - 1}
                  aria-label="Move image down"
                  className="cursor-pointer rounded p-1 text-charcoal/50 transition-colors hover:bg-charcoal/5 hover:text-charcoal disabled:opacity-30"
                >
                  <ArrowDown className="size-4" />
                </button>
              </div>
              <button
                type="button"
                onClick={() => remove(index)}
                aria-label="Remove image"
                className="shrink-0 cursor-pointer rounded p-1 text-terracotta/70 transition-colors hover:bg-terracotta/10 hover:text-terracotta"
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
