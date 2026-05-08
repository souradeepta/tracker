import { ChevronDown, Filter, MoreHorizontal, Plus, Search, SlidersHorizontal } from "lucide-react";
import { usePageStore } from "../../store/pages";
import { groupPagesByStatus } from "../../lib/kanban";
import type { Page, PageStatus } from "../../types";

const STATUS_CONFIG: Record<PageStatus, { label: string; pill: string }> = {
  none:          { label: "No status",   pill: "bg-[#F3F2EF] text-[#787774] dark:bg-white/[0.06] dark:text-[#666]" },
  todo:          { label: "Not started", pill: "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400" },
  "in-progress": { label: "In progress", pill: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400" },
  done:          { label: "Complete",    pill: "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400" },
};

const PRIORITY_CONFIG: Record<string, { label: string; className: string }> = {
  high:   { label: "High 🔥", className: "bg-red-50 text-red-600 border-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-700/30" },
  medium: { label: "Medium",  className: "bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-700/30" },
  low:    { label: "Low",     className: "bg-sky-50 text-sky-600 border-sky-100 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-700/30" },
};

function KanbanCard({ page }: { page: Page }) {
  const { setActive } = usePageStore();

  return (
    <div
      className="bg-white dark:bg-[#1E1E1E] border border-black/[0.08] dark:border-white/[0.08] rounded-xl p-4 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] cursor-pointer transition-all group"
      onClick={() => setActive(page.id)}
    >
      <div className="flex items-start gap-2.5 mb-3">
        <span className="text-[18px] leading-tight flex-shrink-0 mt-0.5">{page.icon}</span>
        <p className="flex-1 text-[14px] font-semibold text-[#1A1A1A] dark:text-white leading-snug line-clamp-2 min-h-[1.4em]">
          {page.title || <span className="text-[#9B9A97] italic font-normal">Untitled</span>}
        </p>
        <button
          onClick={(e) => e.stopPropagation()}
          className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded-md text-[#9B9A97] hover:bg-[#F3F2EF] dark:hover:bg-white/[0.06] transition-all flex-shrink-0"
        >
          <MoreHorizontal size={13} />
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {page.priority !== "none" && (
          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${PRIORITY_CONFIG[page.priority].className}`}>
            {PRIORITY_CONFIG[page.priority].label}
          </span>
        )}
        {page.tags.slice(0, 2).map((tag) => (
          <span
            key={tag}
            className="text-[11px] bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-700/30 px-1.5 py-0.5 rounded-full font-medium"
          >
            {tag}
          </span>
        ))}
        {page.tags.length > 2 && (
          <span className="text-[11px] text-[#9B9A97] dark:text-[#555]">+{page.tags.length - 2}</span>
        )}
      </div>
    </div>
  );
}

function Column({ status, pages, onAdd }: { status: PageStatus; pages: Page[]; onAdd: () => void }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <div className="flex flex-col w-[272px] flex-shrink-0 h-full">
      <div className="flex items-center justify-between mb-3 px-0.5">
        <div className="flex items-center gap-2">
          <span className={`text-[12px] font-semibold px-2.5 py-1 rounded-full ${cfg.pill}`}>
            {cfg.label}
          </span>
          <span className="text-[13px] text-[#9B9A97] dark:text-[#555] font-medium">{pages.length}</span>
        </div>
        <div className="flex items-center gap-0.5">
          <button className="w-6 h-6 flex items-center justify-center rounded-md text-[#9B9A97] hover:bg-[#EDECE9] dark:hover:bg-white/[0.05] transition-colors">
            <MoreHorizontal size={13} />
          </button>
          <button
            onClick={onAdd}
            className="w-6 h-6 flex items-center justify-center rounded-md text-[#9B9A97] hover:bg-[#EDECE9] dark:hover:bg-white/[0.05] hover:text-[#1A1A1A] dark:hover:text-white transition-colors"
          >
            <Plus size={13} />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2 overflow-y-auto flex-1 pb-2">
        {pages
          .sort((a, b) => b.updatedAt - a.updatedAt)
          .map((page) => <KanbanCard key={page.id} page={page} />)}

        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-2 py-2 rounded-lg text-[13px] text-[#9B9A97] dark:text-[#555] hover:text-[#1A1A1A] dark:hover:text-white hover:bg-[#EDECE9] dark:hover:bg-white/[0.04] transition-colors mt-1"
        >
          <Plus size={14} /> New
        </button>
      </div>
    </div>
  );
}

export function KanbanBoard() {
  const { pages, createPage, setStatus } = usePageStore();
  const livePages = Object.values(pages).filter((p) => !p.deleted);
  const columns = groupPagesByStatus(livePages);

  const handleAdd = (status: PageStatus) => {
    const id = createPage(null);
    setStatus(id, status);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-[#191919]">
      {/* Toolbar */}
      <div className="h-11 flex items-center gap-1 px-6 border-b border-black/[0.06] dark:border-white/[0.06] flex-shrink-0">
        <button className="flex items-center gap-1.5 text-[13px] font-medium text-[#1A1A1A] dark:text-white px-2.5 py-1.5 rounded-lg hover:bg-[#F3F2EF] dark:hover:bg-white/[0.05] transition-colors">
          <SlidersHorizontal size={13} className="text-[#9B9A97]" />
          By Status
          <ChevronDown size={11} className="text-[#9B9A97]" />
        </button>

        <div className="w-px h-4 bg-black/[0.08] dark:bg-white/[0.08] mx-1" />

        {(["Properties", "Group by Status", "Filter", "Sort"] as const).map((label) => (
          <button
            key={label}
            className="flex items-center gap-1.5 text-[13px] text-[#9B9A97] dark:text-[#555] hover:text-[#1A1A1A] dark:hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-[#F3F2EF] dark:hover:bg-white/[0.05] transition-colors"
          >
            {label === "Filter" && <Filter size={11} />}
            {label}
          </button>
        ))}

        <div className="flex-1" />

        <button className="w-7 h-7 flex items-center justify-center rounded-lg text-[#9B9A97] hover:bg-[#F3F2EF] dark:hover:bg-white/[0.05] hover:text-[#1A1A1A] dark:hover:text-white transition-colors">
          <Search size={13} />
        </button>
        <button className="w-7 h-7 flex items-center justify-center rounded-lg text-[#9B9A97] hover:bg-[#F3F2EF] dark:hover:bg-white/[0.05] hover:text-[#1A1A1A] dark:hover:text-white transition-colors">
          <MoreHorizontal size={13} />
        </button>

        <div className="flex items-center ml-1">
          <button
            onClick={() => createPage(null)}
            className="flex items-center gap-1.5 bg-[#2383E2] hover:bg-[#1a73d6] text-white text-[13px] font-medium px-3 py-1.5 rounded-l-lg transition-colors"
          >
            New
          </button>
          <button className="bg-[#2383E2] hover:bg-[#1a73d6] text-white px-1.5 py-1.5 rounded-r-lg border-l border-white/20 transition-colors">
            <ChevronDown size={12} />
          </button>
        </div>
      </div>

      {/* Columns */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden bg-[#F9F9F7] dark:bg-[#111111]">
        <div className="flex gap-5 p-8 h-full min-w-max items-start">
          {columns.map((col) => (
            <Column
              key={col.status}
              status={col.status}
              pages={col.pages}
              onAdd={() => handleAdd(col.status)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
