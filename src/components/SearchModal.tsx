import { useEffect, useRef, useState } from "react";
import { Search, X, Hash, Clock } from "lucide-react";
import { usePageStore } from "../store/pages";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function SearchModal({ open, onClose }: Props) {
  const { pages, recentPageIds, setActive } = usePageStore();
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const livePages = Object.values(pages).filter((p) => !p.deleted);
  const results = query.trim()
    ? livePages.filter((p) =>
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.tags.some((t) => t.includes(query.toLowerCase()))
      )
    : recentPageIds.map((id) => pages[id]).filter((p) => p && !p.deleted).slice(0, 8);

  useEffect(() => {
    if (open) {
      setQuery("");
      setCursor(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => setCursor(0), [query]);

  const choose = (id: string) => { setActive(id); onClose(); };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setCursor((c) => Math.min(c + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setCursor((c) => Math.max(c - 1, 0)); }
    else if (e.key === "Enter" && results[cursor]) { choose(results[cursor].id); }
    else if (e.key === "Escape") { onClose(); }
  };

  if (!open) return null;

  const isRecent = !query.trim();

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/50 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl shadow-black/20 dark:shadow-black/60 border border-gray-200 dark:border-gray-700/60 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 dark:border-gray-800">
          <Search size={16} className="text-gray-400 flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Search pages, tags…"
            className="flex-1 text-[14px] bg-transparent outline-none text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600"
          />
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[360px] overflow-y-auto py-2">
          {isRecent && (
            <p className="px-4 pb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-600 flex items-center gap-1.5">
              <Clock size={9} /> Recent
            </p>
          )}

          {results.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-[14px] text-gray-400 dark:text-gray-600">No pages found for "{query}"</p>
              <p className="text-[12px] text-gray-300 dark:text-gray-700 mt-1">Try a different search term</p>
            </div>
          ) : (
            results.map((page, i) => (
              <button
                key={page.id}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors
                  ${i === cursor
                    ? "bg-indigo-50 dark:bg-indigo-500/10"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800/60"
                  }`}
                onClick={() => choose(page.id)}
                onMouseEnter={() => setCursor(i)}
              >
                <span className="text-[18px] flex-shrink-0 leading-none">{page.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-[13px] font-medium truncate ${i === cursor ? "text-indigo-700 dark:text-indigo-300" : "text-gray-800 dark:text-gray-100"}`}>
                    {page.title || "Untitled"}
                  </p>
                  {page.tags.length > 0 && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <Hash size={9} className="text-gray-300 dark:text-gray-700" />
                      <p className="text-[11px] text-gray-400 dark:text-gray-600 truncate">{page.tags.join(", ")}</p>
                    </div>
                  )}
                </div>
                {i === cursor && (
                  <kbd className="text-[10px] font-mono text-indigo-500 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-700 px-1.5 py-0.5 rounded-md flex-shrink-0">
                    ↵
                  </kbd>
                )}
              </button>
            ))
          )}
        </div>

        {/* Footer hints */}
        <div className="flex items-center gap-3 px-4 py-2.5 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/60">
          {[["↑↓", "navigate"], ["↵", "open"], ["esc", "close"]].map(([key, label]) => (
            <span key={key} className="flex items-center gap-1">
              <kbd className="text-[10px] font-mono bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded-md">{key}</kbd>
              <span className="text-[11px] text-gray-400 dark:text-gray-600">{label}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
