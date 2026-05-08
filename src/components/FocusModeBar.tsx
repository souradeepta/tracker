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
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-2.5 bg-white/95 dark:bg-[#191919]/95 backdrop-blur-sm border-b border-[#37352F]/[0.08] dark:border-white/[0.08]">
      <div className="flex items-center gap-2.5">
        <span className="text-[17px]">{page?.icon ?? "📄"}</span>
        <span className="text-[13px] font-medium text-[#37352F] dark:text-white/90 max-w-xs truncate">
          {page?.title || "Untitled"}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {page && (
          <>
            <button
              onClick={() => toggleLocked(page.id)}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-[#37352F]/40 dark:text-white/40 hover:bg-[#37352F]/[0.06] dark:hover:bg-white/[0.06] hover:text-[#37352F] dark:hover:text-white transition-colors"
              title={page.locked ? "Unlock page" : "Lock page"}
            >
              {page.locked ? <Unlock size={13} /> : <Lock size={13} />}
            </button>
            <button
              onClick={() => onExport(page.id)}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-[#37352F]/40 dark:text-white/40 hover:bg-[#37352F]/[0.06] dark:hover:bg-white/[0.06] hover:text-[#37352F] dark:hover:text-white transition-colors"
              title="Export as Markdown"
            >
              <Download size={13} />
            </button>
          </>
        )}
        <button
          onClick={toggleFocusMode}
          className="flex items-center gap-1.5 text-[12px] text-[#37352F]/50 dark:text-white/50 hover:text-[#37352F] dark:hover:text-white border border-[#37352F]/15 dark:border-white/15 rounded-lg px-2.5 py-1.5 transition-colors"
          title="Exit focus mode (⌘⇧F)"
        >
          <X size={11} /> Exit focus
        </button>
      </div>
    </div>
  );
}
