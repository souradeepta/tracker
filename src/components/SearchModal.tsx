import React, { useEffect, useRef, useState } from "react";
import { Search, FileText, X } from "lucide-react";
import { usePageStore } from "../store/pages";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function SearchModal({ open, onClose }: Props) {
  const { pages, setActive } = usePageStore();
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const livePages = Object.values(pages).filter((p) => !p.deleted);
  const results = query.trim()
    ? livePages.filter((p) => p.title.toLowerCase().includes(query.toLowerCase()))
    : livePages.slice(0, 8);

  useEffect(() => {
    if (open) {
      setQuery("");
      setCursor(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => setCursor(0), [query]);

  const choose = (id: string) => {
    setActive(id);
    onClose();
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => Math.min(c + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, 0));
    } else if (e.key === "Enter" && results[cursor]) {
      choose(results[cursor].id);
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white dark:bg-neutral-900 rounded-xl shadow-2xl border border-gray-200 dark:border-neutral-700 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-neutral-800">
          <Search size={16} className="text-gray-400 flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Search pages…"
            className="flex-1 text-sm bg-transparent outline-none text-gray-800 dark:text-gray-100 placeholder-gray-400"
          />
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={15} />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto py-1">
          {results.length === 0 ? (
            <div className="px-4 py-6 text-sm text-gray-400 text-center">No pages found</div>
          ) : (
            results.map((page, i) => (
              <button
                key={page.id}
                className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors
                  ${i === cursor ? "bg-gray-100 dark:bg-neutral-800" : "hover:bg-gray-50 dark:hover:bg-neutral-800"}`}
                onClick={() => choose(page.id)}
                onMouseEnter={() => setCursor(i)}
              >
                <span className="text-base">{page.icon}</span>
                <span className="text-sm text-gray-800 dark:text-gray-100 truncate">
                  {page.title || "Untitled"}
                </span>
              </button>
            ))
          )}
        </div>

        <div className="px-4 py-2 border-t border-gray-100 dark:border-neutral-800 flex gap-4 text-xs text-gray-400">
          <span>↑↓ navigate</span>
          <span>↵ open</span>
          <span>esc close</span>
        </div>
      </div>
    </div>
  );
}
