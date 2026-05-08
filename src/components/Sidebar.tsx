import { useCallback, useRef, useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
  Search,
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
  Keyboard,
  Zap,
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

  return (
    <div>
      <div
        className={`group flex items-center rounded-lg cursor-pointer select-none transition-all duration-100
          ${isActive
            ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300"
            : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.05] hover:text-gray-900 dark:hover:text-gray-100"
          }`}
        style={{ paddingLeft: `${8 + depth * 14}px`, paddingRight: "4px", paddingTop: "3px", paddingBottom: "3px" }}
        onClick={() => setActive(page.id)}
        onContextMenu={(e) => { e.preventDefault(); setCtxMenu({ x: e.clientX, y: e.clientY }); }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <button
          className={`w-5 h-5 flex items-center justify-center rounded-md flex-shrink-0 transition-colors
            ${isActive ? "text-indigo-400" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"}`}
          onClick={(e) => { e.stopPropagation(); if (children.length > 0) toggleExpand(page.id); }}
        >
          {children.length > 0
            ? isExpanded ? <ChevronDown size={11} /> : <ChevronRight size={11} />
            : <span className="w-3" />}
        </button>

        <span className="text-[14px] leading-none flex-shrink-0 mr-1.5">{page.icon}</span>

        <span className={`flex-1 text-[13px] font-medium truncate ${isActive ? "" : "font-normal"}`}>
          {page.title || <span className="opacity-40 font-normal italic">Untitled</span>}
        </span>

        {page.locked && (
          <Lock size={9} className={`flex-shrink-0 mr-1 ${isActive ? "text-indigo-400" : "text-gray-300 dark:text-gray-600"}`} />
        )}

        {hovered && !isActive && (
          <div className="flex items-center flex-shrink-0 gap-0.5">
            <button
              className="w-5 h-5 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
              onClick={(e) => { e.stopPropagation(); onExport(page.id); }}
              title="Export"
            >
              <Download size={10} />
            </button>
            <button
              className="w-5 h-5 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
              onClick={(e) => { e.stopPropagation(); createPage(page.id); }}
              title="Add sub-page"
            >
              <Plus size={10} />
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
    <div className="mt-2">
      <button
        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-[12px] text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-white/[0.05] hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
        <Trash2 size={12} />
        <span>Trash</span>
        <span className="ml-auto text-[10px] bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded-full font-medium">
          {trashed.length}
        </span>
      </button>
      {open && (
        <div className="mt-1 ml-4 space-y-0.5">
          {trashed.map((page) => (
            <div key={page.id} className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-gray-50 dark:hover:bg-white/[0.03] group">
              <span className="text-sm">{page.icon}</span>
              <span className="flex-1 text-[12px] text-gray-400 dark:text-gray-500 truncate">
                {page.title || "Untitled"}
              </span>
              <button className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-all" onClick={() => restorePage(page.id)} title="Restore">
                <RotateCcw size={10} />
              </button>
              <button className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-gray-400 hover:text-red-500 transition-all" onClick={() => permanentDelete(page.id)} title="Delete">
                <X size={10} />
              </button>
            </div>
          ))}
          <button className="text-[11px] text-red-400 hover:text-red-600 px-2 py-0.5 rounded transition-colors" onClick={emptyTrash}>
            Empty trash
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Recent section ──────────────────────────────────────────────────────────
function RecentSection() {
  const { pages, recentPageIds, setActive } = usePageStore();
  const [open, setOpen] = useState(true);
  const recents = recentPageIds.map((id) => pages[id]).filter((p) => p && !p.deleted).slice(0, 5);
  if (recents.length === 0) return null;

  return (
    <div className="mb-1">
      <button
        className="w-full flex items-center gap-2 px-2 py-1 rounded-lg text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400 transition-colors mb-0.5"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
        <Clock size={10} />
        Recent
      </button>
      {open && (
        <div className="space-y-0.5 mb-2">
          {recents.map((page) => (
            <button
              key={page.id}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-[12px] text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.05] hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
              onClick={() => setActive(page.id)}
            >
              <span className="text-[13px] flex-shrink-0">{page.icon}</span>
              <span className="flex-1 truncate">{page.title || "Untitled"}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Section label ───────────────────────────────────────────────────────────
function SectionHeader({ label, onAdd }: { label: string; onAdd?: () => void }) {
  return (
    <div className="flex items-center justify-between px-2 pt-4 pb-1">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-600">
        {label}
      </span>
      {onAdd && (
        <button
          onClick={onAdd}
          className="w-4 h-4 flex items-center justify-center rounded text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
          title="New page"
        >
          <Plus size={12} />
        </button>
      )}
    </div>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────
interface Props {
  onSearch: () => void;
  onExport: (id: string) => void;
  onTemplates: () => void;
  onShortcuts: () => void;
}

export function Sidebar({ onSearch, onExport, onTemplates, onShortcuts }: Props) {
  const { pages, createPage } = usePageStore();
  const { dark, toggleDark, sidebarWidth, setSidebarWidth, sidebarCollapsed, toggleSidebarCollapsed } = useSettingsStore();

  const favorites = Object.values(pages).filter((p) => p.favorited && !p.deleted);
  const rootPages = Object.values(pages).filter((p) => p.parentId === null && !p.deleted).sort((a, b) => a.createdAt - b.createdAt);

  const dragging = useRef(false);
  const startX = useRef(0);
  const startW = useRef(0);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    dragging.current = true;
    startX.current = e.clientX;
    startW.current = sidebarWidth;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    const onMove = (ev: MouseEvent) => { if (dragging.current) setSidebarWidth(startW.current + ev.clientX - startX.current); };
    const onUp = () => {
      dragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [sidebarWidth, setSidebarWidth]);

  const iconBtn = "w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-white/[0.05] hover:text-gray-700 dark:hover:text-gray-200 transition-colors";

  if (sidebarCollapsed) {
    return (
      <aside className="w-12 flex-shrink-0 h-full bg-gray-50 dark:bg-[#111111] border-r border-gray-200 dark:border-[#1F1F1F] flex flex-col items-center py-3 gap-1.5">
        <button onClick={toggleSidebarCollapsed} className={iconBtn} title="Expand sidebar"><PanelLeftOpen size={15} /></button>
        <button onClick={onSearch} className={iconBtn} title="Search"><Search size={15} /></button>
        <button onClick={() => createPage(null)} className={iconBtn} title="New page"><Plus size={15} /></button>
        <button onClick={onTemplates} className={iconBtn} title="Templates"><Layout size={15} /></button>
      </aside>
    );
  }

  return (
    <aside
      className="flex-shrink-0 h-full bg-gray-50 dark:bg-[#111111] border-r border-gray-200 dark:border-[#1F1F1F] flex flex-col relative"
      style={{ width: sidebarWidth }}
    >
      {/* Workspace header */}
      <div className="flex items-center gap-2.5 px-3 py-3">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm flex-shrink-0">
          <span className="text-white text-[11px] font-bold tracking-tight">T</span>
        </div>
        <span className="flex-1 text-[13px] font-semibold text-gray-900 dark:text-gray-50 truncate">Tracker</span>
        <button onClick={toggleDark} className={iconBtn} title="Toggle dark mode">
          {dark ? <Sun size={14} /> : <Moon size={14} />}
        </button>
        <button onClick={toggleSidebarCollapsed} className={iconBtn} title="Collapse sidebar">
          <PanelLeftClose size={14} />
        </button>
      </div>

      {/* Nav actions */}
      <div className="px-2 pb-1 space-y-0.5">
        <button
          onClick={onSearch}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.06] text-[13px] text-gray-400 dark:text-gray-500 hover:border-indigo-300 dark:hover:border-indigo-500/40 hover:text-gray-600 dark:hover:text-gray-300 transition-all shadow-sm"
        >
          <Search size={13} />
          <span className="flex-1 text-left">Search…</span>
          <kbd className="text-[10px] font-mono bg-gray-100 dark:bg-white/[0.06] text-gray-400 dark:text-gray-600 px-1.5 py-0.5 rounded-md border border-gray-200 dark:border-white/[0.06]">⌘K</kbd>
        </button>
      </div>

      <div className="px-2 space-y-0.5 mb-1">
        {[
          { icon: <Layout size={13} />, label: "Templates", action: onTemplates, shortcut: "" },
          { icon: <Keyboard size={13} />, label: "Shortcuts", action: onShortcuts, shortcut: "?" },
          { icon: <Zap size={13} />, label: "Quick capture", action: () => {}, shortcut: "" },
        ].map(({ icon, label, action, shortcut }) => (
          <button
            key={label}
            onClick={action}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[13px] text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.05] hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
          >
            <span className="text-gray-400 dark:text-gray-500">{icon}</span>
            <span className="flex-1 text-left">{label}</span>
            {shortcut && <kbd className="text-[10px] font-mono text-gray-300 dark:text-gray-700">{shortcut}</kbd>}
          </button>
        ))}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-2 pb-4 min-h-0">
        <RecentSection />

        {favorites.length > 0 && (
          <div className="mb-1">
            <SectionHeader label="Favorites" />
            <div className="space-y-0.5">
              {favorites.map((page) => <PageItem key={page.id} page={page} depth={0} onExport={onExport} />)}
            </div>
          </div>
        )}

        <SectionHeader label="Pages" onAdd={() => createPage(null)} />
        <div className="space-y-0.5">
          {rootPages.length === 0 ? (
            <button
              onClick={() => createPage(null)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] text-gray-400 dark:text-gray-600 border border-dashed border-gray-200 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/5 transition-all mt-1"
            >
              <Plus size={12} /> Create your first page
            </button>
          ) : (
            rootPages.map((page) => <PageItem key={page.id} page={page} depth={0} onExport={onExport} />)
          )}
        </div>

        <TrashSection />
      </div>

      {/* New page footer button */}
      <div className="px-3 pb-3 pt-2 border-t border-gray-200 dark:border-[#1F1F1F]">
        <button
          onClick={() => createPage(null)}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white text-[13px] font-medium shadow-sm transition-colors"
        >
          <Plus size={14} />
          New page
        </button>
      </div>

      {/* Resize handle */}
      <div
        className="absolute top-0 right-0 w-[3px] h-full cursor-col-resize hover:bg-indigo-400/30 active:bg-indigo-500/50 transition-colors"
        onMouseDown={onMouseDown}
      />
    </aside>
  );
}
