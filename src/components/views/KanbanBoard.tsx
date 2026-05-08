import { Plus, MoreHorizontal } from "lucide-react";
import { usePageStore } from "../../store/pages";
import { groupPagesByStatus } from "../../lib/kanban";
import type { Page, PageStatus } from "../../types";

const COLUMN_STYLES: Record<PageStatus, { header: string; dot: string; badge: string; empty: string }> = {
  none: {
    header: "text-gray-500 dark:text-gray-500",
    dot: "bg-gray-300 dark:bg-gray-600",
    badge: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500",
    empty: "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700",
  },
  todo: {
    header: "text-blue-600 dark:text-blue-400",
    dot: "bg-blue-400",
    badge: "bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
    empty: "border-blue-200 dark:border-blue-900 hover:border-blue-300 dark:hover:border-blue-800",
  },
  "in-progress": {
    header: "text-amber-600 dark:text-amber-400",
    dot: "bg-amber-400",
    badge: "bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
    empty: "border-amber-200 dark:border-amber-900 hover:border-amber-300 dark:hover:border-amber-800",
  },
  done: {
    header: "text-green-600 dark:text-green-400",
    dot: "bg-green-400",
    badge: "bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400",
    empty: "border-green-200 dark:border-green-900 hover:border-green-300 dark:hover:border-green-800",
  },
};

const PRIORITY_PILL: Record<string, string> = {
  high:   "bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400 border-red-200 dark:border-red-700/40",
  medium: "bg-orange-50 text-orange-500 dark:bg-orange-500/10 dark:text-orange-400 border-orange-200 dark:border-orange-700/40",
  low:    "bg-sky-50 text-sky-500 dark:bg-sky-500/10 dark:text-sky-400 border-sky-200 dark:border-sky-700/40",
};

function KanbanCard({ page }: { page: Page }) {
  const { setActive, setStatus } = usePageStore();

  return (
    <div
      className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700/60 rounded-xl p-3.5 shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-700/40 cursor-pointer transition-all group"
      onClick={() => setActive(page.id)}
    >
      {/* Title row */}
      <div className="flex items-start gap-2.5 mb-2.5">
        <span className="text-[18px] flex-shrink-0 leading-tight mt-0.5">{page.icon}</span>
        <p className="flex-1 text-[13px] font-medium text-gray-800 dark:text-gray-100 leading-snug line-clamp-2">
          {page.title || <span className="text-gray-400 dark:text-gray-600 italic font-normal">Untitled</span>}
        </p>
        <button
          onClick={(e) => e.stopPropagation()}
          className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all flex-shrink-0"
        >
          <MoreHorizontal size={13} />
        </button>
      </div>

      {/* Tags */}
      {page.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {page.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[10px] bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-700/30 px-1.5 py-0.5 rounded-full font-medium"
            >
              {tag}
            </span>
          ))}
          {page.tags.length > 3 && (
            <span className="text-[10px] text-gray-400 dark:text-gray-600">+{page.tags.length - 3}</span>
          )}
        </div>
      )}

      {/* Footer */}
      {page.priority !== "none" && (
        <div className="flex items-center justify-between">
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${PRIORITY_PILL[page.priority]}`}>
            {page.priority}
          </span>
        </div>
      )}

      {/* Quick status change */}
      <div className="mt-2 flex flex-wrap gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {(["todo", "in-progress", "done", "none"] as PageStatus[]).filter((s) => s !== page.status).map((s) => (
          <button
            key={s}
            onClick={(e) => { e.stopPropagation(); setStatus(page.id, s); }}
            className="text-[10px] text-gray-400 dark:text-gray-600 hover:text-indigo-600 dark:hover:text-indigo-400 px-1.5 py-0.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all"
          >
            → {s === "none" ? "clear" : s}
          </button>
        ))}
      </div>
    </div>
  );
}

export function KanbanBoard() {
  const { pages, createPage, setStatus } = usePageStore();
  const livePages = Object.values(pages).filter((p) => !p.deleted);
  const columns = groupPagesByStatus(livePages);

  const handleAddCard = (status: PageStatus) => {
    const id = createPage(null);
    setStatus(id, status);
  };

  return (
    <div className="flex-1 overflow-x-auto overflow-y-hidden bg-gray-50 dark:bg-[#0A0A0A]">
      <div className="flex gap-4 p-6 h-full min-w-max items-start">
        {columns.map((col) => {
          const s = COLUMN_STYLES[col.status];
          return (
            <div key={col.status} className="flex flex-col w-[280px] flex-shrink-0 max-h-full">
              {/* Column header */}
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${s.dot}`} />
                  <span className={`text-[12px] font-semibold ${s.header}`}>{col.label}</span>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${s.badge}`}>
                    {col.pages.length}
                  </span>
                </div>
                <button
                  onClick={() => handleAddCard(col.status)}
                  className="w-6 h-6 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  title={`Add to ${col.label}`}
                >
                  <Plus size={13} />
                </button>
              </div>

              {/* Cards */}
              <div className="flex flex-col gap-2 overflow-y-auto flex-1 pb-2">
                {col.pages
                  .sort((a, b) => b.updatedAt - a.updatedAt)
                  .map((page) => <KanbanCard key={page.id} page={page} />)}

                {col.pages.length === 0 && (
                  <button
                    className={`border-2 border-dashed ${s.empty} rounded-xl p-5 text-center transition-colors`}
                    onClick={() => handleAddCard(col.status)}
                  >
                    <p className="text-[12px] text-gray-400 dark:text-gray-600">No pages</p>
                    <p className="text-[11px] text-gray-300 dark:text-gray-700 mt-0.5">Click to add one</p>
                  </button>
                )}

                {col.pages.length > 0 && (
                  <button
                    onClick={() => handleAddCard(col.status)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] text-gray-400 dark:text-gray-600 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 border border-dashed border-gray-200 dark:border-gray-800 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all"
                  >
                    <Plus size={12} /> Add page
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
