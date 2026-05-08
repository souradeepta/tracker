import { X, Keyboard } from "lucide-react";

interface Props { open: boolean; onClose: () => void; }

const SHORTCUTS = [
  {
    group: "Navigation",
    color: "#6366f1",
    items: [
      { keys: ["⌘", "K"], label: "Search all pages" },
      { keys: ["⌘", "N"], label: "New page" },
      { keys: ["⌘", "⇧", "B"], label: "Toggle Board / Kanban view" },
      { keys: ["⌘", "⇧", "F"], label: "Focus mode" },
    ],
  },
  {
    group: "Panels",
    color: "#8b5cf6",
    items: [
      { keys: ["⌘", "⇧", "T"], label: "Template gallery" },
      { keys: ["⌘", "⇧", "G"], label: "Tag browser" },
      { keys: ["⌘", "⇧", "D"], label: "Toggle dark mode" },
      { keys: ["?"], label: "Shortcuts reference" },
    ],
  },
  {
    group: "Editing",
    color: "#3b82f6",
    items: [
      { keys: ["/"], label: "Insert block (heading, list, code…)" },
      { keys: ["Enter"], label: "Focus editor from title" },
      { keys: ["⌘", "B"], label: "Bold" },
      { keys: ["⌘", "I"], label: "Italic" },
    ],
  },
  {
    group: "Page actions",
    color: "#22c55e",
    items: [
      { keys: ["Right-click"], label: "Context menu (duplicate, delete…)" },
      { keys: ["⌘", "⇧", "L"], label: "Lock / unlock page" },
    ],
  },
];

export function ShortcutsModal({ open, onClose }: Props) {
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
          width: "100%", maxWidth: 480, background: "var(--surface)",
          borderRadius: 20, boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
          border: "1px solid var(--border)", overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "18px 24px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg,#6366f1,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Keyboard size={14} style={{ color: "#fff" }} />
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", margin: 0 }}>Keyboard shortcuts</h2>
            <p style={{ fontSize: 11, color: "var(--text3)", margin: 0 }}>Press Esc or click outside to close</p>
          </div>
          <button className="icon-btn" onClick={onClose} style={{ width: 32, height: 32, borderRadius: 10 }}>
            <X size={14} />
          </button>
        </div>

        {/* Shortcuts list */}
        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 20, maxHeight: "60vh", overflowY: "auto" }}>
          {SHORTCUTS.map((group) => (
            <div key={group.group}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{ width: 3, height: 16, borderRadius: 99, background: group.color }} />
                <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text3)", margin: 0 }}>
                  {group.group}
                </p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, paddingLeft: 16 }}>
                {group.items.map((item) => (
                  <div key={item.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
                    <span style={{ fontSize: 13, color: "var(--text2)" }}>{item.label}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                      {item.keys.map((key, i) => (
                        <kbd
                          key={i}
                          style={{
                            padding: "3px 7px", fontSize: 11, fontFamily: "monospace",
                            background: "var(--hover)", color: "var(--text2)",
                            borderRadius: 6, border: "1px solid var(--border)",
                            boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
                          }}
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
