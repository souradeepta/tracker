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
        className="fixed bottom-6 right-6 z-40 w-11 h-11 rounded-full bg-[#37352F] hover:bg-[#2F2C27] dark:bg-white/80 dark:hover:bg-white
          text-white dark:text-[#191919] shadow-lg hover:shadow-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        title="Quick capture"
      >
        <Plus size={20} />
      </button>

      {/* Capture popover */}
      {open && (
        <div className="fixed bottom-20 right-6 z-50 bg-white dark:bg-[#252525] rounded-2xl shadow-2xl border border-[#E9E9E8] dark:border-[#2D2D2D] w-80 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Zap size={14} className="text-[#9B9A97]" />
            <span className="text-[11px] font-semibold text-[#9B9A97] dark:text-[#6B6B6B] uppercase tracking-wide">Quick capture</span>
            <button onClick={() => setOpen(false)} className="ml-auto text-[#9B9A97] hover:text-[#37352F] dark:hover:text-white transition-colors"><X size={13} /></button>
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
            className="w-full text-[13px] border border-[#E9E9E8] dark:border-[#3A3A3A] rounded-lg px-3 py-2 outline-none
              focus:border-[#37352F]/30 dark:focus:border-white/20 bg-transparent text-[#37352F] dark:text-white placeholder-[#C4C3BF] dark:placeholder-[#444444]"
          />

          <div className="flex gap-2 mt-3">
            <button
              onClick={handleCapture}
              className="flex-1 bg-[#37352F] hover:bg-[#2F2C27] dark:bg-white dark:hover:bg-white/90 text-white dark:text-[#191919] text-[12px] font-medium py-2 rounded-lg transition-colors"
            >
              Create page
            </button>
            <button
              onClick={() => setOpen(false)}
              className="px-3 py-2 text-[12px] text-[#9B9A97] hover:text-[#37352F] dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
