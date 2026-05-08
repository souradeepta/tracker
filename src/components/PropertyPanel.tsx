import { useState } from "react";
import { Tag, X, ChevronDown } from "lucide-react";
import { usePageStore } from "../store/pages";
import type { PageStatus, PagePriority } from "../types";

const STATUS_CONFIG: Record<PageStatus, { label: string; dot: string; pill: string }> = {
  none:          { label: "No status",   dot: "bg-[#C4C3BF] dark:bg-[#555]",    pill: "bg-[#F5F4F1] text-[#9B9A97] dark:bg-white/[0.05] dark:text-[#666] border-black/[0.07] dark:border-white/[0.07]" },
  todo:          { label: "Todo",        dot: "bg-blue-400",                      pill: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200/60 dark:border-blue-700/40" },
  "in-progress": { label: "In Progress", dot: "bg-amber-400",                     pill: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200/60 dark:border-amber-700/40" },
  done:          { label: "Done",        dot: "bg-green-500",                     pill: "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400 border-green-200/60 dark:border-green-700/40" },
};

const PRIORITY_CONFIG: Record<PagePriority, { label: string; pill: string }> = {
  none:   { label: "Priority",  pill: "bg-[#F5F4F1] text-[#9B9A97] dark:bg-white/[0.05] dark:text-[#666] border-black/[0.07] dark:border-white/[0.07]" },
  low:    { label: "Low",       pill: "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400 border-sky-200/60 dark:border-sky-700/40" },
  medium: { label: "Medium",    pill: "bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400 border-orange-200/60 dark:border-orange-700/40" },
  high:   { label: "High",      pill: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 border-red-200/60 dark:border-red-700/40" },
};

const PRESET_TAGS = ["design", "dev", "research", "important", "idea", "personal", "work", "urgent"];

function Pill<T extends string>({
  value, options, config, onChange, hasDot,
}: {
  value: T; options: T[]; config: Record<T, { label: string; pill: string; dot?: string }>; onChange: (v: T) => void; hasDot?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const cfg = config[value];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors ${cfg.pill}`}
      >
        {hasDot && cfg.dot && <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />}
        {cfg.label}
        <ChevronDown size={9} className="opacity-60" />
      </button>
      {open && (
        <div className="absolute top-8 left-0 z-40 bg-white dark:bg-[#1E1E1E] border border-black/[0.08] dark:border-white/[0.08] rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.10)] overflow-hidden min-w-[140px]">
          {options.map((opt) => {
            const c = config[opt];
            return (
              <button
                key={opt}
                className={`w-full flex items-center gap-2.5 text-left px-3 py-2 text-[12px] hover:bg-[#F5F4F1] dark:hover:bg-white/[0.04] transition-colors ${opt === value ? "font-semibold" : "text-[#37352F] dark:text-white/80"}`}
                onClick={() => { onChange(opt); setOpen(false); }}
              >
                {hasDot && (c as { dot?: string }).dot && (
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${(c as { dot?: string }).dot}`} />
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
    <div className="border-b border-black/[0.04] dark:border-white/[0.04] px-20 py-2.5">
      <div className="flex flex-wrap items-center gap-1.5">
        <Pill
          value={page.status}
          options={["none", "todo", "in-progress", "done"] as PageStatus[]}
          config={STATUS_CONFIG}
          onChange={(v) => setStatus(pageId, v)}
          hasDot
        />
        <Pill
          value={page.priority}
          options={["none", "low", "medium", "high"] as PagePriority[]}
          config={PRIORITY_CONFIG}
          onChange={(v) => setPriority(pageId, v)}
        />

        <div className="w-px h-3.5 bg-black/[0.08] dark:bg-white/[0.08] mx-1" />

        <div className="flex items-center gap-1.5 flex-wrap">
          <Tag size={11} className="text-black/20 dark:text-white/20 flex-shrink-0" />
          {page.tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-700/40 text-[11px] font-medium px-2 py-0.5 rounded-full"
            >
              {tag}
              <button onClick={() => removeTag(pageId, tag)} className="hover:text-red-500 transition-colors ml-0.5">
                <X size={9} />
              </button>
            </span>
          ))}
          {PRESET_TAGS.filter((t) => !page.tags.includes(t)).slice(0, 2).map((tag) => (
            <button
              key={tag}
              onClick={() => addTag(pageId, tag)}
              className="text-[11px] text-[#C4C3BF] dark:text-[#555] hover:text-indigo-600 dark:hover:text-indigo-400 border border-dashed border-black/[0.10] dark:border-white/[0.08] hover:border-indigo-300 dark:hover:border-indigo-600 px-2 py-0.5 rounded-full transition-colors"
            >
              + {tag}
            </button>
          ))}
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleAddTag(); }}
            placeholder="+ tag"
            className="text-[11px] outline-none bg-transparent text-[#9B9A97] placeholder-black/20 dark:placeholder-white/20 w-12"
          />
        </div>
      </div>
    </div>
  );
}
