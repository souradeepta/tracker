import { X, Keyboard } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

const SHORTCUTS = [
  {
    group: "Navigation",
    items: [
      { keys: ["⌘", "K"], label: "Search all pages" },
      { keys: ["⌘", "N"], label: "New page" },
      { keys: ["⌘", "⇧", "B"], label: "Toggle Board / Kanban view" },
      { keys: ["⌘", "⇧", "F"], label: "Focus mode (distraction-free)" },
    ],
  },
  {
    group: "Panels",
    items: [
      { keys: ["⌘", "⇧", "T"], label: "Open template gallery" },
      { keys: ["⌘", "⇧", "G"], label: "Open tag browser" },
      { keys: ["⌘", "⇧", "D"], label: "Toggle dark mode" },
    ],
  },
  {
    group: "Editing",
    items: [
      { keys: ["/"], label: "Insert a block (heading, list, code…)" },
      { keys: ["Enter"], label: "Move focus from title to editor" },
      { keys: ["⌘", "Z"], label: "Undo" },
      { keys: ["⌘", "⇧", "Z"], label: "Redo" },
      { keys: ["⌘", "B"], label: "Bold" },
      { keys: ["⌘", "I"], label: "Italic" },
    ],
  },
  {
    group: "Page actions",
    items: [
      { keys: ["Right-click"], label: "Context menu (duplicate, delete, favorite…)" },
      { keys: ["⌘", "⇧", "L"], label: "Lock / unlock page" },
    ],
  },
];

export function ShortcutsModal({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-[#1f1f1f] rounded-2xl shadow-2xl border border-[#37352F]/10 dark:border-white/10 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-[#37352F]/10 dark:border-white/10">
          <Keyboard size={16} className="text-[#37352F]/50 dark:text-white/50" />
          <h2 className="text-[15px] font-semibold text-[#37352F] dark:text-white flex-1">Keyboard shortcuts</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-[#37352F]/40 dark:text-white/40 hover:bg-[#37352F]/[0.08] dark:hover:bg-white/[0.08] transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Shortcuts grid */}
        <div className="p-6 grid grid-cols-1 gap-5 max-h-[60vh] overflow-y-auto">
          {SHORTCUTS.map((group) => (
            <div key={group.group}>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#37352F]/40 dark:text-white/30 mb-2">
                {group.group}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <div key={item.label} className="flex items-center justify-between gap-4">
                    <span className="text-[13px] text-[#37352F]/80 dark:text-white/70">{item.label}</span>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {item.keys.map((key, i) => (
                        <kbd
                          key={i}
                          className="px-1.5 py-0.5 text-[11px] font-mono bg-[#37352F]/[0.06] dark:bg-white/[0.08] text-[#37352F]/70 dark:text-white/60 rounded border border-[#37352F]/15 dark:border-white/15"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 py-3 border-t border-[#37352F]/10 dark:border-white/10 text-center">
          <p className="text-[12px] text-[#37352F]/35 dark:text-white/30">Press Escape to close</p>
        </div>
      </div>
    </div>
  );
}
