import { useCallback, useRef, useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
  Search,
  Star,
  RotateCcw,
  X,
  Moon,
  Sun,
  Download,
  Clock,
  Layout,
  PanelLeftClose,
  PanelLeftOpen,
  Lock,
} from "lucide-react";
import { usePageStore } from "../store/pages";
import { useSettingsStore } from "../store/settings";
import { ContextMenu } from "./ContextMenu";
import type { Page } from "../types";

// ─── Page tree item ─────────────────────────────────────────────────────────
function PageItem({
  page,
  depth,
  onExport,
}: {
  page: Page;
  depth: number;
  onExport: (id: string) => void;
}) {
  const { pages, activePageId, expandedIds, setActive, toggleExpand, createPage } = usePageStore();
  const [hovered, setHovered] = useState(false);
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number } | null>(null);

  const children = Object.values(pages).filter((p) => p.parentId === page.id && !p.deleted);
  const isExpanded = expandedIds.includes(page.id);
  const isActive = activePageId === page.id;

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setCtxMenu({ x: e.clientX, y: e.clientY });
  };

  return (
    <div>
      <div
        className={`group flex items-center gap-0.5 py-[2px] pr-1 rounded cursor-pointer select-none
          ${isActive ? "bg-gray-200/80 dark:bg-neutral-700" : "hover:bg-gray-100 dark:hover:bg-neutral-800"}`}
        style={{ paddingLeft: `${8 + depth * 16}px` }}
        onClick={() => setActive(page.id)}
        onContextMenu={handleContextMenu}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <button
          className="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-400 flex-shrink-0"
          onClick={(e) => { e.stopPropagation(); if (children.length > 0) toggleExpand(page.id); }}
        >
          {children.length > 0
            ? isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />
            : <span className="w-3 h-3" />}
        </button>

        <span className="text-sm leading-none">{page.icon}</span>

        <span className="flex-1 text-sm text-gray-700 dark:text-neutral-300 truncate ml-1 py-1">
          {page.title || "Untitled"}
        </span>

        {page.locked && <Lock size={10} className="text-gray-400 dark:text-neutral-600 flex-shrink-0 mr-0.5" />}

        {hovered && (
          <div className="flex items-center gap-0 flex-shrink-0">
            <button
              className="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-400"
              onClick={(e) => { e.stopPropagation(); onExport(page.id); }}
              title="Export"
            >
              <Download size={11} />
            </button>
            <button
              className="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-400"
              onClick={(e) => { e.stopPropagation(); createPage(page.id); }}
              title="Add sub-page"
            >
              <Plus size={11} />
            </button>
          </div>
        )}
      </div>

      {isExpanded && children.length > 0 && (
        <div>
          {children
            .sort((a, b) => a.createdAt - b.createdAt)
            .map((child) => (
              <PageItem key={child.id} page={child} depth={depth + 1} onExport={onExport} />
            ))}
        </div>
      )}

      {ctxMenu && (
        <ContextMenu
          pageId={page.id}
          x={ctxMenu.x}
          y={ctxMenu.y}
          onClose={() => setCtxMenu(null)}
          onExport={onExport}
        />
      )}
    </div>
  );
}

// ─── Trash section ───────────────────────────────────────────────────────────
function TrashSection() {
  const { pages, restorePage, permanentDelete, emptyTrash } = usePageStore();
  const [open, setOpen] = useState(false);
  const trashed = Object.values(pages).filter((p) => p.deleted);

  if (trashed.length === 0) return null;

  return (
    <div className="px-2 mt-1">
      <button
        className="w-full flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-400 dark:text-neutral-500 text-xs"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
        <Trash2 size={12} />
        Trash ({trashed.length})
      </button>
      {open && (
        <div className="mt-1 ml-2">
          {trashed.map((page) => (
            <div
              key={page.id}
              className="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-neutral-800 group"
            >
              <span className="text-sm">{page.icon}</span>
              <span className="flex-1 text-xs text-gray-500 dark:text-neutral-400 truncate">
                {page.title || "Untitled"}
              </span>
              <button className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-green-600 p-0.5 rounded"
                onClick={() => restorePage(page.id)} title="Restore"><RotateCcw size={11} /></button>
              <button className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 p-0.5 rounded"
                onClick={() => permanentDelete(page.id)} title="Delete permanently"><X size={11} /></button>
            </div>
          ))}
          <button className="w-full text-left text-xs text-red-400 hover:text-red-600 px-2 py-1 mt-1"
            onClick={emptyTrash}>Empty trash</button>
        </div>
      )}
    </div>
  );
}

