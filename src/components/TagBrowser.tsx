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
        className="w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-neutral-700 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <Tag size={15} className="text-gray-500" />
            <h2 className="text-sm font-semibold text-gray-800 dark:text-neutral-100">Tag Browser</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={15} /></button>
        </div>

        <div className="flex" style={{ minHeight: 320 }}>
          {/* Tag list */}
          <div className="w-48 border-r border-gray-100 dark:border-neutral-800 py-2 overflow-y-auto">
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
                        ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
                        : "text-gray-700 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-800"}`}
                  >
                    <span className="truncate">{tag}</span>
                    <span className="text-xs text-gray-400 dark:text-neutral-500 ml-2 flex-shrink-0">{count}</span>
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
                  className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-neutral-800"
                >
                  <span className="text-lg">{page.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 dark:text-neutral-100 truncate">{page.title || "Untitled"}</p>
                    <p className="text-xs text-gray-400 dark:text-neutral-500">{page.status !== "none" ? page.status : ""}</p>
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
