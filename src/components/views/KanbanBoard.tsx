import { Plus } from "lucide-react";
import { usePageStore } from "../../store/pages";
import { groupPagesByStatus } from "../../lib/kanban";
import type { Page, PageStatus } from "../../types";

const STATUS_ICONS: Record<PageStatus, string> = {
  none: "⬜", todo: "🔵", "in-progress": "🟡", done: "🟢",
};

function KanbanCard({ page }: { page: Page }) {
  const { setActive, setStatus } = usePageStore();

  return (
    <div
      className="bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700
        rounded-xl p-3 shadow-sm hover:shadow-md cursor-pointer transition-all group"
      onClick={() => setActive(page.id)}
    >
      <div className="flex items-start gap-2 mb-2">
        <span className="text-xl flex-shrink-0">{page.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800 dark:text-neutral-100 truncate">
            {page.title || "Untitled"}
          </p>
        </div>
      </div>

      {page.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {page.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-[10px] bg-gray-100 dark:bg-neutral-700 text-gray-500 dark:text-neutral-400 px-1.5 py-0.5 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      )}

      {page.priority !== "none" && (
        <div className="flex items-center gap-1">
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium
            ${page.priority === "high" ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" :
              page.priority === "medium" ? "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400" :
              "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"}`}>
            {page.priority}
          </span>
        </div>
      )}

      {/* Quick status change */}
      <div className="mt-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {(["todo", "in-progress", "done"] as PageStatus[]).filter((s) => s !== page.status).map((s) => (
          <button
            key={s}
            onClick={(e) => { e.stopPropagation(); setStatus(page.id, s); }}
            className="text-[10px] text-gray-400 hover:text-gray-700 dark:hover:text-neutral-200 px-1.5 py-0.5 rounded border border-gray-200 dark:border-neutral-600 hover:border-gray-400"
          >
            → {s}
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
    <div className="flex-1 overflow-x-auto overflow-y-hidden bg-gray-50 dark:bg-neutral-950">
      <div className="flex gap-4 p-6 h-full min-w-max">
        {columns.map((col) => (
          <div key={col.status} className="flex flex-col w-72 flex-shrink-0">
            {/* Column header */}
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <span className="text-base">{STATUS_ICONS[col.status]}</span>
                <span className="text-sm font-semibold text-gray-700 dark:text-neutral-300">{col.label}</span>
                <span className="text-xs text-gray-400 dark:text-neutral-500 bg-gray-200 dark:bg-neutral-800 px-1.5 py-0.5 rounded-full">
                  {col.pages.length}
                </span>
              </div>
              <button
                onClick={() => handleAddCard(col.status)}
                className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-neutral-800 text-gray-400"
                title={`Add ${col.label} page`}
              >
                <Plus size={14} />
              </button>
            </div>

            {/* Cards */}
            <div className="flex flex-col gap-2 overflow-y-auto flex-1 pb-2">
              {col.pages
                .sort((a, b) => b.updatedAt - a.updatedAt)
                .map((page) => (
                  <KanbanCard key={page.id} page={page} />
                ))}

              {col.pages.length === 0 && (
                <div
                  className="border-2 border-dashed border-gray-200 dark:border-neutral-800 rounded-xl p-4 text-center cursor-pointer hover:border-gray-300 dark:hover:border-neutral-700 transition-colors"
                  onClick={() => handleAddCard(col.status)}
                >
                  <p className="text-xs text-gray-400 dark:text-neutral-600">No pages</p>
                  <p className="text-xs text-gray-400 dark:text-neutral-600 mt-0.5">Click + to add one</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