// ─── Recent pages section ────────────────────────────────────────────────────
function RecentSection() {
  const { pages, recentPageIds, setActive } = usePageStore();
  const [open, setOpen] = useState(true);

  const recents = recentPageIds
    .map((id) => pages[id])
    .filter((p) => p && !p.deleted)
    .slice(0, 5);

  if (recents.length === 0) return null;

  return (
    <div className="px-2 mt-1 mb-1">
      <button
        className="w-full flex items-center gap-1.5 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-400 dark:text-neutral-500 text-xs"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
        <Clock size={12} />
        <span className="uppercase tracking-wide font-medium">Recent</span>
      </button>
      {open && (
        <div className="mt-0.5">
          {recents.map((page) => (
            <button
              key={page.id}
              className="w-full flex items-center gap-1.5 px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-neutral-800 text-left group"
              onClick={() => setActive(page.id)}
            >
              <span className="text-sm flex-shrink-0">{page.icon}</span>
              <span className="flex-1 text-xs text-gray-600 dark:text-neutral-400 truncate">{page.title || "Untitled"}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────
interface Props {
  onSearch: () => void;
  onExport: (id: string) => void;
  onTemplates: () => void;
}

export function Sidebar({ onSearch, onExport, onTemplates }: Props) {
  const { pages, createPage } = usePageStore();
  const { dark, toggleDark, sidebarWidth, setSidebarWidth, sidebarCollapsed, toggleSidebarCollapsed } =
    useSettingsStore();

  const favorites = Object.values(pages).filter((p) => p.favorited && !p.deleted);
  const rootPages = Object.values(pages)
    .filter((p) => p.parentId === null && !p.deleted)
    .sort((a, b) => a.createdAt - b.createdAt);

  const dragging = useRef(false);
  const startX = useRef(0);
  const startW = useRef(0);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      dragging.current = true;
      startX.current = e.clientX;
      startW.current = sidebarWidth;
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      const onMove = (ev: MouseEvent) => {
        if (!dragging.current) return;
        setSidebarWidth(startW.current + ev.clientX - startX.current);
      };
      const onUp = () => {
        dragging.current = false;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [sidebarWidth, setSidebarWidth]
  );

  // Collapsed mini-rail
  if (sidebarCollapsed) {
    return (
      <aside className="w-10 flex-shrink-0 h-full bg-[#f7f7f5] dark:bg-neutral-900 border-r border-gray-200 dark:border-neutral-800 flex flex-col items-center py-3 gap-3">
        <button onClick={toggleSidebarCollapsed} className="text-gray-500 dark:text-neutral-400 hover:text-gray-800 dark:hover:text-neutral-100" title="Expand sidebar">
          <PanelLeftOpen size={16} />
        </button>
        <button onClick={onSearch} className="text-gray-400 hover:text-gray-700 dark:hover:text-neutral-200" title="Search">
          <Search size={15} />
        </button>
        <button onClick={() => createPage(null)} className="text-gray-400 hover:text-gray-700 dark:hover:text-neutral-200" title="New page">
          <Plus size={15} />
        </button>
        <button onClick={onTemplates} className="text-gray-400 hover:text-gray-700 dark:hover:text-neutral-200" title="Templates">
          <Layout size={15} />
        </button>
      </aside>
    );
  }

  return (
    <aside
      className="flex-shrink-0 h-full bg-[#f7f7f5] dark:bg-neutral-900 border-r border-gray-200 dark:border-neutral-800 flex flex-col relative"
      style={{ width: sidebarWidth }}
    >
      {/* Header */}
      <div className="px-3 pt-3 pb-1">
        <div className="flex items-center gap-2 px-2 py-1.5 rounded mb-1">
          <div className="w-5 h-5 rounded bg-gray-800 dark:bg-neutral-200 flex items-center justify-center text-white dark:text-neutral-900 text-xs font-bold flex-shrink-0">
            N
          </div>
          <span className="text-sm font-medium text-gray-800 dark:text-neutral-100 truncate flex-1">My Workspace</span>
          <button onClick={toggleDark} className="text-gray-400 hover:text-gray-600 dark:hover:text-neutral-200" title="Toggle dark mode">
            {dark ? <Sun size={13} /> : <Moon size={13} />}
          </button>
          <button onClick={toggleSidebarCollapsed} className="text-gray-400 hover:text-gray-600 dark:hover:text-neutral-200" title="Collapse sidebar">
            <PanelLeftClose size={13} />
          </button>
        </div>

        <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-200 dark:hover:bg-neutral-800 text-gray-500 dark:text-neutral-400" onClick={onSearch}>
          <Search size={13} />
          <span className="text-sm">Search</span>
          <span className="ml-auto text-[10px] text-gray-400 dark:text-neutral-600 font-mono">⌘K</span>
        </button>

        <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-200 dark:hover:bg-neutral-800 text-gray-500 dark:text-neutral-400" onClick={onTemplates}>
          <Layout size={13} />
          <span className="text-sm">Templates</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {/* Recent */}
        <RecentSection />

        {/* Favorites */}
        {favorites.length > 0 && (
          <div className="mt-1 mb-1">
            <div className="flex items-center px-2 mb-1">
              <span className="text-xs font-medium text-gray-400 dark:text-neutral-500 uppercase tracking-wide flex items-center gap-1">
                <Star size={10} /> Favorites
              </span>
            </div>
            {favorites.map((page) => <PageItem key={page.id} page={page} depth={0} onExport={onExport} />)}
            <div className="border-t border-gray-200 dark:border-neutral-800 my-2" />
          </div>
        )}

        {/* Pages */}
        <div className="flex items-center justify-between px-2 mt-1 mb-1">
          <span className="text-xs font-medium text-gray-400 dark:text-neutral-500 uppercase tracking-wide">Pages</span>
          <button className="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-neutral-800 text-gray-400"
            onClick={() => createPage(null)} title="New page">
            <Plus size={13} />
          </button>
        </div>

        {rootPages.length === 0 ? (
          <div className="px-3 py-2 text-xs text-gray-400 dark:text-neutral-600">No pages — click + to create one</div>
        ) : (
          rootPages.map((page) => <PageItem key={page.id} page={page} depth={0} onExport={onExport} />)
        )}

        <TrashSection />
      </div>

      {/* Footer */}
      <div className="px-3 pb-3 pt-1 border-t border-gray-200 dark:border-neutral-800">
        <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-200 dark:hover:bg-neutral-800 text-gray-500 dark:text-neutral-400"
          onClick={() => createPage(null)}>
          <Plus size={13} />
          <span className="text-sm">New page</span>
        </button>
      </div>

      {/* Resize handle */}
      <div
        className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-400/50 active:bg-blue-500/70 transition-colors"
        onMouseDown={onMouseDown}
      />
    </aside>
  );
}
