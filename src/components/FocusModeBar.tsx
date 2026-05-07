import React from "react";
import { X, Lock, Unlock, Download } from "lucide-react";
import { useSettingsStore } from "../store/settings";
import { usePageStore } from "../store/pages";

interface Props {
  onExport: (id: string) => void;
}

export function FocusModeBar({ onExport }: Props) {
  const { toggleFocusMode } = useSettingsStore();
  const { pages, activePageId, toggleLocked } = usePageStore();
  const page = activePageId ? pages[activePageId] : null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-3 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-sm border-b border-gray-100 dark:border-neutral-800">
      <div className="flex items-center gap-2">
        <span className="text-lg">{page?.icon ?? "📄"}</span>
        <span className="text-sm font-medium text-gray-700 dark:text-neutral-300 max-w-xs truncate">
          {page?.title || "Untitled"}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {page && (
          <>
            <button
              onClick={() => toggleLocked(page.id)}
              className="text-gray-400 hover:text-gray-700 dark:hover:text-neutral-200 transition-colors"
              title={page.locked ? "Unlock" : "Lock"}
            >
              {page.locked ? <Unlock size={14} /> : <Lock size={14} />}
            </button>
            <button
              onClick={() => onExport(page.id)}
              className="text-gray-400 hover:text-gray-700 dark:hover:text-neutral-200 transition-colors"
              title="Export as Markdown"
            >
              <Download size={14} />
            </button>
          </>
        )}
        <button
          onClick={toggleFocusMode}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 dark:hover:text-neutral-100 border border-gray-200 dark:border-neutral-700 rounded-lg px-2.5 py-1.5 transition-colors"
          title="Exit focus mode (Cmd+Shift+F)"
        >
          <X size={11} /> Exit focus
        </button>
      </div>
    </div>
  );
}
