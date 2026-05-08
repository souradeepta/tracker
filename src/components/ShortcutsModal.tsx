import { X, Keyboard } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

const SHORTCUTS = [
  {
    group: "Navigation",
    color: "from-indigo-500 to-violet-500",
    items: [
      { keys: ["⌘", "K"], label: "Search all pages" },
      { keys: ["⌘", "N"], label: "New page" },
      { keys: ["⌘", "⇧", "B"], label: "Toggle Board / Kanban view" },
      { keys: ["⌘", "⇧", "F"], label: "Focus mode" },
    ],
  },
  {
    group: "Panels",
    color: "from-violet-500 to-purple-600",
    items: [
      { keys: ["⌘", "⇧", "T"], label: "Template gallery" },
      { keys: ["⌘", "⇧", "G"], label: "Tag browser" },
      { keys: ["⌘", "⇧", "D"], label: "Toggle dark mode" },
      { keys: ["?"], label: "Shortcuts reference" },
    ],
  },
  {
    group: "Editing",
    color: "from-blue-500 to-cyan-500",
    items: [
      { keys: ["/"], label: "Insert block (heading, list, code…)" },
      { keys: ["Enter"], label: "Focus editor from title" },
      { keys: ["⌘", "B"], label: "Bold" },
      { keys: ["⌘", "I"], label: "Italic" },
    ],
  },
  {
    group: "Page actions",
    color: "from-green-500 to-emerald-500",
    items: [
      { keys: ["Right-click"], label: "Context menu (duplicate, delete…)" },
      { keys: ["⌘", "⇧", "L"], label: "Lock / unlock page" },
    ],
  },
];

export function ShortcutsModal({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl shadow-black/20 dark:shadow-black/60 border border-gray-200 dark:border-gray-700/60 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm">
            <Keyboard size={14} className="text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-[15px] font-semibold text-gray-900 dark:text-gray-50">Keyboard shortcuts</h2>
            <p className="text-[11px] text-gray-400 dark:text-gray-600">Press Esc or click outside to close</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Shortcuts */}
        <div className="p-5 grid grid-cols-1 gap-5 max-h-[60vh] overflow-y-auto">
          {SHORTCUTS.map((group) => (
            <div key={group.group}>
              <div className="flex items-center gap-2 mb-2.5">
                <div className={`w-1.5 h-4 rounded-full bg-gradient-to-b ${group.color}`} />
                <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-500">
                  {group.group}
                </p>
              </div>
              <div className="space-y-1.5 ml-4">
                {group.items.map((item) => (
                  <div key={item.label} className="flex items-center justify-between gap-4">
                    <span className="text-[13px] text-gray-600 dark:text-gray-400">{item.label}</span>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {item.keys.map((key, i) => (
                        <kbd
                          key={i}
                          className="px-2 py-1 text-[11px] font-mono bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
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
      </div>
    </div>
  );
}
