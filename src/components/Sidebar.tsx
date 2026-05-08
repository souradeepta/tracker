import { useCallback, useRef, useState } from "react";
import {
  ChevronRight, ChevronDown, Plus, Trash2, Search,
  RotateCcw, X, Moon, Sun, Download, Layout,
  PanelLeftClose, PanelLeftOpen, Lock, Keyboard, Zap,
} from "lucide-react";
import { usePageStore } from "../store/pages";
import { useSettingsStore } from "../store/settings";
import { ContextMenu } from "./ContextMenu";
import type { Page } from "../types";

// ─── Page tree item ───────────────────────────────────────────────────────────
function PageItem({ page, depth, onExport }: { page: Page; depth: number; onExport: (id: string) => void }) {
  const { pages, activePageId, expandedIds, setActive, toggleExpand, createPage } = usePageStore();
  const [hovered, setHovered] = useState(false);
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number } | null>(null);

  const children = Object.values(pages).filter((p) => p.parentId === page.id && !p.deleted);
  const isExpanded = expandedIds.includes(page.id);
  const isActive = activePageId === page.id;

  return (
    <div>
      <div
        className={`group flex items-center h-8 rounded-lg cursor-pointer select-none transition-colors
          ${isActive
            ? "bg-[#F0EFEC] dark:bg-white/[0.07] text-[#1A1A1A] dark:text-white"
            : "text-[#5E5C58] dark:text-white/50 hover:bg-[#F0EFEC] dark:hover:bg-white/[0.04] hover:text-[#1A1A1A] dark:hover:text-white"
          }`}
        style={{ paddingLeft: `${10 + depth * 14}px`, paddingRight: "6px" }}
        onClick={() => setActive(page.id)}
        onContextMenu={(e) => { e.preventDefault(); setCtxMenu({ x: e.clientX, y: e.clientY }); }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <button
          className="w-4 h-4 flex items-center justify-center flex-shrink-0 text-[#C4C3BF] dark:text-[#444] hover:text-[#5E5C58] dark:hover:text-white/60 transition-colors mr-0.5"
          onClick={(e) => { e.stopPropagation(); if (children.length > 0) toggleExpand(page.id); }}
        >
          {children.length > 0
            ? isExpanded ? <ChevronDown size={11} /> : <ChevronRight size={11} />
            : <span className="w-3" />}
        </button>

        <span className="text-[14px] leading-none flex-shrink-0 mr-1.5">{page.icon}</span>

        <span className={`flex-1 text-[13px] truncate leading-none ${isActive ? "font-medium" : ""}`}>
          {page.title || <span className="opacity-30 italic font-normal">Untitled</span>}
        </span>

        {page.locked && !hovered && (
          <Lock size={9} className="flex-shrink-0 mr-1 text-[#C4C3BF] dark:text-[#444]" />
        )}

        {hovered && !isActive && (
          <div className="flex items-center flex-shrink-0 gap-0.5 ml-1">
            <button
              className="w-5 h-5 flex items-center justify-center rounded-md text-[#C4C3BF] hover:text-[#5E5C58] dark:hover:text-white hover:bg-black/[0.06] dark:hover:bg-white/[0.06] transition-colors"
              onClick={(e) => { e.stopPropagation(); onExport(page.id); }}
            >
              <Download size={10} />
            </button>
            <button
              className="w-5 h-5 flex items-center justify-center rounded-md text-[#C4C3BF] hover:text-[#5E5C58] dark:hover:text-white hover:bg-black/[0.06] dark:hover:bg-white/[0.06] transition-colors"
              onClick={(e) => { e.stopPropagation(); createPage(page.id); }}
            >
              <Plus size={10} />
            </button>
          </div>
        )}
      </div>

      {isExpanded && children.length > 0 && (
        <div>
          {children.sort((a, b) => a.createdAt - b.createdAt).map((child) => (
            <PageItem key={child.id} page={child} depth={depth + 1} onExport={onExport} />
          ))}
        </div>
      )}

      {ctxMenu && (
        <ContextMenu pageId={page.id} x={ctxMenu.x} y={ctxMenu.y} onClose={() => setCtxMenu(null)} onExport={onExport} />
      )}
    </div>
  );
}

