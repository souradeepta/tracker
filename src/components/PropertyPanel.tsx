import React, { useState } from "react";
import { Tag, X, ChevronDown } from "lucide-react";
import { usePageStore } from "../store/pages";
import type { PageStatus, PagePriority } from "../types";

const STATUS_LABELS: Record<PageStatus, { label: string; color: string }> = {
  none: { label: "No status", color: "bg-gray-100 text-gray-500 dark:bg-neutral-800 dark:text-neutral-400" },
  todo: { label: "Todo", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
  "in-progress": { label: "In Progress", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300" },
  done: { label: "Done", color: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" },
};

const PRIORITY_LABELS: Record<PagePriority, { label: string; color: string }> = {
  none: { label: "No priority", color: "bg-gray-100 text-gray-500 dark:bg-neutral-800 dark:text-neutral-400" },
  low: { label: "Low", color: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" },
  medium: { label: "Medium", color: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400" },
  high: { label: "High", color: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" },
};

const PRESET_TAGS = ["design", "dev", "research", "important", "idea", "personal", "work", "urgent"];

function Dropdown<T extends string>({
  value,
  options,
  labels,
  onChange,
}: {
  value: T;
  options: T[];
  labels: Record<T, { label: string; color: string }>;
  onChange: (v: T) => void;
}) {
  const [open, setOpen] = useState(false);
  const current = labels[value];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${current.color}`}
      >
        {current.label}
        <ChevronDown size={10} />
      </button>
      {open && (
        <div className="absolute top-7 left-0 z-40 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg shadow-lg overflow-hidden min-w-32">
          {options.map((opt) => (
            <button
              key={opt}
              className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 dark:hover:bg-neutral-800 ${opt === value ? "font-medium" : ""}`}
              onClick={() => { onChange(opt); setOpen(false); }}
            >
              <span className={`px-1.5 py-0.5 rounded-full ${labels[opt].color}`}>{labels[opt].label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function PropertyPanel({ pageId }: { pageId: string }) {
  const { pages, addTag, removeTag, setStatus, setPriority } = usePageStore();
  const page = pages[pageId];
  const [tagInput, setTagInput] = useState("");

  if (!page) return null;

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag) { addTag(pageId, tag); setTagInput(""); }
  };

  return (
    <div className="border-b border-gray-100 dark:border-neutral-800 px-16 py-3 bg-gray-50/50 dark:bg-neutral-950">
      <div className="max-w-3xl mx-auto flex flex-wrap items-center gap-4">
        {/* Status */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 dark:text-neutral-500">Status</span>
          <Dropdown
            value={page.status}
            options={["none", "todo", "in-progress", "done"] as PageStatus[]}
            labels={STATUS_LABELS}
            onChange={(v) => setStatus(pageId, v)}
          />
        </div>

        {/* Priority */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 dark:text-neutral-500">Priority</span>
          <Dropdown
            value={page.priority}
            options={["none", "low", "medium", "high"] as PagePriority[]}
            labels={PRIORITY_LABELS}
            onChange={(v) => setPriority(pageId, v)}
          />
        </div>

        {/* Tags */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <Tag size={11} className="text-gray-400 dark:text-neutral-500 flex-shrink-0" />
          {page.tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-0.5 bg-gray-200 dark:bg-neutral-700 text-gray-700 dark:text-neutral-300 text-xs px-2 py-0.5 rounded-full"
            >
              {tag}
              <button onClick={() => removeTag(pageId, tag)} className="hover:text-red-500 ml-0.5">
                <X size={9} />
              </button>
            </span>
          ))}

          {/* Preset tag suggestions */}
          {PRESET_TAGS.filter((t) => !page.tags.includes(t)).slice(0, 3).map((tag) => (
            <button
              key={tag}
              onClick={() => addTag(pageId, tag)}
              className="text-xs text-gray-400 dark:text-neutral-600 hover:text-gray-700 dark:hover:text-neutral-300 border border-dashed border-gray-300 dark:border-neutral-700 px-1.5 py-0.5 rounded-full"
            >
              + {tag}
            </button>
          ))}

          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleAddTag(); }}
            placeholder="add tag…"
            className="text-xs outline-none bg-transparent text-gray-500 dark:text-neutral-400 placeholder-gray-300 dark:placeholder-neutral-600 w-16"
          />
        </div>
      </div>
    </div>
  );
}
