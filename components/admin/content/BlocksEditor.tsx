"use client";

import {
  AlignLeft,
  ArrowDown,
  ArrowUp,
  Heading1,
  ImagePlus,
  Trash2,
} from "lucide-react";

import { inputClass } from "@/components/admin/fields";
import { cn } from "@/lib/utils";
import type { ContentBlock } from "@/lib/validators/content";

const BLOCK_LABELS: Record<ContentBlock["type"], string> = {
  heading: "Heading",
  paragraph: "Paragraph",
  image: "Image",
};

function blockLabel(type: ContentBlock["type"] | undefined): string {
  return type ? (BLOCK_LABELS[type] ?? "Block") : "Block";
}

export function BlocksEditor({
  blocks,
  onChange,
}: {
  blocks: ContentBlock[];
  onChange: (next: ContentBlock[]) => void;
}) {
  function update(index: number, patch: Partial<ContentBlock>) {
    const next = [...blocks];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  }

  function remove(index: number) {
    onChange(blocks.filter((_, i) => i !== index));
  }

  function move(index: number, direction: -1 | 1) {
    const to = index + direction;
    if (to < 0 || to >= blocks.length) return;
    const next = [...blocks];
    const [block] = next.splice(index, 1);
    next.splice(to, 0, block);
    onChange(next);
  }

  function add(type: ContentBlock["type"]) {
    const base: ContentBlock = { type, text: "", url: "", alt: "" };
    onChange([...blocks, base]);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {(
          [
            { type: "heading", label: "Heading", icon: Heading1 },
            { type: "paragraph", label: "Paragraph", icon: AlignLeft },
            { type: "image", label: "Image", icon: ImagePlus },
          ] as const
        ).map(({ type, label, icon: Icon }) => (
          <button
            key={type}
            type="button"
            onClick={() => add(type)}
            className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-pine/30 px-3.5 text-xs font-medium text-pine transition-colors hover:bg-pine/10"
          >
            <Icon className="size-3.5" />
            Add {label}
          </button>
        ))}
      </div>

      {blocks.length === 0 ? (
        <p className="rounded-xl border border-dashed border-charcoal/20 px-4 py-6 text-center text-xs text-charcoal/50">
          No content yet — add a heading, paragraph, or image block above.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {blocks.map((block, index) => (
            <li
              key={index}
              className="rounded-xl border border-charcoal/10 bg-white p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-full bg-charcoal/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-charcoal/50">
                  {blockLabel(block.type)}
                </span>
                <div className="flex items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    aria-label="Move block up"
                    className="cursor-pointer rounded p-1 text-charcoal/50 transition-colors hover:bg-charcoal/5 hover:text-charcoal disabled:opacity-30"
                  >
                    <ArrowUp className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={index === blocks.length - 1}
                    aria-label="Move block down"
                    className="cursor-pointer rounded p-1 text-charcoal/50 transition-colors hover:bg-charcoal/5 hover:text-charcoal disabled:opacity-30"
                  >
                    <ArrowDown className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    aria-label="Delete block"
                    className="cursor-pointer rounded p-1 text-terracotta/70 transition-colors hover:bg-terracotta/10 hover:text-terracotta"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>

              {block.type === "heading" ? (
                <input
                  value={block.text ?? ""}
                  onChange={(e) => update(index, { text: e.target.value })}
                  placeholder="Heading text"
                  className={cn(inputClass, "mt-2 font-display")}
                />
              ) : null}

              {block.type === "paragraph" ? (
                <textarea
                  value={block.text ?? ""}
                  onChange={(e) => update(index, { text: e.target.value })}
                  placeholder="Write a paragraph…"
                  rows={3}
                  className={cn(
                    inputClass,
                    "mt-2 h-auto py-2.5 leading-relaxed",
                  )}
                />
              ) : null}

              {block.type === "image" ? (
                <div className="mt-2 flex flex-col gap-2">
                  {block.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={block.url}
                      alt={block.alt ?? ""}
                      className="max-h-40 rounded-lg border border-charcoal/10 object-cover"
                    />
                  ) : null}
                  <input
                    value={block.url ?? ""}
                    onChange={(e) => update(index, { url: e.target.value })}
                    placeholder="Image URL"
                    className={cn(inputClass, "h-10")}
                  />
                  <input
                    value={block.alt ?? ""}
                    onChange={(e) => update(index, { alt: e.target.value })}
                    placeholder="Alt text"
                    className={cn(inputClass, "h-10")}
                  />
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
