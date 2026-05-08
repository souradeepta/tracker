import { X, Sparkles } from "lucide-react";
import { TEMPLATES } from "../lib/templates";
import { usePageStore } from "../store/pages";

interface Props { open: boolean; onClose: () => void; }

const TEMPLATE_GRADIENTS: Record<string, string> = {
  "meeting-notes":  "linear-gradient(135deg,#3b82f6,#06b6d4)",
  "daily-journal":  "linear-gradient(135deg,#8b5cf6,#7c3aed)",
  "project-plan":   "linear-gradient(135deg,#6366f1,#3b82f6)",
  "bug-report":     "linear-gradient(135deg,#ef4444,#f97316)",
  "reading-notes":  "linear-gradient(135deg,#f59e0b,#eab308)",
  "weekly-review":  "linear-gradient(135deg,#22c55e,#10b981)",
};

export function TemplatesModal({ open, onClose }: Props) {
  const { createFromTemplate } = usePageStore();
  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 50,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--surface)", borderRadius: 20,
          boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
          border: "1px solid var(--border)",
          width: "100%", maxWidth: 640, maxHeight: "80vh",
          overflow: "hidden", display: "flex", flexDirection: "column",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg,#6366f1,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Sparkles size={14} style={{ color: "#fff" }} />
            </div>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", margin: 0 }}>Templates</h2>
              <p style={{ fontSize: 11, color: "var(--text3)", margin: 0 }}>Choose a template to get started quickly</p>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose} style={{ width: 32, height: 32, borderRadius: 10 }}>
            <X size={14} />
          </button>
        </div>

        {/* Grid */}
        <div style={{ overflowY: "auto", padding: 20, display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }}>
          {TEMPLATES.map((tpl) => {
            const gradient = TEMPLATE_GRADIENTS[tpl.key] ?? "linear-gradient(135deg,#9ca3af,#6b7280)";
            return (
              <button
                key={tpl.key}
                onClick={() => { createFromTemplate(tpl.key); onClose(); }}
                style={{
                  textAlign: "left", padding: 16, borderRadius: 16,
                  border: "1px solid var(--border)", background: "var(--surface)",
                  cursor: "pointer", transition: "border-color 150ms, box-shadow 150ms",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLButtonElement;
                  el.style.borderColor = "#a5b4fc";
                  el.style.boxShadow = "0 4px 16px rgba(99,102,241,0.12)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLButtonElement;
                  el.style.borderColor = "var(--border)";
                  el.style.boxShadow = "none";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                    {tpl.icon}
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", margin: 0 }}>{tpl.name}</p>
                </div>
                <p style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.5, margin: "0 0 12px" }}>{tpl.description}</p>
                <span style={{ fontSize: 11, color: "#6366f1", fontWeight: 500 }}>Use template →</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
