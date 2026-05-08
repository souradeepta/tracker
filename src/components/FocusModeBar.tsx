import { X, Lock, Unlock, Download } from "lucide-react";
import { useSettingsStore } from "../store/settings";
import { usePageStore } from "../store/pages";

interface Props { onExport: (id: string) => void; }

export function FocusModeBar({ onExport }: Props) {
  const { toggleFocusMode } = useSettingsStore();
  const { pages, activePageId, toggleLocked } = usePageStore();
  const page = activePageId ? pages[activePageId] : null;

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 32px", height: 44,
      background: "rgba(255,255,255,0.9)", backdropFilter: "blur(12px)",
      borderBottom: "1px solid var(--border)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 24, height: 24, borderRadius: 7, background: "linear-gradient(135deg,#6366f1,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ color: "#fff", fontSize: 10, fontWeight: 700 }}>T</span>
        </div>
        {page && (
          <>
            <span style={{ color: "var(--text3)" }}>/</span>
            <span style={{ fontSize: 15 }}>{page.icon}</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text)", maxWidth: 320, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {page.title || "Untitled"}
            </span>
          </>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {page && (
          <>
            <button className="icon-btn" style={{ width: 32, height: 32, borderRadius: 10 }} onClick={() => toggleLocked(page.id)} title={page.locked ? "Unlock page" : "Lock page"}>
              {page.locked ? <Unlock size={14} /> : <Lock size={14} />}
            </button>
            <button className="icon-btn" style={{ width: 32, height: 32, borderRadius: 10 }} onClick={() => onExport(page.id)} title="Export as Markdown">
              <Download size={14} />
            </button>
          </>
        )}
        <button
          onClick={toggleFocusMode}
          style={{
            display: "flex", alignItems: "center", gap: 6, fontSize: 12,
            fontWeight: 500, color: "var(--text2)", background: "var(--hover)",
            border: "none", borderRadius: 10, padding: "6px 12px", cursor: "pointer",
            transition: "background 100ms, color 100ms",
          }}
          onMouseEnter={(e) => { const el = e.currentTarget as HTMLButtonElement; el.style.background = "var(--active)"; el.style.color = "var(--text)"; }}
          onMouseLeave={(e) => { const el = e.currentTarget as HTMLButtonElement; el.style.background = "var(--hover)"; el.style.color = "var(--text2)"; }}
          title="Exit focus mode (⌘⇧F)"
        >
          <X size={12} /> Exit focus
        </button>
      </div>
    </div>
  );
}
