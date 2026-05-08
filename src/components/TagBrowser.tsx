import React from "react";
import { X, Tag } from "lucide-react";
import { usePageStore } from "../store/pages";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function TagBrowser({ open, onClose }: Props) {
  const { pages, getAllTags, setActive } = usePageStore();
  const [selectedTag, setSelectedTag] = React.useState<string | null>(null);

  const allTags = getAllTags();
  const taggedPages = selectedTag
    ? Object.values(pages).filter((p) => !p.deleted && p.tags.includes(selectedTag))
    : [];

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-2xl bg-white dark:bg-[#252525] rounded-2xl shadow-2xl border border-[#E9E9E8] dark:border-[#2D2D2D] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#F0EFEC] dark:border-[#2D2D2D]">
          <div className="flex items-center gap-2">
            <Tag size={15} className="text-[#9B9A97]" />
            <h2 className="text-sm font-semibold text-[#37352F] dark:text-white">Tag Browser</h2>
          </div>
          <button onClick={onClose} className="text-[#9B9A97] hover:text-[#37352F] dark:hover:text-white transition-colors"><X size={15} /></button>
        </div>

        <div className="flex" style={{ minHeight: 320 }}>
          {/* Tag list */}
          <div className="w-48 border-r border-[#F0EFEC] dark:border-[#2D2D2D] py-2 overflow-y-auto">
            {allTags.length === 0 ? (
              <p className="text-xs text-gray-400 dark:text-neutral-600 px-4 py-2">No tags yet</p>
            ) : (
              allTags.map((tag) => {
                const count = Object.values(pages).filter((p) => !p.deleted && p.tags.includes(tag)).length;
                return (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                    className={`w-full flex items-center justify-between px-4 py-2 text-left text-sm transition-colors
                      ${tag === selectedTag
                        ? "bg-[#37352F]/[0.08] dark:bg-white/[0.07] text-[#37352F] dark:text-white font-medium"
                        : "text-[#37352F]/70 dark:text-white/50 hover:bg-[#37352F]/[0.05] dark:hover:bg-white/[0.04]"}`}
                  >
                    <span className="truncate">{tag}</span>
                    <span className="text-xs text-[#9B9A97] dark:text-[#6B6B6B] ml-2 flex-shrink-0">{count}</span>
                  </button>
                );
              })
            )}
          </div>

          {/* Pages for selected tag */}
          <div className="flex-1 py-2 overflow-y-auto">
            {!selectedTag ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-gray-400 dark:text-neutral-600">Select a tag to see pages</p>
              </div>
            ) : taggedPages.length === 0 ? (
              <p className="text-sm text-gray-400 px-4 py-2">No pages with this tag</p>
            ) : (
              taggedPages.map((page) => (
                <button
                  key={page.id}
                  onClick={() => { setActive(page.id); onClose(); }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-[#37352F]/[0.05] dark:hover:bg-white/[0.04]"
                >
                  <span className="text-lg">{page.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-[#37352F] dark:text-white truncate">{page.title || "Untitled"}</p>
                    <p className="text-xs text-[#9B9A97] dark:text-[#6B6B6B]">{page.status !== "none" ? page.status : ""}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
