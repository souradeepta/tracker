import { useState } from "react";
import { Tag, X, ChevronDown } from "lucide-react";
import { usePageStore } from "../store/pages";
import type { PageStatus, PagePriority } from "../types";

const STATUS_CONFIG: Record<PageStatus, { label: string; dot: string; pill: string }> = {
  none:         { label: "No status",   dot: "bg-gray-300 dark:bg-gray-600",    pill: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700" },
  todo:         { label: "Todo",        dot: "bg-blue-400",                      pill: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-700/40" },
  "in-progress":{ label: "In Progress", dot: "bg-amber-400",                     pill: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-700/40" },
  done:         { label: "Done",        dot: "bg-green-400",                     pill: "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400 border-green-200 dark:border-green-700/40" },
};

const PRIORITY_CONFIG: Record<PagePriority, { label: string; pill: string }> = {
  none:   { label: "Priority",  pill: "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600 border-gray-200 dark:border-gray-700" },
  low:    { label: "Low",       pill: "bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400 border-sky-200 dark:border-sky-700/40" },
  medium: { label: "Medium",    pill: "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400 border-orange-200 dark:border-orange-700/40" },
  high:   { label: "High",      pill: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 border-red-200 dark:border-red-700/40" },
};

const PRESET_TAGS = ["design", "dev", "research", "important", "idea", "personal", "work", "urgent"];

function Pill<T extends string>({
  value,
  options,
  config,
  onChange,
  hasDot,
}: {
  value: T;
  options: T[];
  config: Record<T, { label: string; pill: string; dot?: string }>;
  onChange: (v: T) => void;
  hasDot?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const cfg = config[value];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors ${cfg.pill}`}
      >
        {hasDot && cfg.dot && <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />}
        {cfg.label}
        <ChevronDown size={9} />
      </button>
      {open && (
        <div className="absolute top-8 left-0 z-40 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden min-w-[130px]">
          {options.map((opt) => {
            const c = config[opt];
            return (
              <button
                key={opt}
                className={`w-full flex items-center gap-2 text-left px-3 py-2 text-[12px] hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${opt === value ? "font-medium" : ""}`}
                onClick={() => { onChange(opt); setOpen(false); }}
              >
                {hasDot && (c as { dot?: string }).dot && (
                  <span className={`w-1.5 h-1.5 rounded-full ${(c as { dot?: string }).dot}`} />
                )}
                {c.label}
              </button>
            );
          })}
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
    <div className="border-b border-gray-100 dark:border-gray-800/60 px-16 py-2.5 bg-gray-50/50 dark:bg-white/[0.02]">
      <div className="max-w-3xl mx-auto flex flex-wrap items-center gap-2">
        {/* Status */}
        <Pill
          value={page.status}
          options={["none", "todo", "in-progress", "done"] as PageStatus[]}
          config={STATUS_CONFIG}
          onChange={(v) => setStatus(pageId, v)}
          hasDot
        />

        {/* Priority */}
        <Pill
          value={page.priority}
          options={["none", "low", "medium", "high"] as PagePriority[]}
          config={PRIORITY_CONFIG}
          onChange={(v) => setPriority(pageId, v)}
        />

        <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1" />

        {/* Tags */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <Tag size={11} className="text-gray-300 dark:text-gray-700 flex-shrink-0" />
          {page.tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-700/40 text-[11px] font-medium px-2 py-0.5 rounded-full"
            >
              {tag}
              <button onClick={() => removeTag(pageId, tag)} className="hover:text-red-500 transition-colors">
                <X size={9} />
              </button>
            </span>
          ))}

          {PRESET_TAGS.filter((t) => !page.tags.includes(t)).slice(0, 2).map((tag) => (
            <button
              key={tag}
              onClick={() => addTag(pageId, tag)}
              className="text-[11px] text-gray-400 dark:text-gray-600 hover:text-indigo-600 dark:hover:text-indigo-400 border border-dashed border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 px-2 py-0.5 rounded-full transition-colors"
            >
              + {tag}
            </button>
          ))}

          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleAddTag(); }}
            placeholder="+ tag"
            className="text-[11px] outline-none bg-transparent text-gray-500 dark:text-gray-400 placeholder-gray-300 dark:placeholder-gray-700 w-12"
          />
        </div>
      </div>
    </div>
  );
}
