import { useState } from "react";
import { ChevronDown, Filter, MoreHorizontal, Plus, Search, SlidersHorizontal } from "lucide-react";
import { usePageStore } from "../../store/pages";
import { groupPagesByStatus } from "../../lib/kanban";
import type { Page, PageStatus } from "../../types";

const STATUS_CFG: Record<PageStatus, { label: string; bg: string; color: string }> = {
  none:          { label: "No status",   bg: "#F3F2EF", color: "#787774" },
  todo:          { label: "Not started", bg: "#FEF2F2", color: "#DC2626" },
  "in-progress": { label: "In progress", bg: "#EFF6FF", color: "#2563EB" },
  done:          { label: "Complete",    bg: "#F0FDF4", color: "#16A34A" },
};

const PRIORITY_CFG: Record<string, { label: string; bg: string; color: string; border: string }> = {
  high:   { label: "High 🔥", bg: "#FFF1F2", color: "#BE123C", border: "#fecdd3" },
  medium: { label: "Medium",  bg: "#FFF7ED", color: "#C2410C", border: "#fed7aa" },
  low:    { label: "Low",     bg: "#F0F9FF", color: "#0369A1", border: "#bae6fd" },
};

function KanbanCard({ page }: { page: Page }) {
  const { setActive } = usePageStore();

  return (
    <div className="kanban-card" onClick={() => setActive(page.id)}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12 }}>
        <span style={{ fontSize: 18, lineHeight: 1, flexShrink: 0, marginTop: 2 }}>{page.icon}</span>
        <p style={{
          flex: 1, fontSize: 14, fontWeight: 600, color: "var(--text)", lineHeight: 1.4,
          margin: 0, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>
          {page.title || <span style={{ color: "var(--text3)", fontStyle: "italic", fontWeight: 400 }}>Untitled</span>}
        </p>
        <button
          onClick={(e) => e.stopPropagation()}
          className="icon-btn"
          style={{ width: 24, height: 24, borderRadius: 6, opacity: 0, transition: "opacity 150ms" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
        >
          <MoreHorizontal size={13} />
        </button>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {page.priority !== "none" && PRIORITY_CFG[page.priority] && (
          <span style={{
            fontSize: 11, fontWeight: 500, padding: "2px 8px", borderRadius: 999,
            background: PRIORITY_CFG[page.priority].bg,
            color: PRIORITY_CFG[page.priority].color,
            border: `1px solid ${PRIORITY_CFG[page.priority].border}`,
          }}>
            {PRIORITY_CFG[page.priority].label}
          </span>
        )}
        {page.tags.slice(0, 2).map((tag) => (
          <span key={tag} style={{
            fontSize: 11, fontWeight: 500, padding: "2px 8px", borderRadius: 999,
            background: "#EEF2FF", color: "#4F46E5", border: "1px solid #C7D2FE",
          }}>
            {tag}
          </span>
        ))}
        {page.tags.length > 2 && (
          <span style={{ fontSize: 11, color: "var(--text3)" }}>+{page.tags.length - 2}</span>
        )}
      </div>
    </div>
  );
}

function Column({ status, pages, onAdd }: { status: PageStatus; pages: Page[]; onAdd: () => void }) {
  const cfg = STATUS_CFG[status];
  return (
    <div style={{ display: "flex", flexDirection: "column", width: 272, flexShrink: 0, height: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, padding: "0 2px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 999, background: cfg.bg, color: cfg.color }}>
            {cfg.label}
          </span>
          <span style={{ fontSize: 13, color: "var(--text3)", fontWeight: 500 }}>{pages.length}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          <button className="icon-btn" style={{ width: 24, height: 24, borderRadius: 6 }}><MoreHorizontal size={13} /></button>
          <button className="icon-btn" style={{ width: 24, height: 24, borderRadius: 6 }} onClick={onAdd}><Plus size={13} /></button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, overflowY: "auto", flex: 1, paddingBottom: 8 }}>
        {pages.sort((a, b) => b.updatedAt - a.updatedAt).map((page) => <KanbanCard key={page.id} page={page} />)}
        <button
          onClick={onAdd}
          style={{
            display: "flex", alignItems: "center", gap: 8, padding: "8px 8px", borderRadius: 8,
            fontSize: 13, color: "var(--text3)", background: "transparent", border: "none", cursor: "pointer",
            marginTop: 4, transition: "background 100ms, color 100ms",
          }}
          onMouseEnter={(e) => { const el = e.currentTarget as HTMLButtonElement; el.style.background = "var(--hover)"; el.style.color = "var(--text)"; }}
          onMouseLeave={(e) => { const el = e.currentTarget as HTMLButtonElement; el.style.background = "transparent"; el.style.color = "var(--text3)"; }}
        >
          <Plus size={14} /> New
        </button>
      </div>
    </div>
  );
}

export function KanbanBoard() {
  const { pages, createPage, setStatus } = usePageStore();
  const [_filterOpen, setFilterOpen] = useState(false);
  const livePages = Object.values(pages).filter((p) => !p.deleted);
  const columns = groupPagesByStatus(livePages);

  const handleAdd = (status: PageStatus) => {
    const id = createPage(null);
    setStatus(id, status);
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "var(--surface)" }}>
      {/* Toolbar */}
      <div style={{ height: 44, display: "flex", alignItems: "center", gap: 4, padding: "0 24px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
        <button
          style={{
            display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 500,
            color: "var(--text)", padding: "6px 10px", borderRadius: 8, background: "transparent",
            border: "none", cursor: "pointer", transition: "background 100ms",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--hover)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
        >
          <SlidersHorizontal size={13} style={{ color: "var(--text2)" }} />
          By Status
          <ChevronDown size={11} style={{ color: "var(--text2)" }} />
        </button>

        <div style={{ width: 1, height: 16, background: "var(--border)", margin: "0 4px" }} />

        {(["Properties", "Group by Status", "Sort"] as const).map((label) => (
          <button
            key={label}
            style={{
              display: "flex", alignItems: "center", gap: 6, fontSize: 13,
              color: "var(--text2)", padding: "6px 10px", borderRadius: 8,
              background: "transparent", border: "none", cursor: "pointer", transition: "background 100ms, color 100ms",
            }}
            onMouseEnter={(e) => { const el = e.currentTarget as HTMLButtonElement; el.style.background = "var(--hover)"; el.style.color = "var(--text)"; }}
            onMouseLeave={(e) => { const el = e.currentTarget as HTMLButtonElement; el.style.background = "transparent"; el.style.color = "var(--text2)"; }}
          >
            {label}
          </button>
        ))}
        <button
          onClick={() => setFilterOpen((v) => !v)}
          style={{
            display: "flex", alignItems: "center", gap: 6, fontSize: 13,
            color: "var(--text2)", padding: "6px 10px", borderRadius: 8,
            background: "transparent", border: "none", cursor: "pointer", transition: "background 100ms, color 100ms",
          }}
          onMouseEnter={(e) => { const el = e.currentTarget as HTMLButtonElement; el.style.background = "var(--hover)"; el.style.color = "var(--text)"; }}
          onMouseLeave={(e) => { const el = e.currentTarget as HTMLButtonElement; el.style.background = "transparent"; el.style.color = "var(--text2)"; }}
        >
          <Filter size={11} /> Filter
        </button>

        <div style={{ flex: 1 }} />

        <button className="icon-btn" style={{ width: 28, height: 28, borderRadius: 8 }}><Search size={13} /></button>
        <button className="icon-btn" style={{ width: 28, height: 28, borderRadius: 8 }}><MoreHorizontal size={13} /></button>

        <div style={{ display: "flex", alignItems: "center", marginLeft: 4 }}>
          <button
            onClick={() => createPage(null)}
            style={{
              display: "flex", alignItems: "center", gap: 6, background: "#2383E2", color: "#fff",
              fontSize: 13, fontWeight: 500, padding: "6px 12px", borderRadius: "8px 0 0 8px",
              border: "none", cursor: "pointer",
              transition: "background 100ms",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#1a73d6"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#2383E2"; }}
          >
            New
          </button>
          <button
            style={{
              background: "#2383E2", color: "#fff", padding: "6px 6px", borderRadius: "0 8px 8px 0",
              borderLeft: "1px solid rgba(255,255,255,0.2)", border: "none", cursor: "pointer",
              transition: "background 100ms",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#1a73d6"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#2383E2"; }}
          >
            <ChevronDown size={12} />
          </button>
        </div>
      </div>

      {/* Columns */}
      <div style={{ flex: 1, overflowX: "auto", overflowY: "hidden", background: "var(--surface2)" }}>
        <div style={{ display: "flex", gap: 20, padding: 32, height: "100%", minWidth: "max-content", alignItems: "flex-start" }}>
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
