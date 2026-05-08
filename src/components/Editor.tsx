import React, { useEffect, useRef, useState, useCallback } from "react";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import type { PartialBlock } from "@blocknote/core";
import { Lock, Unlock, Clock, FileText, Layers, Search, Keyboard } from "lucide-react";
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
        className="text-5xl hover:bg-[#37352F]/[0.06] dark:hover:bg-white/[0.06] rounded-lg p-1.5 transition-colors disabled:cursor-default"
        onClick={() => !locked && setOpen((v) => !v)}
        title={locked ? "Page is locked" : "Change icon"}
        disabled={locked}
      >
        {icon}
      </button>
      {open && !locked && (
        <div className="absolute top-16 left-0 z-50 bg-white dark:bg-[#1f1f1f] border border-[#37352F]/10 dark:border-white/10 rounded-xl shadow-2xl p-3 grid grid-cols-8 gap-1 w-72">
          {EMOJI_OPTIONS.map((e) => (
            <button
              key={e}
              className="text-xl hover:bg-[#37352F]/[0.06] dark:hover:bg-white/[0.06] rounded-lg p-1.5 transition-colors"
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
    <div className="flex items-center gap-3 text-[12px] text-[#37352F]/35 dark:text-white/25">
      <span>{count} {count === 1 ? "word" : "words"}</span>
      <span className="flex items-center gap-1">
        <Clock size={10} /> {readingMins} min read
      </span>
    </div>
  );
}

// ─── Empty state shown when no page is selected ──────────────────────────────
function EmptyState({
  onNew,
  onSearch,
  onTemplates,
  onShortcuts,
}: {
  onNew: () => void;
  onSearch: () => void;
  onTemplates: () => void;
  onShortcuts: () => void;
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-[#191919] px-8 select-none">
      <div className="w-full max-w-lg text-center">
        {/* Logo */}
        <div className="w-14 h-14 rounded-2xl bg-[#37352F] dark:bg-white flex items-center justify-center mx-auto mb-5 shadow-lg">
          <span className="text-white dark:text-[#191919] text-2xl font-bold">T</span>
        </div>
        <h1 className="text-[22px] font-semibold text-[#37352F] dark:text-white mb-1">Tracker</h1>
        <p className="text-[13px] text-[#37352F]/50 dark:text-white/40 mb-8">
          Your personal knowledge workspace
        </p>

        {/* Quick actions */}
        <div className="flex gap-3 justify-center mb-10">
          <button
            onClick={onNew}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#37352F] dark:bg-white text-white dark:text-[#191919] text-[13px] font-medium hover:bg-[#37352F]/90 dark:hover:bg-white/90 transition-colors shadow-sm"
          >
            <FileText size={14} />
            New page
            <kbd className="ml-1 text-[10px] opacity-60 font-mono">⌘N</kbd>
          </button>
          <button
            onClick={onSearch}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#37352F]/15 dark:border-white/15 bg-white dark:bg-white/[0.06] text-[#37352F]/70 dark:text-white/70 text-[13px] font-medium hover:bg-[#37352F]/[0.04] dark:hover:bg-white/[0.1] transition-colors"
          >
            <Search size={14} />
            Search
            <kbd className="ml-1 text-[10px] opacity-60 font-mono">⌘K</kbd>
          </button>
          <button
            onClick={onTemplates}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#37352F]/15 dark:border-white/15 bg-white dark:bg-white/[0.06] text-[#37352F]/70 dark:text-white/70 text-[13px] font-medium hover:bg-[#37352F]/[0.04] dark:hover:bg-white/[0.1] transition-colors"
          >
            <Layers size={14} />
            Templates
          </button>
        </div>

        {/* Shortcut reference */}
        <div className="bg-[#F7F6F3] dark:bg-white/[0.04] rounded-2xl p-5 text-left mb-6 border border-[#37352F]/[0.06] dark:border-white/[0.06]">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#37352F]/40 dark:text-white/30 mb-3">
            Keyboard shortcuts
          </p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            {[
              ["⌘ N", "New page"],
              ["⌘ K", "Search"],
              ["⌘ ⇧ F", "Focus mode"],
              ["⌘ ⇧ B", "Board view"],
              ["⌘ ⇧ T", "Templates"],
              ["⌘ ⇧ G", "Tag browser"],
              ["⌘ ⇧ D", "Dark mode"],
              ["/", "Block commands"],
            ].map(([key, desc]) => (
              <div key={key} className="flex items-center justify-between gap-2">
                <span className="text-[12px] text-[#37352F]/60 dark:text-white/50">{desc}</span>
                <kbd className="text-[10px] font-mono text-[#37352F]/50 dark:text-white/40 bg-white dark:bg-white/[0.08] border border-[#37352F]/12 dark:border-white/12 rounded px-1.5 py-0.5 flex-shrink-0">
                  {key}
                </kbd>
              </div>
            ))}
          </div>
          <button
            onClick={onShortcuts}
            className="mt-3 flex items-center gap-1.5 text-[11px] text-[#37352F]/40 dark:text-white/30 hover:text-[#37352F]/70 dark:hover:text-white/60 transition-colors"
          >
            <Keyboard size={11} />
            View all shortcuts
          </button>
        </div>

        {/* Tips */}
        <div className="text-left">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#37352F]/40 dark:text-white/30 mb-2">
            Tips
          </p>
          <ul className="space-y-1.5">
            {[
              "Type / inside any page to insert headings, lists, code blocks, and more.",
              "Right-click any page in the sidebar to duplicate, favorite, or lock it.",
              "Click the emoji icon on a page to change it. Hover the top of a page to add a cover.",
              "Set status and priority on pages, then switch to Board view to manage them.",
              "Use tags to organise pages across topics — browse them with ⌘⇧G.",
            ].map((tip) => (
              <li key={tip} className="flex items-start gap-2 text-[12px] text-[#37352F]/55 dark:text-white/40">
                <span className="text-[#37352F]/25 dark:text-white/20 mt-0.5 flex-shrink-0">→</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// ─── Main Editor ─────────────────────────────────────────────────────────────
interface EditorProps {
  onExport: (id: string) => void;
  onNew?: () => void;
  onSearch?: () => void;
  onTemplates?: () => void;
  onShortcuts?: () => void;
}

export function Editor({ onExport, onNew, onSearch, onTemplates, onShortcuts }: EditorProps) {
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
      <EmptyState
        onNew={onNew ?? (() => {})}
        onSearch={onSearch ?? (() => {})}
        onTemplates={onTemplates ?? (() => {})}
        onShortcuts={onShortcuts ?? (() => {})}
      />
    );
  }

  return (
    <div className="flex-1 flex overflow-hidden bg-white dark:bg-[#191919]">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Cover */}
        <Cover pageId={activePage.id} cover={activePage.cover} />

        {/* Property panel */}
        <PropertyPanel pageId={activePage.id} />

        {/* Page body */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-16 pt-8 pb-32">
            <Breadcrumbs pageId={activePage.id} />

            <div className="mb-1 mt-2 flex items-end gap-3">
              <IconPicker icon={activePage.icon} pageId={activePage.id} locked={activePage.locked} />
              {activePage.locked && (
                <span className="mb-2 flex items-center gap-1 text-[11px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-700/40">
                  <Lock size={9} /> Locked
                </span>
              )}
            </div>

            <textarea
              ref={titleRef}
              className="w-full text-[40px] font-bold text-[#37352F] dark:text-white/90 resize-none border-none outline-none bg-transparent
                placeholder-[#37352F]/20 dark:placeholder-white/15 leading-tight mb-4 overflow-hidden tracking-tight"
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
        <div className="flex items-center justify-between px-16 py-2 border-t border-[#37352F]/[0.08] dark:border-white/[0.08]">
          <WordCount editor={editor} />
          <div className="flex items-center gap-4">
            <span className="text-[12px] text-[#37352F]/30 dark:text-white/25">
              Updated {new Date(activePage.updatedAt).toLocaleDateString()}
            </span>
            <button
              onClick={() => activePageId && toggleLocked(activePageId)}
              className="text-[12px] text-[#37352F]/35 dark:text-white/30 hover:text-[#37352F]/70 dark:hover:text-white/70 flex items-center gap-1 transition-colors"
              title={activePage.locked ? "Unlock page" : "Lock page"}
            >
              {activePage.locked ? <Unlock size={11} /> : <Lock size={11} />}
              {activePage.locked ? "Unlock" : "Lock"}
            </button>
            <button
              onClick={() => onExport(activePage.id)}
              className="text-[12px] text-[#37352F]/35 dark:text-white/30 hover:text-[#37352F]/70 dark:hover:text-white/70 transition-colors"
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
