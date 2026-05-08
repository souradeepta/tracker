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
  Keyboard,
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
        className={`group flex items-center gap-0.5 rounded-md cursor-pointer select-none transition-colors
          ${isActive
            ? "bg-[#37352F]/10 dark:bg-white/10 text-[#37352F] dark:text-white"
            : "text-[#37352F]/80 dark:text-white/70 hover:bg-[#37352F]/[0.06] dark:hover:bg-white/[0.06]"
          }`}
        style={{ paddingLeft: `${6 + depth * 14}px`, paddingRight: "4px", paddingTop: "2px", paddingBottom: "2px" }}
        onClick={() => setActive(page.id)}
        onContextMenu={handleContextMenu}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <button
          className="w-5 h-5 flex items-center justify-center rounded hover:bg-[#37352F]/10 dark:hover:bg-white/10 text-[#37352F]/40 dark:text-white/30 flex-shrink-0"
          onClick={(e) => { e.stopPropagation(); if (children.length > 0) toggleExpand(page.id); }}
        >
          {children.length > 0
            ? isExpanded
              ? <ChevronDown size={11} />
              : <ChevronRight size={11} />
            : <span className="w-3" />}
        </button>

        <span className="text-[15px] leading-none flex-shrink-0">{page.icon}</span>

        <span className="flex-1 text-[13px] leading-5 truncate ml-1">
          {page.title || <span className="text-[#37352F]/40 dark:text-white/30">Untitled</span>}
        </span>

        {page.locked && <Lock size={10} className="text-[#37352F]/30 dark:text-white/20 flex-shrink-0 mr-0.5" />}

        {hovered && (
          <div className="flex items-center flex-shrink-0">
            <button
              className="w-5 h-5 flex items-center justify-center rounded hover:bg-[#37352F]/10 dark:hover:bg-white/10 text-[#37352F]/50 dark:text-white/40"
              onClick={(e) => { e.stopPropagation(); onExport(page.id); }}
              title="Export as Markdown"
            >
              <Download size={11} />
            </button>
            <button
              className="w-5 h-5 flex items-center justify-center rounded hover:bg-[#37352F]/10 dark:hover:bg-white/10 text-[#37352F]/50 dark:text-white/40"
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

// ─── Section label ───────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-2 pt-3 pb-0.5 text-[11px] font-semibold tracking-wider uppercase text-[#37352F]/40 dark:text-white/30">
      {children}
    </p>
  );
}

