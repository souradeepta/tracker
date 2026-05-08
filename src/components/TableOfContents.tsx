import { useEffect, useState } from "react";
import type { BlockNoteEditor } from "@blocknote/core";
import { List } from "lucide-react";

interface Heading {
  id: string;
  text: string;
  level: number;
}

function extractHeadings(editor: BlockNoteEditor): Heading[] {
  const headings: Heading[] = [];
  for (const block of editor.document) {
    if (
      block.type === "heading" &&
      Array.isArray(block.content) &&
      block.content.length > 0
    ) {
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
    <div className="hidden xl:flex flex-col w-72 flex-shrink-0 pt-14 px-8 pb-8 border-l border-black/[0.06] dark:border-white/[0.06]">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-[11px] font-semibold text-[#9B9A97] dark:text-[#6B6B6B] uppercase tracking-widest mb-2 hover:text-[#37352F] dark:hover:text-white transition-colors"
      >
        <List size={12} />
        On this page
      </button>
      {open && (
        <div className="flex flex-col gap-0.5">
          {headings.map((h) => (
            <button
              key={h.id}
              className="text-left text-[12px] text-[#9B9A97] dark:text-[#6B6B6B] hover:text-[#37352F] dark:hover:text-white truncate py-0.5 transition-colors"
              style={{ paddingLeft: `${(h.level - 1) * 10}px` }}
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
