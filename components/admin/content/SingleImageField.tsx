"use client";

import { useState } from "react";
import { ImagePlus, Link2, Trash2 } from "lucide-react";
import { CldUploadWidget } from "next-cloudinary";

import { inputClass } from "@/components/admin/fields";
import { cn } from "@/lib/utils";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

export function SingleImageField({
  value,
  onChange,
  folder = "baraha-hotel",
}: {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
}) {
  const [urlInput, setUrlInput] = useState("");

  function addUrl() {
    const url = urlInput.trim();
    if (!url) return;
    onChange(url);
    setUrlInput("");
  }

  return (
    <div className="flex flex-col gap-3">
      {value ? (
        <div className="flex w-fit items-center gap-3 rounded-xl border border-charcoal/10 p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt=""
            className="size-24 rounded-lg border border-charcoal/10 object-cover"
          />
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Remove image"
            className="shrink-0 cursor-pointer rounded-lg p-2 text-terracotta/70 transition-colors hover:bg-terracotta/10 hover:text-terracotta"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      ) : (
        <div className="flex size-24 items-center justify-center rounded-xl border border-dashed border-charcoal/20 text-charcoal/30">
          <ImagePlus className="size-6" />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {CLOUD_NAME ? (
          <CldUploadWidget
            signatureEndpoint="/api/cloudinary/sign"
            options={{ multiple: false, folder }}
            onSuccess={(result) => {
              if (
                result.event === "success" &&
                typeof result.info === "object" &&
                result.info?.secure_url
              ) {
                onChange(result.info.secure_url);
              }
            }}
          >
            {({ open }) => (
              <button
                type="button"
                onClick={() => open()}
                className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-pine/30 px-4 text-sm font-medium text-pine transition-colors hover:bg-pine/10"
              >
                <ImagePlus className="size-4" />
                Upload
              </button>
            )}
          </CldUploadWidget>
        ) : null}

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
          className={cn(inputClass, "w-64")}
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
    </div>
  );
}