// ─── Trash ────────────────────────────────────────────────────────────────────
function TrashSection() {
  const { pages, restorePage, permanentDelete, emptyTrash } = usePageStore();
  const [open, setOpen] = useState(false);
  const trashed = Object.values(pages).filter((p) => p.deleted);
  if (trashed.length === 0) return null;

  return (
    <div className="mt-1">
      <button
        className="w-full flex items-center gap-2 px-2 h-8 rounded-lg text-[12px] text-[#9B9A97] dark:text-[#555] hover:bg-[#F0EFEC] dark:hover:bg-white/[0.04] hover:text-[#1A1A1A] dark:hover:text-white transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
        <Trash2 size={12} />
        <span>Trash</span>
        <span className="ml-auto text-[10px] bg-black/[0.06] dark:bg-white/[0.06] text-[#9B9A97] dark:text-[#555] px-1.5 py-0.5 rounded-full font-medium">
          {trashed.length}
        </span>
      </button>
      {open && (
        <div className="mt-0.5 ml-4 space-y-0.5">
          {trashed.map((page) => (
            <div key={page.id} className="flex items-center gap-1.5 px-2 h-7 rounded-lg hover:bg-[#F0EFEC] dark:hover:bg-white/[0.03] group">
              <span className="text-sm">{page.icon}</span>
              <span className="flex-1 text-[12px] text-[#9B9A97] dark:text-[#555] truncate">{page.title || "Untitled"}</span>
              <button className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-[#9B9A97] hover:text-green-600 dark:hover:text-green-400 transition-all" onClick={() => restorePage(page.id)}><RotateCcw size={10} /></button>
              <button className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-[#9B9A97] hover:text-red-500 transition-all" onClick={() => permanentDelete(page.id)}><X size={10} /></button>
            </div>
          ))}
          <button className="text-[11px] text-red-400 hover:text-red-600 px-2 py-0.5 rounded transition-colors" onClick={emptyTrash}>Empty trash</button>
        </div>
      )}
    </div>
  );
}

// ─── Recent ───────────────────────────────────────────────────────────────────
function RecentSection() {
  const { pages, recentPageIds, setActive } = usePageStore();
  const [open, setOpen] = useState(true);
  const recents = recentPageIds.map((id) => pages[id]).filter((p) => p && !p.deleted).slice(0, 5);
  if (recents.length === 0) return null;

  return (
    <div className="mb-1">
      <button
        className="w-full flex items-center gap-1.5 px-2 h-6 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#C4C3BF] dark:text-[#444] hover:text-[#9B9A97] dark:hover:text-[#666] transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <ChevronDown size={9} /> : <ChevronRight size={9} />}
        Recent
      </button>
      {open && (
        <div className="mb-2">
          {recents.map((page) => (
            <button
              key={page.id}
              className="w-full flex items-center gap-2 px-2 h-8 rounded-lg text-left text-[12px] text-[#5E5C58] dark:text-white/50 hover:bg-[#F0EFEC] dark:hover:bg-white/[0.04] hover:text-[#1A1A1A] dark:hover:text-white transition-colors"
              onClick={() => setActive(page.id)}
            >
              <span className="text-[13px] flex-shrink-0 opacity-70">{page.icon}</span>
              <span className="flex-1 truncate">{page.title || "Untitled"}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────
function SectionHeader({ label, onAdd }: { label: string; onAdd?: () => void }) {
  return (
    <div className="flex items-center justify-between px-2 pt-3 pb-0.5">
      <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#C4C3BF] dark:text-[#444]">
        {label}
      </span>
      {onAdd && (
        <button
          onClick={onAdd}
          className="w-5 h-5 flex items-center justify-center rounded-md text-[#C4C3BF] dark:text-[#444] hover:text-[#5E5C58] dark:hover:text-white hover:bg-black/[0.06] dark:hover:bg-white/[0.05] transition-colors"
        >
          <Plus size={12} />
        </button>
      )}
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
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

  const iconBtn = "w-7 h-7 flex items-center justify-center rounded-lg text-[#C4C3BF] dark:text-[#444] hover:bg-black/[0.05] dark:hover:bg-white/[0.05] hover:text-[#5E5C58] dark:hover:text-white transition-colors";

  if (sidebarCollapsed) {
    return (
      <aside className="w-12 flex-shrink-0 h-full bg-white dark:bg-[#1A1A1A] border-r border-black/[0.06] dark:border-white/[0.06] flex flex-col items-center py-3 gap-1">
        <button onClick={toggleSidebarCollapsed} className={iconBtn} title="Expand sidebar"><PanelLeftOpen size={14} /></button>
        <button onClick={onSearch} className={iconBtn} title="Search"><Search size={14} /></button>
        <button onClick={() => createPage(null)} className={iconBtn} title="New page"><Plus size={14} /></button>
        <button onClick={onTemplates} className={iconBtn} title="Templates"><Layout size={14} /></button>
      </aside>
    );
  }

  return (
    <aside
      className="flex-shrink-0 h-full bg-white dark:bg-[#1A1A1A] border-r border-black/[0.06] dark:border-white/[0.06] flex flex-col relative"
      style={{ width: sidebarWidth }}
    >
      {/* Workspace header */}
      <div className="flex items-center gap-2.5 px-3 h-14 flex-shrink-0 border-b border-black/[0.04] dark:border-white/[0.04]">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm flex-shrink-0">
          <span className="text-white text-[11px] font-bold">T</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-[#1A1A1A] dark:text-white truncate leading-none">Tracker</p>
          <p className="text-[10px] text-[#9B9A97] dark:text-[#555] leading-none mt-0.5">Personal workspace</p>
        </div>
        <button onClick={toggleDark} className={iconBtn} title="Toggle dark mode">
          {dark ? <Sun size={13} /> : <Moon size={13} />}
        </button>
        <button onClick={toggleSidebarCollapsed} className={iconBtn} title="Collapse sidebar">
          <PanelLeftClose size={13} />
        </button>
      </div>

      {/* Nav */}
      <div className="px-2 py-2 space-y-0.5 border-b border-black/[0.04] dark:border-white/[0.04]">
        <button
          onClick={onSearch}
          className="w-full flex items-center gap-2.5 px-2.5 h-8 rounded-lg bg-[#F5F4F1] dark:bg-white/[0.04] text-[13px] text-[#9B9A97] dark:text-[#555] hover:bg-[#EDECE9] dark:hover:bg-white/[0.06] transition-colors"
        >
          <Search size={13} className="text-[#C4C3BF] dark:text-[#444]" />
          <span className="flex-1 text-left">Search…</span>
          <kbd className="text-[10px] font-mono text-[#C4C3BF] dark:text-[#444]">⌘K</kbd>
        </button>
        {([
          { icon: <Layout size={13} />, label: "Templates", action: onTemplates },
          { icon: <Keyboard size={13} />, label: "Shortcuts", action: onShortcuts },
          { icon: <Zap size={13} />, label: "Quick capture", action: () => {} },
        ] as const).map(({ icon, label, action }) => (
          <button
            key={label}
            onClick={action as () => void}
            className="w-full flex items-center gap-2.5 px-2.5 h-8 rounded-lg text-[13px] text-[#5E5C58] dark:text-white/50 hover:bg-[#F0EFEC] dark:hover:bg-white/[0.04] hover:text-[#1A1A1A] dark:hover:text-white transition-colors"
          >
            <span className="text-[#C4C3BF] dark:text-[#444] flex-shrink-0">{icon}</span>
            <span className="flex-1 text-left">{label}</span>
          </button>
        ))}
      </div>

      {/* Page tree */}
      <div className="flex-1 overflow-y-auto px-2 py-2 min-h-0">
        <RecentSection />

        {favorites.length > 0 && (
          <>
            <SectionHeader label="Favorites" />
            <div className="mb-1">
              {favorites.map((page) => <PageItem key={page.id} page={page} depth={0} onExport={onExport} />)}
            </div>
          </>
        )}

        <SectionHeader label="Pages" onAdd={() => createPage(null)} />
        <div>
          {rootPages.length === 0 ? (
            <button
              onClick={() => createPage(null)}
              className="w-full flex items-center gap-2 px-2.5 py-2 mt-1 rounded-lg text-[12px] text-[#C4C3BF] dark:text-[#444] border border-dashed border-black/[0.08] dark:border-white/[0.06] hover:bg-[#F0EFEC] dark:hover:bg-white/[0.04] hover:text-[#5E5C58] dark:hover:text-white transition-colors"
            >
              <Plus size={12} /> Create your first page
            </button>
          ) : (
            rootPages.map((page) => <PageItem key={page.id} page={page} depth={0} onExport={onExport} />)
          )}
        </div>

        <TrashSection />
      </div>

      {/* Footer */}
      <div className="px-2 py-2 border-t border-black/[0.04] dark:border-white/[0.04]">
        <button
          onClick={() => createPage(null)}
          className="w-full flex items-center gap-2 px-2.5 h-8 rounded-lg text-[13px] text-[#9B9A97] dark:text-[#555] hover:bg-[#F0EFEC] dark:hover:bg-white/[0.04] hover:text-[#1A1A1A] dark:hover:text-white transition-colors"
        >
          <Plus size={13} className="text-[#C4C3BF] dark:text-[#444]" />
          New page
        </button>
      </div>

      {/* Resize handle */}
      <div
        className="absolute top-0 right-0 w-[3px] h-full cursor-col-resize hover:bg-black/[0.08] dark:hover:bg-white/[0.08] transition-colors"
        onMouseDown={onMouseDown}
      />
    </aside>
  );
}
