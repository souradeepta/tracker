import React, { useEffect, useRef, useState, useCallback } from "react";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import type { PartialBlock } from "@blocknote/core";
import {
  Lock, Unlock, Clock, FileText, Layers, Search, Keyboard,
  LayoutGrid, Zap, Tag,
} from "lucide-react";
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
        className="text-5xl hover:bg-gray-100 dark:hover:bg-white/[0.05] rounded-xl p-1.5 transition-colors disabled:cursor-default"
        onClick={() => !locked && setOpen((v) => !v)}
        title={locked ? "Page is locked" : "Change icon"}
        disabled={locked}
      >
        {icon}
      </button>
      {open && !locked && (
        <div className="absolute top-16 left-0 z-50 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl p-3 grid grid-cols-8 gap-1 w-72">
          {EMOJI_OPTIONS.map((e) => (
            <button
              key={e}
              className="text-xl hover:bg-gray-100 dark:hover:bg-white/[0.06] rounded-xl p-1.5 transition-colors"
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
    <div className="flex items-center gap-3 text-[11px] text-gray-400 dark:text-gray-600">
      <span>{count} {count === 1 ? "word" : "words"}</span>
      <span className="flex items-center gap-1"><Clock size={10} /> {readingMins} min read</span>
    </div>
  );
}

// ─── Feature card in empty state ─────────────────────────────────────────────
function FeatureCard({
  icon, title, desc, shortcut, onClick,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  shortcut?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-start gap-2 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md hover:shadow-indigo-100 dark:hover:shadow-indigo-900/20 transition-all text-left"
    >
      <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/20 transition-colors">
        {icon}
      </div>
      <div>
        <div className="flex items-center gap-2">
          <p className="text-[13px] font-semibold text-gray-900 dark:text-gray-100">{title}</p>
          {shortcut && (
            <kbd className="text-[10px] font-mono bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 px-1.5 py-0.5 rounded-lg border border-gray-200 dark:border-gray-700">
              {shortcut}
            </kbd>
          )}
        </div>
        <p className="text-[12px] text-gray-400 dark:text-gray-500 mt-0.5">{desc}</p>
      </div>
    </button>
  );
}

// ─── Empty state ─────────────────────────────────────────────────────────────
function EmptyState({
  onNew, onSearch, onTemplates, onShortcuts,
}: {
  onNew: () => void;
  onSearch: () => void;
  onTemplates: () => void;
  onShortcuts: () => void;
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-gray-50/30 dark:bg-[#0F0F0F] overflow-y-auto py-12 px-6">
      <div className="w-full max-w-2xl">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40">
            <span className="text-white text-3xl font-bold">T</span>
          </div>
          <h1 className="text-[28px] font-bold text-gray-900 dark:text-white tracking-tight mb-2">
            Welcome to Tracker
          </h1>
          <p className="text-[15px] text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            Your all-in-one workspace for notes, tasks, and knowledge.
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <FeatureCard
            icon={<FileText size={18} />}
            title="New page"
            desc="Create a blank page and start writing"
            shortcut="⌘N"
            onClick={onNew}
          />
          <FeatureCard
            icon={<Search size={18} />}
            title="Search"
            desc="Jump to any page instantly"
            shortcut="⌘K"
            onClick={onSearch}
          />
          <FeatureCard
            icon={<Layers size={18} />}
            title="Templates"
            desc="Start from a meeting, project, or daily note"
            shortcut="⌘⇧T"
            onClick={onTemplates}
          />
          <FeatureCard
            icon={<LayoutGrid size={18} />}
            title="Board view"
            desc="Manage pages by status on a Kanban board"
            shortcut="⌘⇧B"
            onClick={() => {}}
          />
        </div>

        {/* Shortcut reference */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/40 overflow-hidden mb-6">
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-800">
            <p className="text-[12px] font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Keyboard size={13} className="text-indigo-500" />
              Keyboard shortcuts
            </p>
            <button
              onClick={onShortcuts}
              className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
            >
              View all →
            </button>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 p-5">
            {[
              ["⌘ ⇧ F", "Focus mode"],
              ["⌘ ⇧ G", "Tag browser"],
              ["⌘ ⇧ D", "Dark mode"],
              ["/", "Insert block"],
              ["Right-click", "Page actions"],
              ["?", "All shortcuts"],
            ].map(([key, desc]) => (
              <div key={key} className="flex items-center justify-between gap-2">
                <span className="text-[12px] text-gray-500 dark:text-gray-400">{desc}</span>
                <kbd className="text-[10px] font-mono bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-lg border border-gray-200 dark:border-gray-700 flex-shrink-0">
                  {key}
                </kbd>
              </div>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-600 px-1">Tips</p>
          {[
            { icon: <Zap size={11} />, text: "Type / inside any page to insert headings, lists, code blocks, and more" },
            { icon: <Tag size={11} />, text: "Add tags to pages and browse them with ⌘⇧G to find related content" },
            { icon: <Lock size={11} />, text: "Lock a page from the footer to prevent accidental edits" },
            { icon: <LayoutGrid size={11} />, text: "Set status on pages (Todo, In Progress, Done) and track them on the Board" },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-start gap-2.5 px-3 py-2 rounded-xl bg-white dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800/50">
              <span className="text-indigo-500 dark:text-indigo-400 mt-0.5 flex-shrink-0">{icon}</span>
              <p className="text-[12px] text-gray-500 dark:text-gray-400">{text}</p>
            </div>
          ))}
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
    { initialContent: activePage?.content?.length ? (activePage.content as PartialBlock[]) : undefined },
    [activePageId]
  );

  useEffect(() => { setLocalTitle(activePage?.title ?? ""); }, [activePageId]);

  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.style.height = "auto";
      titleRef.current.style.height = `${titleRef.current.scrollHeight}px`;
    }
  }, [localTitle]);

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setLocalTitle(val);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => { if (activePageId) updateTitle(activePageId, val); }, 300);
  }, [activePageId, updateTitle]);

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
    <div className="flex-1 flex overflow-hidden bg-white dark:bg-[#0F0F0F]">
      <div className="flex-1 flex flex-col overflow-hidden">
        <Cover pageId={activePage.id} cover={activePage.cover} />
        <PropertyPanel pageId={activePage.id} />

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-16 pt-8 pb-32">
            <Breadcrumbs pageId={activePage.id} />

            <div className="mb-1 mt-2 flex items-end gap-3">
              <IconPicker icon={activePage.icon} pageId={activePage.id} locked={activePage.locked} />
              {activePage.locked && (
                <span className="mb-2 flex items-center gap-1 text-[11px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-700/40 font-medium">
                  <Lock size={9} /> Locked
                </span>
              )}
            </div>

            <textarea
              ref={titleRef}
              className="w-full text-[40px] font-bold text-gray-900 dark:text-gray-50 resize-none border-none outline-none bg-transparent
                placeholder-gray-200 dark:placeholder-gray-800 leading-tight mb-4 overflow-hidden tracking-tight"
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
        <div className="flex items-center justify-between px-16 py-2.5 border-t border-gray-100 dark:border-gray-800/60">
          <WordCount editor={editor} />
          <div className="flex items-center gap-4">
            <span className="text-[11px] text-gray-300 dark:text-gray-700">
              Updated {new Date(activePage.updatedAt).toLocaleDateString()}
            </span>
            <button
              onClick={() => activePageId && toggleLocked(activePageId)}
              className="text-[11px] text-gray-400 dark:text-gray-600 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1 transition-colors"
              title={activePage.locked ? "Unlock page" : "Lock page"}
            >
              {activePage.locked ? <Unlock size={11} /> : <Lock size={11} />}
              {activePage.locked ? "Unlock" : "Lock"}
            </button>
            <button
              onClick={() => onExport(activePage.id)}
              className="text-[11px] text-gray-400 dark:text-gray-600 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Export .md
            </button>
          </div>
        </div>
      </div>

      <TableOfContents editor={editor} />
    </div>
  );
}
