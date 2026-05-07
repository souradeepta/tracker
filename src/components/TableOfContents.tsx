import React, { useEffect, useState } from "react";
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
    <div className="hidden xl:flex flex-col w-52 flex-shrink-0 pt-16 px-4 border-l border-gray-100 dark:border-neutral-800">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-neutral-400 uppercase tracking-wide mb-2 hover:text-gray-700"
      >
        <List size={12} />
        On this page
      </button>
      {open && (
        <div className="flex flex-col gap-0.5">
          {headings.map((h) => (
            <button
              key={h.id}
              className="text-left text-xs text-gray-500 dark:text-neutral-400 hover:text-gray-800 dark:hover:text-neutral-100 truncate py-0.5 transition-colors"
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
