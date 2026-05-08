import { useCallback, useRef, useState } from "react";
import {
  ChevronRight, ChevronDown, Plus, Trash2, Search,
  RotateCcw, X, Moon, Sun, Download, Layout,
  PanelLeftClose, PanelLeftOpen, Lock, Keyboard, Zap, Home,
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
        className={`nav-item${isActive ? " active" : ""}`}
        style={{ paddingLeft: 12 + depth * 14, paddingRight: 6 }}
        onClick={() => setActive(page.id)}
        onContextMenu={(e) => { e.preventDefault(); setCtxMenu({ x: e.clientX, y: e.clientY }); }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <button
          style={{
            width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, color: "var(--text3)", background: "transparent", border: "none",
            cursor: "pointer", padding: 0, marginRight: 2,
          }}
          onClick={(e) => { e.stopPropagation(); if (children.length > 0) toggleExpand(page.id); }}
        >
          {children.length > 0
            ? isExpanded ? <ChevronDown size={11} /> : <ChevronRight size={11} />
            : <span style={{ width: 12, display: "inline-block" }} />}
        </button>

        <span style={{ fontSize: 14, lineHeight: 1, flexShrink: 0, marginRight: 6 }}>{page.icon}</span>

        <span style={{ flex: 1, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", fontWeight: isActive ? 500 : 400 }}>
          {page.title || <span style={{ opacity: 0.3, fontStyle: "italic", fontWeight: 400 }}>Untitled</span>}
        </span>

        {page.locked && !hovered && (
          <Lock size={9} style={{ flexShrink: 0, marginRight: 4, color: "var(--text3)" }} />
        )}

        {hovered && !isActive && (
          <div style={{ display: "flex", alignItems: "center", gap: 2, flexShrink: 0, marginLeft: 4 }}>
            <button className="icon-btn" style={{ width: 20, height: 20, borderRadius: 4 }} onClick={(e) => { e.stopPropagation(); onExport(page.id); }}>
              <Download size={10} />
            </button>
            <button className="icon-btn" style={{ width: 20, height: 20, borderRadius: 4 }} onClick={(e) => { e.stopPropagation(); createPage(page.id); }}>
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
    <div style={{ marginTop: 4 }}>
      <button className="nav-item" onClick={() => setOpen((v) => !v)} style={{ height: 32, fontSize: 12 }}>
        {open ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
        <Trash2 size={12} />
        <span style={{ flex: 1 }}>Trash</span>
        <span style={{ fontSize: 10, background: "rgba(0,0,0,0.06)", color: "var(--text2)", padding: "2px 6px", borderRadius: 999, fontWeight: 500 }}>
          {trashed.length}
        </span>
      </button>
      {open && (
        <div style={{ marginTop: 2, marginLeft: 16 }}>
          {trashed.map((page) => (
            <div key={page.id} style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 8px", height: 28, borderRadius: 6 }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "var(--hover)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
            >
              <span style={{ fontSize: 13 }}>{page.icon}</span>
              <span style={{ flex: 1, fontSize: 12, color: "var(--text2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{page.title || "Untitled"}</span>
              <button className="icon-btn" style={{ width: 18, height: 18, borderRadius: 4 }} onClick={() => restorePage(page.id)}><RotateCcw size={10} /></button>
              <button className="icon-btn" style={{ width: 18, height: 18, borderRadius: 4, color: "#f87171" }} onClick={() => permanentDelete(page.id)}><X size={10} /></button>
            </div>
          ))}
          <button
            onClick={emptyTrash}
            style={{ fontSize: 11, color: "#f87171", background: "transparent", border: "none", cursor: "pointer", padding: "2px 8px", borderRadius: 4 }}
          >
            Empty trash
          </button>
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
    <div style={{ marginBottom: 4 }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex", alignItems: "center", gap: 6, padding: "0 8px", height: 24,
          fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em",
          color: "var(--text3)", background: "transparent", border: "none", cursor: "pointer", width: "100%",
        }}
      >
        {open ? <ChevronDown size={9} /> : <ChevronRight size={9} />}
        Recent
      </button>
      {open && (
        <div style={{ marginBottom: 8 }}>
          {recents.map((page) => (
            <button key={page.id} className="nav-item" onClick={() => setActive(page.id)} style={{ height: 32, fontSize: 12 }}>
              <span style={{ fontSize: 13, flexShrink: 0, opacity: 0.7 }}>{page.icon}</span>
              <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}>{page.title || "Untitled"}</span>
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
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 8px 4px" }}>
      <span style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text3)" }}>
        {label}
      </span>
      {onAdd && (
        <button className="icon-btn" style={{ width: 20, height: 20, borderRadius: 4 }} onClick={onAdd}>
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
  const { pages, activePageId, createPage, setActive } = usePageStore();
  const { dark, toggleDark, sidebarWidth, setSidebarWidth, sidebarCollapsed, toggleSidebarCollapsed } = useSettingsStore();

  const favorites  = Object.values(pages).filter((p) => p.favorited && !p.deleted);
  const rootPages  = Object.values(pages).filter((p) => p.parentId === null && !p.deleted).sort((a, b) => a.createdAt - b.createdAt);

  const dragging = useRef(false);
  const startX   = useRef(0);
  const startW   = useRef(0);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    dragging.current = true;
    startX.current   = e.clientX;
    startW.current   = sidebarWidth;
    document.body.style.cursor     = "col-resize";
    document.body.style.userSelect = "none";
    const onMove = (ev: MouseEvent) => { if (dragging.current) setSidebarWidth(startW.current + ev.clientX - startX.current); };
    const onUp   = () => {
      dragging.current = false;
      document.body.style.cursor     = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [sidebarWidth, setSidebarWidth]);

  const sidebarStyle: React.CSSProperties = {
    flexShrink: 0, height: "100%",
    background: "var(--surface)", borderRadius: 16,
    boxShadow: "0 0 0 1px var(--border), 0 2px 8px rgba(0,0,0,0.04)",
    display: "flex", flexDirection: "column", position: "relative", overflow: "hidden",
  };

  if (sidebarCollapsed) {
    return (
      <aside style={{ ...sidebarStyle, width: 48, alignItems: "center", padding: "12px 0", gap: 4 }}>
        <button className="icon-btn" onClick={toggleSidebarCollapsed} title="Expand"><PanelLeftOpen size={14} /></button>
        <button className="icon-btn" onClick={onSearch} title="Search"><Search size={14} /></button>
        <button className="icon-btn" onClick={() => createPage(null)} title="New page"><Plus size={14} /></button>
        <button className="icon-btn" onClick={onTemplates} title="Templates"><Layout size={14} /></button>
      </aside>
    );
  }

  return (
    <aside style={{ ...sidebarStyle, width: sidebarWidth }}>
      {/* Workspace header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 12px", height: 56, flexShrink: 0, borderBottom: "1px solid var(--border)" }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#6366f1,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>T</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Tracker</p>
          <p style={{ fontSize: 10, color: "var(--text2)", margin: 0 }}>Personal workspace</p>
        </div>
        <button className="icon-btn" onClick={toggleDark} title="Toggle dark mode">
          {dark ? <Sun size={13} /> : <Moon size={13} />}
        </button>
        <button className="icon-btn" onClick={toggleSidebarCollapsed} title="Collapse sidebar">
          <PanelLeftClose size={13} />
        </button>
      </div>

      {/* Nav */}
      <div style={{ padding: "8px 12px", borderBottom: "1px solid var(--border)" }}>
        <button
          className={`nav-item${activePageId === null ? " active" : ""}`}
          onClick={() => setActive(null)}
        >
          <Home size={13} style={{ color: activePageId === null ? "var(--text2)" : "var(--text3)" }} />
          Home
        </button>
        <button
          onClick={onSearch}
          style={{
            display: "flex", alignItems: "center", gap: 10, padding: "0 12px", height: 36, borderRadius: 8,
            fontSize: 13, color: "var(--text2)", background: "var(--hover)", border: "none", cursor: "pointer",
            width: "100%", marginTop: 2,
          }}
        >
          <Search size={13} style={{ color: "var(--text3)" }} />
          <span style={{ flex: 1, textAlign: "left" }}>Search…</span>
          <kbd style={{ fontSize: 10, fontFamily: "monospace", color: "var(--text3)" }}>⌘K</kbd>
        </button>
        {([
          { icon: <Layout size={13} />,   label: "Templates", action: onTemplates },
          { icon: <Keyboard size={13} />, label: "Shortcuts", action: onShortcuts },
          { icon: <Zap size={13} />,      label: "Quick capture", action: () => {} },
        ] as const).map(({ icon, label, action }) => (
          <button key={label} className="nav-item" onClick={action as () => void} style={{ marginTop: 2 }}>
            <span style={{ color: "var(--text3)" }}>{icon}</span>
            <span style={{ flex: 1 }}>{label}</span>
          </button>
        ))}
      </div>

      {/* Page tree */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 12px", minHeight: 0 }}>
        <RecentSection />

        {favorites.length > 0 && (
          <>
            <SectionHeader label="Favorites" />
            <div style={{ marginBottom: 4 }}>
              {favorites.map((page) => <PageItem key={page.id} page={page} depth={0} onExport={onExport} />)}
            </div>
          </>
        )}

        <SectionHeader label="Pages" onAdd={() => createPage(null)} />
        <div>
          {rootPages.length === 0 ? (
            <button
              onClick={() => createPage(null)}
              style={{
                display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", marginTop: 4,
                borderRadius: 8, fontSize: 12, color: "var(--text3)", background: "transparent",
                border: "1px dashed var(--border)", cursor: "pointer", width: "100%",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--hover)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
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
      <div style={{ padding: "8px 12px", borderTop: "1px solid var(--border)" }}>
        <button className="nav-item" onClick={() => createPage(null)}>
          <Plus size={13} style={{ color: "var(--text3)" }} />
          New page
        </button>
      </div>

      {/* Resize handle */}
      <div
        style={{ position: "absolute", top: 0, right: 0, width: 3, height: "100%", cursor: "col-resize" }}
        onMouseDown={onMouseDown}
        onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "var(--border)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
      />
    </aside>
  );
}
