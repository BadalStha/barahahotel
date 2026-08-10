"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  ImagePlus,
  Trash2,
} from "lucide-react";

import {
  createGalleryImageAction,
  deleteGalleryImageAction,
  reorderGalleryImageAction,
  updateGalleryImageAction,
} from "@/app/admin/gallery/actions";
import { Field, inputClass } from "@/components/admin/fields";
import { cn } from "@/lib/utils";
import { galleryImageSchema } from "@/lib/validators/content";
import { SingleImageField } from "@/components/admin/content/SingleImageField";

type GalleryImageRow = {
  id: string;
  url: string;
  altText: string | null;
  category: string | null;
};

export function GalleryManager({ images }: { images: GalleryImageRow[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [savedId, setSavedId] = useState<string | null>(null);

  // New-image form state
  const [newUrl, setNewUrl] = useState("");
  const [newAlt, setNewAlt] = useState("");
  const [newCategory, setNewCategory] = useState("");

  // Per-card inline edit state
  const [editing, setEditing] = useState<Record<string, { alt: string; category: string }>>({});

  function run(action: () => Promise<{ error?: string } | void>) {
    setError(null);
    startTransition(async () => {
      try {
        const result = await action();
        if (result && "error" in result && result.error) setError(result.error);
        router.refresh();
      } catch (caught) {
        const digest = (caught as { digest?: string } | null)?.digest;
        if (!digest?.startsWith("NEXT_REDIRECT")) {
          console.error("Gallery action failed:", caught);
          setError("Something went wrong. Please try again.");
        }
      }
    });
  }

  function addImage() {
    const parsed = galleryImageSchema.safeParse({
      url: newUrl,
      altText: newAlt,
      category: newCategory,
    });
    if (!parsed.success) {
      setError("Add an image first — upload or paste a URL.");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        const result = await createGalleryImageAction(parsed.data);
        if (result?.error) {
          setError(result.error);
          return;
        }
        setNewUrl("");
        setNewAlt("");
        setNewCategory("");
        router.refresh();
      } catch (caught) {
        console.error("Add image failed:", caught);
        setError("Something went wrong. Please try again.");
      }
    });
  }

  function saveCard(id: string) {
    const draft = editing[id];
    if (!draft) return;
    setError(null);
    startTransition(async () => {
      try {
        const result = await updateGalleryImageAction(id, {
          url: images.find((i) => i.id === id)?.url ?? "",
          altText: draft.alt,
          category: draft.category,
        });
        if (result?.error) {
          setError(result.error);
          return;
        }
        setEditing((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
        setSavedId(id);
        setTimeout(() => setSavedId(null), 1500);
        router.refresh();
      } catch (caught) {
        console.error("Save image failed:", caught);
        setError("Something went wrong. Please try again.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Add form */}
      <div className="rounded-xl border border-charcoal/10 bg-white p-5 shadow-sm">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-charcoal/50">
          <ImagePlus className="size-4" />
          Add photo
        </h2>
        <div className="mt-4 flex flex-col gap-4">
          <SingleImageField
            value={newUrl}
            onChange={setNewUrl}
            folder="baraha-hotel/gallery"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Alt text">
              <input
                value={newAlt}
                onChange={(e) => setNewAlt(e.target.value)}
                placeholder="Sunrise over the hills"
                className={inputClass}
              />
            </Field>
            <Field label="Category">
              <input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Exteriors, Dining, Views…"
                className={inputClass}
              />
            </Field>
          </div>
          <div>
            <button
              type="button"
              onClick={addImage}
              disabled={isPending}
              className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full bg-pine px-5 text-sm font-medium text-stone transition-colors hover:bg-pine/90 disabled:opacity-50"
            >
              <ImagePlus className="size-4" />
              {isPending ? "Adding…" : "Add to gallery"}
            </button>
          </div>
        </div>
      </div>

      {error ? (
        <p className="text-sm font-medium text-terracotta">{error}</p>
      ) : null}

      {/* Grid */}
      {images.length === 0 ? (
        <p className="rounded-xl border border-charcoal/10 bg-white px-5 py-12 text-center text-sm text-charcoal/50">
          No photos yet — add the first one above.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {images.map((image, index) => {
            const draft = editing[image.id];
            return (
              <li
                key={image.id}
                className="flex flex-col overflow-hidden rounded-xl border border-charcoal/10 bg-white shadow-sm"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.url}
                  alt={image.altText ?? ""}
                  className="h-40 w-full object-cover"
                />
                <div className="flex flex-col gap-2 p-3">
                  <input
                    value={draft?.alt ?? image.altText ?? ""}
                    onChange={(e) =>
                      setEditing((prev) => ({
                        ...prev,
                        [image.id]: {
                          alt: e.target.value,
                          category: draft?.category ?? image.category ?? "",
                        },
                      }))
                    }
                    placeholder="Alt text"
                    className="h-9 w-full rounded-lg border border-charcoal/15 bg-white px-3 text-xs text-charcoal outline-none focus:border-pine"
                  />
                  <input
                    value={draft?.category ?? image.category ?? ""}
                    onChange={(e) =>
                      setEditing((prev) => ({
                        ...prev,
                        [image.id]: {
                          alt: draft?.alt ?? image.altText ?? "",
                          category: e.target.value,
                        },
                      }))
                    }
                    placeholder="Category"
                    className="h-9 w-full rounded-lg border border-charcoal/15 bg-white px-3 text-xs text-charcoal outline-none focus:border-pine"
                  />
                  <div className="mt-1 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => run(() => reorderGalleryImageAction(image.id, "up"))}
                        disabled={index === 0 || isPending}
                        aria-label="Move image up"
                        className="cursor-pointer rounded p-1.5 text-charcoal/50 transition-colors hover:bg-charcoal/5 hover:text-charcoal disabled:opacity-30"
                      >
                        <ArrowUp className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => run(() => reorderGalleryImageAction(image.id, "down"))}
                        disabled={index === images.length - 1 || isPending}
                        aria-label="Move image down"
                        className="cursor-pointer rounded p-1.5 text-charcoal/50 transition-colors hover:bg-charcoal/5 hover:text-charcoal disabled:opacity-30"
                      >
                        <ArrowDown className="size-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-1">
                      {savedId === image.id ? (
                        <span className="text-xs font-medium text-pine">
                          <Check className="mr-0.5 inline size-3.5" /> Saved
                        </span>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => saveCard(image.id)}
                        disabled={!draft || isPending}
                        className={cn(
                          "inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg px-3 text-xs font-medium transition-colors disabled:opacity-40",
                          draft
                            ? "bg-pine text-stone hover:bg-pine/90"
                            : "border border-charcoal/15 text-charcoal/50",
                        )}
                      >
                        <Check className="size-3.5" />
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => run(() => deleteGalleryImageAction(image.id))}
                        aria-label="Delete image"
                        className="cursor-pointer rounded-lg border border-terracotta/30 p-1.5 text-terracotta transition-colors hover:bg-terracotta/10"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
