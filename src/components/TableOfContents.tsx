import { useEffect, useState } from "react";
import type { BlockNoteEditor } from "@blocknote/core";
import { List } from "lucide-react";

interface Heading { id: string; text: string; level: number; }

function extractHeadings(editor: BlockNoteEditor): Heading[] {
  const headings: Heading[] = [];
  for (const block of editor.document) {
    if (block.type === "heading" && Array.isArray(block.content) && block.content.length > 0) {
      const text = (block.content as { text: string }[]).map((c) => c.text).join("");
      if (text.trim()) {
        headings.push({ id: block.id, text, level: (block.props as { level: number }).level ?? 1 });
      }
    }
  }
  return headings;
}

export function TableOfContents({ editor }: { editor: BlockNoteEditor }) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    setHeadings(extractHeadings(editor));
    return editor.onChange(() => setHeadings(extractHeadings(editor)));
  }, [editor]);

  if (headings.length === 0) return null;

  return (
    <div style={{
      display: "none",
      flexDirection: "column",
      width: 240,
      flexShrink: 0,
      paddingTop: 56,
      paddingLeft: 24,
      paddingRight: 24,
      paddingBottom: 24,
      borderLeft: "1px solid var(--border)",
    }}
    className="toc-panel"
    >
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex", alignItems: "center", gap: 6, fontSize: 11,
          fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em",
          color: "var(--text3)", background: "transparent", border: "none",
          cursor: "pointer", marginBottom: 8, padding: 0,
          transition: "color 100ms",
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--text)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--text3)"; }}
      >
        <List size={12} />
        On this page
      </button>
      {open && (
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {headings.map((h) => (
            <button
              key={h.id}
              className="toc-link"
              style={{ paddingLeft: (h.level - 1) * 10 }}
              onClick={() => {
                const el = document.querySelector(`[data-id="${h.id}"]`);
                el?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              {h.text}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
