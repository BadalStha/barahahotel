"use client";

import { useState } from "react";
import { X } from "lucide-react";

export function TagInput({
  value,
  onChange,
  placeholder = "Type an amenity and press Enter",
}: {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");

  function add() {
    const tag = draft.trim().replace(/,+$/, "");
    if (!tag) return;
    if (!value.includes(tag)) onChange([...value, tag]);
    setDraft("");
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-charcoal/15 bg-white px-3 py-2 transition focus-within:border-pine focus-within:ring-2 focus-within:ring-pine/20">
      {value.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded-full bg-pine/10 px-2.5 py-1 text-xs font-medium text-pine"
        >
          {tag}
          <button
            type="button"
            onClick={() => onChange(value.filter((t) => t !== tag))}
            aria-label={`Remove ${tag}`}
            className="cursor-pointer text-pine/60 transition-colors hover:text-pine"
          >
            <X className="size-3" />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            add();
          } else if (e.key === "Backspace" && !draft && value.length) {
            onChange(value.slice(0, -1));
          }
        }}
        onBlur={add}
        placeholder={value.length ? "" : placeholder}
        className="min-w-32 flex-1 bg-transparent text-sm text-charcoal placeholder:text-charcoal/40 outline-none"
      />
    </div>
  );
}