// ─── Sidebar nav button ───────────────────────────────────────────────────────
function NavButton({
  icon,
  label,
  shortcut,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
  onClick: () => void;
}) {
  return (
    <button
      className="w-full flex items-center gap-2 px-2 py-[5px] rounded-md text-[13px] text-[#37352F]/70 dark:text-white/60
        hover:bg-[#37352F]/[0.06] dark:hover:bg-white/[0.06] hover:text-[#37352F] dark:hover:text-white transition-colors"
      onClick={onClick}
    >
      <span className="flex-shrink-0 text-[#37352F]/50 dark:text-white/40">{icon}</span>
      <span className="flex-1 text-left">{label}</span>
      {shortcut && (
        <span className="text-[11px] text-[#37352F]/30 dark:text-white/20 font-mono">{shortcut}</span>
      )}
    </button>
  );
}

// ─── Trash section ───────────────────────────────────────────────────────────
function TrashSection() {
  const { pages, restorePage, permanentDelete, emptyTrash } = usePageStore();
  const [open, setOpen] = useState(false);
  const trashed = Object.values(pages).filter((p) => p.deleted);

  if (trashed.length === 0) return null;

  return (
    <div className="mt-1">
      <button
        className="w-full flex items-center gap-2 px-2 py-[5px] rounded-md text-[13px] text-[#37352F]/50 dark:text-white/40
          hover:bg-[#37352F]/[0.06] dark:hover:bg-white/[0.06] transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
        <Trash2 size={13} />
        <span>Trash</span>
        <span className="ml-auto text-[11px]">{trashed.length}</span>
      </button>
      {open && (
        <div className="mt-0.5 ml-3 border-l border-[#37352F]/10 dark:border-white/10 pl-2">
          {trashed.map((page) => (
            <div
              key={page.id}
              className="flex items-center gap-1.5 py-1 rounded group"
            >
              <span className="text-sm">{page.icon}</span>
              <span className="flex-1 text-[12px] text-[#37352F]/50 dark:text-white/40 truncate">
                {page.title || "Untitled"}
              </span>
              <button
                className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-[#37352F]/40 hover:text-green-600 dark:hover:text-green-400 transition-opacity"
                onClick={() => restorePage(page.id)} title="Restore"
              >
                <RotateCcw size={11} />
              </button>
              <button
                className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-[#37352F]/40 hover:text-red-500 transition-opacity"
                onClick={() => permanentDelete(page.id)} title="Delete permanently"
              >
                <X size={11} />
              </button>
            </div>
          ))}
          <button
            className="text-[11px] text-red-400 hover:text-red-600 dark:hover:text-red-400 py-0.5 transition-colors"
            onClick={emptyTrash}
          >
            Empty trash
          </button>
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
    <div className="mb-1">
      <button
        className="w-full flex items-center gap-2 px-2 py-[5px] rounded-md text-[13px] text-[#37352F]/50 dark:text-white/40
          hover:bg-[#37352F]/[0.06] dark:hover:bg-white/[0.06] transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
        <Clock size={13} />
        <span className="text-[11px] font-semibold tracking-wider uppercase">Recent</span>
      </button>
      {open && (
        <div className="ml-3 border-l border-[#37352F]/10 dark:border-white/10 pl-2">
          {recents.map((page) => (
            <button
              key={page.id}
              className="w-full flex items-center gap-1.5 py-[3px] text-left rounded-md
                text-[12px] text-[#37352F]/60 dark:text-white/50 hover:text-[#37352F] dark:hover:text-white
                hover:bg-[#37352F]/[0.06] dark:hover:bg-white/[0.06] px-1 transition-colors"
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

// ─── Sidebar ─────────────────────────────────────────────────────────────────
interface Props {
  onSearch: () => void;
  onExport: (id: string) => void;
  onTemplates: () => void;
  onShortcuts: () => void;
}

export function Sidebar({ onSearch, onExport, onTemplates, onShortcuts }: Props) {
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
      <aside className="w-10 flex-shrink-0 h-full bg-[#F7F6F3] dark:bg-[#191919] flex flex-col items-center py-2 gap-1">
        <button
          onClick={toggleSidebarCollapsed}
          className="w-8 h-8 flex items-center justify-center rounded-md text-[#37352F]/50 dark:text-white/40 hover:bg-[#37352F]/[0.08] dark:hover:bg-white/[0.08] transition-colors"
          title="Expand sidebar"
        >
          <PanelLeftOpen size={15} />
        </button>
        <button onClick={onSearch} className="w-8 h-8 flex items-center justify-center rounded-md text-[#37352F]/50 dark:text-white/40 hover:bg-[#37352F]/[0.08] dark:hover:bg-white/[0.08] transition-colors" title="Search (⌘K)">
          <Search size={15} />
        </button>
        <button onClick={() => createPage(null)} className="w-8 h-8 flex items-center justify-center rounded-md text-[#37352F]/50 dark:text-white/40 hover:bg-[#37352F]/[0.08] dark:hover:bg-white/[0.08] transition-colors" title="New page (⌘N)">
          <Plus size={15} />
        </button>
        <button onClick={onTemplates} className="w-8 h-8 flex items-center justify-center rounded-md text-[#37352F]/50 dark:text-white/40 hover:bg-[#37352F]/[0.08] dark:hover:bg-white/[0.08] transition-colors" title="Templates">
          <Layout size={15} />
        </button>
      </aside>
    );
  }

  return (
    <aside
      className="flex-shrink-0 h-full bg-[#F7F6F3] dark:bg-[#191919] flex flex-col relative"
      style={{ width: sidebarWidth }}
    >
      {/* Workspace header */}
      <div className="flex items-center gap-2 px-3 py-2 mt-1">
        <div className="w-6 h-6 rounded-md bg-[#37352F] dark:bg-white flex items-center justify-center flex-shrink-0">
          <span className="text-white dark:text-[#191919] text-[11px] font-bold">T</span>
        </div>
        <span className="flex-1 text-[14px] font-semibold text-[#37352F] dark:text-white truncate">Tracker</span>
        <button
          onClick={toggleDark}
          className="w-6 h-6 flex items-center justify-center rounded-md text-[#37352F]/40 dark:text-white/40 hover:bg-[#37352F]/[0.08] dark:hover:bg-white/[0.08] transition-colors"
          title="Toggle dark mode (⌘⇧D)"
        >
          {dark ? <Sun size={13} /> : <Moon size={13} />}
        </button>
        <button
          onClick={toggleSidebarCollapsed}
          className="w-6 h-6 flex items-center justify-center rounded-md text-[#37352F]/40 dark:text-white/40 hover:bg-[#37352F]/[0.08] dark:hover:bg-white/[0.08] transition-colors"
          title="Collapse sidebar"
        >
          <PanelLeftClose size={13} />
        </button>
      </div>

      {/* Navigation actions */}
      <div className="px-2 pb-1">
        <NavButton icon={<Search size={14} />} label="Search" shortcut="⌘K" onClick={onSearch} />
        <NavButton icon={<Layout size={14} />} label="Templates" shortcut="⌘⇧T" onClick={onTemplates} />
        <NavButton icon={<Keyboard size={14} />} label="Shortcuts" onClick={onShortcuts} />
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-2 min-h-0">
        {/* Recent */}
        <RecentSection />

        {/* Favorites */}
        {favorites.length > 0 && (
          <div className="mb-1">
            <SectionLabel><Star size={9} className="inline mr-1" />Favorites</SectionLabel>
            {favorites.map((page) => <PageItem key={page.id} page={page} depth={0} onExport={onExport} />)}
          </div>
        )}

        {/* Pages */}
        <div className="flex items-center justify-between pr-1">
          <SectionLabel>Pages</SectionLabel>
          <button
            className="w-5 h-5 flex items-center justify-center rounded-md text-[#37352F]/40 dark:text-white/30 hover:bg-[#37352F]/[0.08] dark:hover:bg-white/[0.08] hover:text-[#37352F] dark:hover:text-white transition-colors mt-3"
            onClick={() => createPage(null)}
            title="New page (⌘N)"
          >
            <Plus size={13} />
          </button>
        </div>

        {rootPages.length === 0 ? (
          <div className="px-3 py-2 text-[12px] text-[#37352F]/35 dark:text-white/25 italic">
            No pages yet. Click + or press ⌘N.
          </div>
        ) : (
          rootPages.map((page) => <PageItem key={page.id} page={page} depth={0} onExport={onExport} />)
        )}

        <TrashSection />
      </div>

      {/* Footer */}
      <div className="px-2 pb-2 pt-1 border-t border-[#37352F]/10 dark:border-white/10">
        <button
          className="w-full flex items-center gap-2 px-2 py-[5px] rounded-md text-[13px] text-[#37352F]/60 dark:text-white/50
            hover:bg-[#37352F]/[0.06] dark:hover:bg-white/[0.06] hover:text-[#37352F] dark:hover:text-white transition-colors"
          onClick={() => createPage(null)}
        >
          <Plus size={14} className="text-[#37352F]/40 dark:text-white/30" />
          <span>New page</span>
        </button>
      </div>

      {/* Resize handle */}
      <div
        className="absolute top-0 right-0 w-[3px] h-full cursor-col-resize hover:bg-blue-400/40 active:bg-blue-500/60 transition-colors"
        onMouseDown={onMouseDown}
      />
    </aside>
  );
}
