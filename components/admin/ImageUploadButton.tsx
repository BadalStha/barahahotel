"use client";

import { useRef, useState } from "react";
import type { ReactNode } from "react";
import { ImagePlus, Loader2 } from "lucide-react";

import { uploadImageToBlob } from "@/lib/upload";
import { cn } from "@/lib/utils";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB — must match /api/upload

/**
 * Reusable "Upload" button that opens a file picker, uploads the selected
 * image(s) through the authenticated /api/upload route, and hands the
 * resulting public URLs to `onUploaded`. Keeps the read-write token
 * server-side.
 */
export function ImageUploadButton({
  folder,
  multiple = false,
  className,
  children,
  onUploaded,
  onError,
}: {
  folder: string;
  multiple?: boolean;
  className?: string;
  children?: ReactNode;
  onUploaded: (urls: string[]) => void;
  onError?: (message: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;

    // Quick client-side guard (the server enforces the same limit).
    const oversized = Array.from(files).find((file) => file.size > MAX_FILE_SIZE);
    if (oversized) {
      onError?.(
        `"${oversized.name}" is over 10 MB — please choose a smaller photo.`,
      );
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setIsUploading(true);
    const uploaded: string[] = [];
    let failed = 0;
    try {
      for (const file of Array.from(files)) {
        try {
          uploaded.push(await uploadImageToBlob(file, folder));
        } catch {
          failed += 1;
        }
      }
      // Report partial successes so the user doesn't lose files 1–2 when
      // file 3 fails.
      if (uploaded.length > 0) onUploaded(uploaded);
      if (failed > 0) {
        onError?.(
          failed === 1
            ? "One upload failed — please try again."
            : `${failed} uploads failed — please try again.`,
        );
      }
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <button
        type="button"
        disabled={isUploading}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-pine/30 px-4 text-sm font-medium text-pine transition-colors hover:bg-pine/10 disabled:opacity-50",
          className,
        )}
      >
        {isUploading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <ImagePlus className="size-4" />
        )}
        {isUploading ? "Uploading…" : (children ?? "Upload")}
      </button>
    </>
  );
}
