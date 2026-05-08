import { useState } from "react";
import { Plus, X, Zap } from "lucide-react";
import { usePageStore } from "../store/pages";

export function QuickCapture() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const { createPage, updateTitle } = usePageStore();

  const handleCapture = () => {
    const id = createPage(null);
    if (title.trim()) updateTitle(id, title.trim());
    setTitle("");
    setOpen(false);
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        title="Quick capture"
        style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 40,
          width: 44, height: 44, borderRadius: "50%",
          background: "#1A1A1A", color: "#fff",
          boxShadow: "0 4px 16px rgba(0,0,0,0.20)",
          display: "flex", alignItems: "center", justifyContent: "center",
          border: "none", cursor: "pointer",
          transition: "transform 120ms, box-shadow 120ms",
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLButtonElement;
          el.style.transform = "scale(1.07)";
          el.style.boxShadow = "0 8px 24px rgba(0,0,0,0.25)";
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLButtonElement;
          el.style.transform = "scale(1)";
          el.style.boxShadow = "0 4px 16px rgba(0,0,0,0.20)";
        }}
      >
        <Plus size={20} />
      </button>

      {/* Popover */}
      {open && (
        <div
          style={{
            position: "fixed", bottom: 80, right: 24, zIndex: 50,
            background: "var(--surface)", borderRadius: 16,
            boxShadow: "0 16px 48px rgba(0,0,0,0.16)",
            border: "1px solid var(--border)", width: 320, padding: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Zap size={14} style={{ color: "var(--text3)" }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.07em", flex: 1 }}>
              Quick capture
            </span>
            <button className="icon-btn" style={{ width: 20, height: 20, borderRadius: 4 }} onClick={() => setOpen(false)}>
              <X size={13} />
            </button>
          </div>

          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCapture();
              if (e.key === "Escape") setOpen(false);
            }}
            placeholder="Page title… (Enter to create)"
            style={{
              width: "100%", fontSize: 13, border: "1px solid var(--border)",
              borderRadius: 8, padding: "8px 12px", outline: "none",
              background: "var(--hover)", color: "var(--text)",
              fontFamily: "inherit", transition: "border-color 150ms",
              boxSizing: "border-box",
            }}
            onFocus={(e) => { (e.currentTarget as HTMLInputElement).style.borderColor = "#6366f1"; }}
            onBlur={(e) => { (e.currentTarget as HTMLInputElement).style.borderColor = "var(--border)"; }}
          />

          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button
              onClick={handleCapture}
              style={{
                flex: 1, background: "#1A1A1A", color: "#fff",
                fontSize: 12, fontWeight: 500, padding: "8px 0",
                borderRadius: 8, border: "none", cursor: "pointer",
                transition: "background 100ms",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#333"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#1A1A1A"; }}
            >
              Create page
            </button>
            <button
              onClick={() => setOpen(false)}
              style={{
                padding: "8px 14px", fontSize: 12, color: "var(--text2)",
                background: "transparent", border: "none", cursor: "pointer", borderRadius: 8,
                transition: "color 100ms",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--text)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--text2)"; }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
