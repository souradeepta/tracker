import { useState } from "react";
import { Plus, X, Zap } from "lucide-react";
import { usePageStore } from "../store/pages";

export function QuickCapture() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const { createPage, updateTitle } = usePageStore();

  const handleCapture = () => {
    const id = createPage(null);
    if (title.trim()) updateTitle(id, title.trim());
    setTitle("");
    setOpen(false);
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600
          text-white shadow-lg hover:shadow-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        title="Quick capture (Cmd+Shift+C)"
      >
        <Plus size={22} />
      </button>

      {/* Capture popover */}
      {open && (
        <div className="fixed bottom-20 right-6 z-50 bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-neutral-700 w-80 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Zap size={14} className="text-indigo-500" />
            <span className="text-xs font-semibold text-gray-600 dark:text-neutral-400 uppercase tracking-wide">Quick capture</span>
            <button onClick={() => setOpen(false)} className="ml-auto text-gray-400 hover:text-gray-600"><X size={13} /></button>
          </div>

          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCapture();
              if (e.key === "Escape") setOpen(false);
            }}
            placeholder="Page title… (Enter to create)"
            className="w-full text-sm border border-gray-200 dark:border-neutral-700 rounded-lg px-3 py-2 outline-none
              focus:border-indigo-400 bg-transparent text-gray-800 dark:text-neutral-100 placeholder-gray-400 dark:placeholder-neutral-600"
          />

          <div className="flex gap-2 mt-3">
            <button
              onClick={handleCapture}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium py-2 rounded-lg transition-colors"
            >
              Create page
            </button>
            <button
              onClick={() => setOpen(false)}
              className="px-3 py-2 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-neutral-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
