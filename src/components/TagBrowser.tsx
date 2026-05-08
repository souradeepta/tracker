import React from "react";
import { X, Tag } from "lucide-react";
import { usePageStore } from "../store/pages";

interface Props { open: boolean; onClose: () => void; }

export function TagBrowser({ open, onClose }: Props) {
  const { pages, getAllTags, setActive } = usePageStore();
  const [selectedTag, setSelectedTag] = React.useState<string | null>(null);

  const allTags    = getAllTags();
  const taggedPages = selectedTag
    ? Object.values(pages).filter((p) => !p.deleted && p.tags.includes(selectedTag))
    : [];

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 50,
        display: "flex", alignItems: "flex-start", justifyContent: "center",
        paddingTop: 80, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 600, background: "var(--surface)",
          borderRadius: 20, boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
          border: "1px solid var(--border)", overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Tag size={15} style={{ color: "var(--text2)" }} />
            <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", margin: 0 }}>Tag Browser</h2>
          </div>
          <button className="icon-btn" onClick={onClose} style={{ width: 28, height: 28, borderRadius: 8 }}><X size={15} /></button>
        </div>

        <div style={{ display: "flex", minHeight: 320 }}>
          {/* Tag list */}
          <div style={{ width: 192, borderRight: "1px solid var(--border)", padding: "8px 0", overflowY: "auto" }}>
            {allTags.length === 0 ? (
              <p style={{ fontSize: 12, color: "var(--text3)", padding: "8px 16px", margin: 0 }}>No tags yet</p>
            ) : (
              allTags.map((tag) => {
                const count = Object.values(pages).filter((p) => !p.deleted && p.tags.includes(tag)).length;
                const isSelected = tag === selectedTag;
                return (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "8px 16px", textAlign: "left", fontSize: 13, border: "none", cursor: "pointer",
                      background: isSelected ? "var(--active)" : "transparent",
                      color: isSelected ? "var(--text)" : "var(--text2)",
                      fontWeight: isSelected ? 500 : 400,
                      transition: "background 80ms, color 80ms",
                    }}
                    onMouseEnter={(e) => { if (!isSelected) { const el = e.currentTarget as HTMLButtonElement; el.style.background = "var(--hover)"; el.style.color = "var(--text)"; } }}
                    onMouseLeave={(e) => { if (!isSelected) { const el = e.currentTarget as HTMLButtonElement; el.style.background = "transparent"; el.style.color = "var(--text2)"; } }}
                  >
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tag}</span>
                    <span style={{ fontSize: 11, color: "var(--text3)", marginLeft: 8, flexShrink: 0 }}>{count}</span>
                  </button>
                );
              })
            )}
          </div>

          {/* Pages for selected tag */}
          <div style={{ flex: 1, padding: "8px 0", overflowY: "auto" }}>
            {!selectedTag ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                <p style={{ fontSize: 13, color: "var(--text3)", margin: 0 }}>Select a tag to see pages</p>
              </div>
            ) : taggedPages.length === 0 ? (
              <p style={{ fontSize: 13, color: "var(--text3)", padding: "8px 16px", margin: 0 }}>No pages with this tag</p>
            ) : (
              taggedPages.map((page) => (
                <button
                  key={page.id}
                  onClick={() => { setActive(page.id); onClose(); }}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "8px 16px",
                    textAlign: "left", border: "none", cursor: "pointer", background: "transparent",
                    transition: "background 80ms",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--hover)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                >
                  <span style={{ fontSize: 18 }}>{page.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, color: "var(--text)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{page.title || "Untitled"}</p>
                    {page.status !== "none" && <p style={{ fontSize: 11, color: "var(--text3)", margin: 0 }}>{page.status}</p>}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
