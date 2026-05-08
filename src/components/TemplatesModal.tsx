import { X, Sparkles } from "lucide-react";
import { TEMPLATES } from "../lib/templates";
import { usePageStore } from "../store/pages";

interface Props {
  open: boolean;
  onClose: () => void;
}

const TEMPLATE_COLORS: Record<string, string> = {
  "meeting-notes": "from-blue-500 to-cyan-500",
  "daily-journal": "from-violet-500 to-purple-600",
  "project-plan": "from-indigo-500 to-blue-600",
  "bug-report": "from-red-500 to-orange-500",
  "reading-notes": "from-amber-500 to-yellow-500",
  "weekly-review": "from-green-500 to-emerald-600",
};

export function TemplatesModal({ open, onClose }: Props) {
  const { createFromTemplate } = usePageStore();

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl shadow-black/20 dark:shadow-black/60 border border-gray-200 dark:border-gray-700/60 w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm">
              <Sparkles size={14} className="text-white" />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-gray-900 dark:text-gray-50">Templates</h2>
              <p className="text-[11px] text-gray-400 dark:text-gray-600">Choose a template to get started quickly</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Templates grid */}
        <div className="overflow-y-auto p-5 grid grid-cols-2 gap-3">
          {TEMPLATES.map((tpl) => {
            const gradient = TEMPLATE_COLORS[tpl.key] ?? "from-gray-400 to-gray-600";
            return (
              <button
                key={tpl.key}
                className="group text-left p-4 rounded-2xl border border-gray-200 dark:border-gray-700/60 hover:border-indigo-300 dark:hover:border-indigo-700/60 bg-white dark:bg-gray-800/50 hover:shadow-md hover:shadow-indigo-100/60 dark:hover:shadow-indigo-900/20 transition-all"
                onClick={() => { createFromTemplate(tpl.key); onClose(); }}
              >
                <div className="flex items-center gap-3 mb-2.5">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-xl shadow-sm flex-shrink-0`}>
                    {tpl.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-gray-900 dark:text-gray-100 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors">
                      {tpl.name}
                    </p>
                  </div>
                </div>
                <p className="text-[12px] text-gray-500 dark:text-gray-400 leading-relaxed">{tpl.description}</p>
                <div className="mt-3 flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Use template →
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
