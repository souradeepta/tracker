import React, { useEffect, useRef, useState, useCallback } from "react";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import type { PartialBlock } from "@blocknote/core";
import { Lock, Unlock, Clock } from "lucide-react";
import { usePageStore } from "../store/pages";
import { useSettingsStore } from "../store/settings";
import { estimateReadingTime } from "../lib/readingTime";
import { Breadcrumbs } from "./Breadcrumbs";
import { Cover } from "./Cover";
import { TableOfContents } from "./TableOfContents";
import { PropertyPanel } from "./PropertyPanel";

const EMOJI_OPTIONS = [
  "📄","📝","📌","🗒️","📋","🔖","💡","🎯","📚","🗂️","🏠","⭐","🔥","✅","💼",
  "🎨","🚀","🌟","📊","🔍","💬","🎵","🌈","🍀","🏆","💎","🧠","❤️","🌍","🔧",
  "🛠️","📅","⚡","🎪","🧩","🔑","🎓","🏋️","🎭","🦋",
];

function IconPicker({ icon, pageId, locked }: { icon: string; pageId: string; locked: boolean }) {
  const [open, setOpen] = useState(false);
  const { updateIcon } = usePageStore();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        className="text-5xl hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg p-1 transition-colors disabled:cursor-default"
        onClick={() => !locked && setOpen((v) => !v)}
        title={locked ? "Page is locked" : "Change icon"}
        disabled={locked}
      >
        {icon}
      </button>
      {open && !locked && (
        <div className="absolute top-16 left-0 z-50 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl shadow-xl p-3 grid grid-cols-8 gap-1 w-72">
          {EMOJI_OPTIONS.map((e) => (
            <button
              key={e}
              className="text-xl hover:bg-gray-100 dark:hover:bg-neutral-800 rounded p-1 transition-colors"
              onClick={() => { updateIcon(pageId, e); setOpen(false); }}
            >
              {e}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function WordCount({ editor }: { editor: ReturnType<typeof useCreateBlockNote> }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const calc = () => {
      const text = editor.document
        .map((b: { content?: unknown }) => Array.isArray(b.content) ? (b.content as { text: string }[]).map((c) => c.text).join(" ") : "")
        .join(" ");
      setCount(text.trim() ? text.trim().split(/\s+/).length : 0);
    };
    calc();
    return editor.onChange(calc);
  }, [editor]);
  const readingMins = estimateReadingTime(count);
  return (
    <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-neutral-600">
      <span>{count} {count === 1 ? "word" : "words"}</span>
      <span className="flex items-center gap-1">
        <Clock size={10} /> {readingMins} min read
      </span>
    </div>
  );
}

export function Editor({ onExport }: { onExport: (id: string) => void }) {
  const { pages, activePageId, updateTitle, updateContent, toggleLocked } = usePageStore();
  const { dark } = useSettingsStore();
  const activePage = activePageId ? pages[activePageId] : null;

  const [localTitle, setLocalTitle] = useState(activePage?.title ?? "");
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const editor = useCreateBlockNote(
    {
      initialContent: activePage?.content?.length ? (activePage.content as PartialBlock[]) : undefined,
    },
    [activePageId]
  );

  useEffect(() => { setLocalTitle(activePage?.title ?? ""); }, [activePageId]);

  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.style.height = "auto";
      titleRef.current.style.height = `${titleRef.current.scrollHeight}px`;
    }
  }, [localTitle]);

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const val = e.target.value;
      setLocalTitle(val);
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => { if (activePageId) updateTitle(activePageId, val); }, 300);
    },
    [activePageId, updateTitle]
  );

  const handleEditorChange = useCallback(() => {
    if (!activePageId || activePage?.locked) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      updateContent(activePageId, editor.document as PartialBlock[]);
    }, 500);
  }, [activePageId, activePage?.locked, editor, updateContent]);

  if (!activePage) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-neutral-950">
        <div className="text-center text-gray-400 dark:text-neutral-600">
          <div className="text-6xl mb-4">📄</div>
          <p className="text-lg font-medium text-gray-600 dark:text-neutral-400">Select or create a page</p>
          <p className="text-sm mt-1">Choose a page from the sidebar to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex overflow-hidden bg-white dark:bg-neutral-950">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Cover */}
        <Cover pageId={activePage.id} cover={activePage.cover} />

        {/* Property panel */}
        <PropertyPanel pageId={activePage.id} />

        {/* Page body */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-16 pt-8 pb-32">
            <Breadcrumbs pageId={activePage.id} />

            <div className="mb-2 mt-2 flex items-end gap-3">
              <IconPicker icon={activePage.icon} pageId={activePage.id} locked={activePage.locked} />
              {activePage.locked && (
                <span className="mb-2 flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded-full">
                  <Lock size={10} /> Locked
                </span>
              )}
            </div>

            <textarea
              ref={titleRef}
              className="w-full text-4xl font-bold text-gray-900 dark:text-neutral-50 resize-none border-none outline-none bg-transparent
                placeholder-gray-300 dark:placeholder-neutral-700 leading-tight mb-4 overflow-hidden"
              placeholder="Untitled"
              value={localTitle}
              onChange={handleTitleChange}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); editor.focus(); } }}
              rows={1}
              readOnly={activePage.locked}
            />

            <BlockNoteView
              editor={editor}
              theme={dark ? "dark" : "light"}
              onChange={handleEditorChange}
              editable={!activePage.locked}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-16 py-2 border-t border-gray-100 dark:border-neutral-800">
          <WordCount editor={editor} />
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 dark:text-neutral-600">
              Updated {new Date(activePage.updatedAt).toLocaleDateString()}
            </span>
            <button
              onClick={() => activePageId && toggleLocked(activePageId)}
              className="text-xs text-gray-400 dark:text-neutral-600 hover:text-gray-700 dark:hover:text-neutral-300 flex items-center gap-1 transition-colors"
              title={activePage.locked ? "Unlock page" : "Lock page"}
            >
              {activePage.locked ? <Unlock size={11} /> : <Lock size={11} />}
              {activePage.locked ? "Unlock" : "Lock"}
            </button>
            <button
              onClick={() => onExport(activePage.id)}
              className="text-xs text-gray-400 dark:text-neutral-600 hover:text-gray-700 dark:hover:text-neutral-300 transition-colors"
            >
              Export .md
            </button>
          </div>
        </div>
      </div>

      {/* Table of contents */}
      <TableOfContents editor={editor} />
    </div>
  );
}
