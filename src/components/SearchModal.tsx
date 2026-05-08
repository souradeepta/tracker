import { useEffect, useRef, useState } from "react";
import { Search, X, Hash, Clock } from "lucide-react";
import { usePageStore } from "../store/pages";

interface Props { open: boolean; onClose: () => void; }

export function SearchModal({ open, onClose }: Props) {
  const { pages, recentPageIds, setActive } = usePageStore();
  const [query, setQuery]   = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const livePages = Object.values(pages).filter((p) => !p.deleted);
  const results = query.trim()
    ? livePages.filter((p) =>
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.tags.some((t) => t.includes(query.toLowerCase()))
      )
    : recentPageIds.map((id) => pages[id]).filter((p) => p && !p.deleted).slice(0, 8);

  useEffect(() => {
    if (open) {
      setQuery("");
      setCursor(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => setCursor(0), [query]);

  const choose = (id: string) => { setActive(id); onClose(); };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown")  { e.preventDefault(); setCursor((c) => Math.min(c + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setCursor((c) => Math.max(c - 1, 0)); }
    else if (e.key === "Enter" && results[cursor]) { choose(results[cursor].id); }
    else if (e.key === "Escape") { onClose(); }
  };

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 50,
        display: "flex", alignItems: "flex-start", justifyContent: "center",
        paddingTop: "15vh", background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 560, background: "var(--surface)",
          borderRadius: 20, boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
          border: "1px solid var(--border)", overflow: "hidden",
        }}
      >
        {/* Input */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
          <Search size={16} style={{ color: "var(--text3)", flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Search pages, tags…"
            style={{
              flex: 1, fontSize: 14, background: "transparent", outline: "none",
              border: "none", color: "var(--text)", fontFamily: "inherit",
            }}
          />
          <button className="icon-btn" onClick={onClose} style={{ width: 28, height: 28, borderRadius: 8 }}>
            <X size={14} />
          </button>
        </div>

        {/* Results */}
        <div style={{ maxHeight: 360, overflowY: "auto", padding: "8px 0" }}>
          {!query.trim() && (
            <p style={{ padding: "0 16px 4px", fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text3)", display: "flex", alignItems: "center", gap: 6 }}>
              <Clock size={9} /> Recent
            </p>
          )}

          {results.length === 0 ? (
            <div style={{ padding: "32px 16px", textAlign: "center" }}>
              <p style={{ fontSize: 14, color: "var(--text2)", margin: "0 0 4px" }}>No pages found for "{query}"</p>
              <p style={{ fontSize: 12, color: "var(--text3)", margin: 0 }}>Try a different search term</p>
            </div>
          ) : (
            results.map((page, i) => (
              <button
                key={page.id}
                onClick={() => choose(page.id)}
                onMouseEnter={() => setCursor(i)}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 16px", textAlign: "left", border: "none", cursor: "pointer",
                  background: i === cursor ? "#EEF2FF" : "transparent",
                  transition: "background 80ms",
                }}
              >
                <span style={{ fontSize: 18, flexShrink: 0, lineHeight: 1 }}>{page.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: i === cursor ? "#4338ca" : "var(--text)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {page.title || "Untitled"}
                  </p>
                  {page.tags.length > 0 && (
                    <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                      <Hash size={9} style={{ color: "var(--text3)" }} />
                      <p style={{ fontSize: 11, color: "var(--text3)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{page.tags.join(", ")}</p>
                    </div>
                  )}
                </div>
                {i === cursor && (
                  <kbd style={{ fontSize: 10, fontFamily: "monospace", color: "#4338ca", background: "#EEF2FF", border: "1px solid #C7D2FE", padding: "2px 6px", borderRadius: 6, flexShrink: 0 }}>↵</kbd>
                )}
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", borderTop: "1px solid var(--border)", background: "var(--hover)" }}>
          {[["↑↓", "navigate"], ["↵", "open"], ["esc", "close"]].map(([key, label]) => (
            <span key={key} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <kbd style={{ fontSize: 10, fontFamily: "monospace", background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text2)", padding: "2px 6px", borderRadius: 5 }}>{key}</kbd>
              <span style={{ fontSize: 11, color: "var(--text3)" }}>{label}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
