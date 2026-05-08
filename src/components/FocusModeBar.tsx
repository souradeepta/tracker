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
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-2.5 bg-white/90 dark:bg-[#191919]/90 backdrop-blur-xl border-b border-[#E9E9E8] dark:border-[#2D2D2D]">
      <div className="flex items-center gap-2.5">
        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-[10px] font-bold">T</span>
        </div>
        {page && (
          <>
            <span className="text-gray-300 dark:text-gray-700">/</span>
            <span className="text-[15px]">{page.icon}</span>
            <span className="text-[13px] font-medium text-gray-800 dark:text-gray-100 max-w-xs truncate">
              {page.title || "Untitled"}
            </span>
          </>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        {page && (
          <>
            <button
              onClick={() => toggleLocked(page.id)}
              className="w-8 h-8 flex items-center justify-center rounded-xl text-[#9B9A97] dark:text-[#6B6B6B] hover:bg-[#37352F]/[0.06] dark:hover:bg-white/[0.05] hover:text-[#37352F] dark:hover:text-white transition-colors"
              title={page.locked ? "Unlock page" : "Lock page"}
            >
              {page.locked ? <Unlock size={14} /> : <Lock size={14} />}
            </button>
            <button
              onClick={() => onExport(page.id)}
              className="w-8 h-8 flex items-center justify-center rounded-xl text-[#9B9A97] dark:text-[#6B6B6B] hover:bg-[#37352F]/[0.06] dark:hover:bg-white/[0.05] hover:text-[#37352F] dark:hover:text-white transition-colors"
              title="Export as Markdown"
            >
              <Download size={14} />
            </button>
          </>
        )}
        <button
          onClick={toggleFocusMode}
          className="flex items-center gap-1.5 text-[12px] text-[#9B9A97] dark:text-[#6B6B6B] hover:text-[#37352F] dark:hover:text-white bg-[#EBEBEA] dark:bg-white/[0.05] hover:bg-[#E4E3DF] dark:hover:bg-white/[0.08] rounded-xl px-3 py-1.5 font-medium transition-colors"
          title="Exit focus mode (⌘⇧F)"
        >
          <X size={12} /> Exit focus
        </button>
      </div>
    </div>
  );
}
