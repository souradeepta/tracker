import { useState } from "react";
import { Tag, X, ChevronDown } from "lucide-react";
import { usePageStore } from "../store/pages";
import type { PageStatus, PagePriority } from "../types";

const STATUS_CFG: Record<PageStatus, { label: string; bg: string; color: string }> = {
  none:          { label: "No status",   bg: "#F5F4F1", color: "#9B9A97" },
  todo:          { label: "Todo",        bg: "#EFF6FF", color: "#2563EB" },
  "in-progress": { label: "In Progress", bg: "#FFFBEB", color: "#D97706" },
  done:          { label: "Done",        bg: "#F0FDF4", color: "#16A34A" },
};

const PRIORITY_CFG: Record<PagePriority, { label: string; bg: string; color: string }> = {
  none:   { label: "Priority", bg: "#F5F4F1", color: "#9B9A97" },
  low:    { label: "Low",      bg: "#F0F9FF", color: "#0369A1" },
  medium: { label: "Medium",   bg: "#FFF7ED", color: "#C2410C" },
  high:   { label: "High",     bg: "#FFF1F2", color: "#BE123C" },
};

const PRESET_TAGS = ["design", "dev", "research", "important", "idea", "personal", "work", "urgent"];

function Pill<T extends string>({
  value, options, config, onChange,
}: {
  value: T;
  options: T[];
  config: Record<T, { label: string; bg: string; color: string }>;
  onChange: (v: T) => void;
}) {
  const [open, setOpen] = useState(false);
  const cfg = config[value];

  return (
    <div style={{ position: "relative" }}>
      <button
        className="pill"
        onClick={() => setOpen((v) => !v)}
        style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}22` }}
      >
        {cfg.label}
        <ChevronDown size={9} style={{ opacity: 0.6 }} />
      </button>
      {open && (
        <div style={{
          position: "absolute", top: 32, left: 0, zIndex: 40,
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.10)", overflow: "hidden", minWidth: 140,
        }}>
          {options.map((opt) => {
            const c = config[opt];
            return (
              <button
                key={opt}
                onClick={() => { onChange(opt); setOpen(false); }}
                style={{
                  display: "flex", alignItems: "center", gap: 10, width: "100%",
                  padding: "7px 12px", fontSize: 12, textAlign: "left", background: "transparent",
                  border: "none", cursor: "pointer", color: "var(--text)",
                  fontWeight: opt === value ? 600 : 400,
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--hover)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
              >
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: c.color, flexShrink: 0 }} />
                {c.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function PropertyPanel({ pageId }: { pageId: string }) {
  const { pages, addTag, removeTag, setStatus, setPriority } = usePageStore();
  const page = pages[pageId];
  const [tagInput, setTagInput] = useState("");

  if (!page) return null;

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag) { addTag(pageId, tag); setTagInput(""); }
  };

  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
      <Pill
        value={page.status}
        options={["none", "todo", "in-progress", "done"] as PageStatus[]}
        config={STATUS_CFG}
        onChange={(v) => setStatus(pageId, v)}
      />
      <Pill
        value={page.priority}
        options={["none", "low", "medium", "high"] as PagePriority[]}
        config={PRIORITY_CFG}
        onChange={(v) => setPriority(pageId, v)}
      />

      <div style={{ width: 1, height: 14, background: "var(--border)", margin: "0 4px" }} />

      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        <Tag size={11} style={{ color: "var(--text3)", flexShrink: 0 }} />
        {page.tags.map((tag) => (
          <span key={tag} className="tag-pill" style={{ background: "#EEF2FF", color: "#4F46E5", border: "1px solid #C7D2FE" }}>
            {tag}
            <button
              onClick={() => removeTag(pageId, tag)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", padding: 0, display: "flex" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#ef4444"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "inherit"; }}
            >
              <X size={9} />
            </button>
          </span>
        ))}
        {PRESET_TAGS.filter((t) => !page.tags.includes(t)).slice(0, 2).map((tag) => (
          <button
            key={tag}
            onClick={() => addTag(pageId, tag)}
            style={{
              fontSize: 11, color: "var(--text3)", background: "transparent",
              border: "1px dashed var(--border)", padding: "2px 8px", borderRadius: 999, cursor: "pointer",
              transition: "color 100ms, border-color 100ms",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.color = "#4F46E5";
              el.style.borderColor = "#a5b4fc";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.color = "var(--text3)";
              el.style.borderColor = "var(--border)";
            }}
          >
            + {tag}
          </button>
        ))}
        <input
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleAddTag(); }}
          placeholder="+ tag"
          style={{
            fontSize: 11, outline: "none", background: "transparent",
            border: "none", color: "var(--text2)", width: 48,
          }}
        />
      </div>
    </div>
  );
}
