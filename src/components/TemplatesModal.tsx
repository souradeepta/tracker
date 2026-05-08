import { X } from "lucide-react";
import { TEMPLATES } from "../lib/templates";
import { usePageStore } from "../store/pages";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function TemplatesModal({ open, onClose }: Props) {
  const { createFromTemplate } = usePageStore();

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-neutral-700 w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-neutral-800">
          <h2 className="text-base font-semibold text-gray-900 dark:text-neutral-100">New from template</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-neutral-200">
            <X size={16} />
          </button>
        </div>

        <div className="overflow-y-auto p-4 grid grid-cols-2 gap-3">
          {TEMPLATES.map((tpl) => (
            <button
              key={tpl.key}
              className="text-left p-4 rounded-xl border border-gray-200 dark:border-neutral-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group"
              onClick={() => { createFromTemplate(tpl.key); onClose(); }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{tpl.icon}</span>
                <span className="text-sm font-medium text-gray-800 dark:text-neutral-100 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                  {tpl.name}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-neutral-400">{tpl.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
