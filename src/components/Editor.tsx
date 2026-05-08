import React, { useEffect, useRef, useState, useCallback } from "react";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import type { PartialBlock } from "@blocknote/core";
import {
  Lock, Clock, FileText, Layers, Search, Keyboard, LayoutGrid, Zap, Tag,
} from "lucide-react";
import { usePageStore } from "../store/pages";
import { useSettingsStore } from "../store/settings";
import { estimateReadingTime } from "../lib/readingTime";
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
        className="text-5xl hover:bg-[#37352F]/[0.06] dark:hover:bg-white/[0.05] rounded-xl p-1.5 transition-colors disabled:cursor-default"
        onClick={() => !locked && setOpen((v) => !v)}
        title={locked ? "Page is locked" : "Change icon"}
        disabled={locked}
      >
        {icon}
      </button>
      {open && !locked && (
        <div className="absolute top-16 left-0 z-50 bg-white dark:bg-[#252525] border border-[#E9E9E8] dark:border-[#2D2D2D] rounded-2xl shadow-2xl p-3 grid grid-cols-8 gap-1 w-72">
          {EMOJI_OPTIONS.map((e) => (
            <button
              key={e}
              className="text-xl hover:bg-[#37352F]/[0.06] dark:hover:bg-white/[0.05] rounded-xl p-1.5 transition-colors"
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
    <div className="flex items-center gap-3 text-[11px] text-[#9B9A97] dark:text-[#6B6B6B]">
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
      className="group flex flex-col items-start gap-2.5 p-5 rounded-2xl border border-[#E9E9E8] dark:border-[#2D2D2D] bg-white dark:bg-[#1F1F1F] hover:border-indigo-200 dark:hover:border-indigo-700 hover:shadow-md hover:shadow-black/5 transition-all text-left"
    >
      <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/20 transition-colors flex-shrink-0">
        {icon}
      </div>
      <div>
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-[13px] font-semibold text-[#37352F] dark:text-white">{title}</p>
          {shortcut && (
            <kbd className="text-[10px] font-mono bg-[#F4F3F0] dark:bg-[#2A2A2A] text-[#9B9A97] dark:text-[#6B6B6B] px-1.5 py-0.5 rounded border border-[#E9E9E8] dark:border-[#3A3A3A]">
              {shortcut}
            </kbd>
          )}
        </div>
        <p className="text-[12px] text-[#9B9A97] dark:text-[#6B6B6B] leading-snug">{desc}</p>
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
    <div className="flex-1 flex flex-col items-center justify-center bg-[#F4F3F0] dark:bg-[#141414] overflow-y-auto py-16 px-8">
      <div className="w-full max-w-xl">
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200/60 dark:shadow-indigo-900/30">
            <span className="text-white text-2xl font-bold">T</span>
          </div>
          <h1 className="text-[26px] font-bold text-[#37352F] dark:text-white tracking-tight mb-2">
            Welcome to Tracker
          </h1>
          <p className="text-[14px] text-[#9B9A97] dark:text-[#6B6B6B]">
            Your workspace for notes, tasks, and knowledge.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <FeatureCard icon={<FileText size={16} />} title="New page" desc="Create a blank page and start writing" shortcut="⌘N" onClick={onNew} />
          <FeatureCard icon={<Search size={16} />} title="Search" desc="Jump to any page instantly" shortcut="⌘K" onClick={onSearch} />
          <FeatureCard icon={<Layers size={16} />} title="Templates" desc="Start from a pre-built layout" shortcut="⌘⇧T" onClick={onTemplates} />
          <FeatureCard icon={<LayoutGrid size={16} />} title="Board view" desc="Track pages by status" shortcut="⌘⇧B" onClick={() => {}} />
        </div>

        <div className="bg-white dark:bg-[#1F1F1F] rounded-2xl border border-[#E9E9E8] dark:border-[#2D2D2D] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-[#F4F3F0] dark:border-[#2D2D2D]">
            <p className="text-[12px] font-semibold text-[#37352F] dark:text-white flex items-center gap-2">
              <Keyboard size={12} className="text-indigo-500" /> Keyboard shortcuts
            </p>
            <button onClick={onShortcuts} className="text-[11px] text-indigo-500 hover:text-indigo-700 dark:text-indigo-400 font-medium transition-colors">
              View all →
            </button>
          </div>
          <div className="grid grid-cols-2 gap-y-2 p-5">
            {[
              ["⌘ ⇧ F", "Focus mode"], ["⌘ ⇧ G", "Tag browser"],
              ["⌘ ⇧ D", "Dark mode"], ["/", "Insert block"],
              ["Right-click", "Page actions"], ["?", "All shortcuts"],
            ].map(([key, desc]) => (
              <div key={key} className="flex items-center justify-between gap-3 pr-4">
                <span className="text-[12px] text-[#9B9A97] dark:text-[#6B6B6B]">{desc}</span>
                <kbd className="text-[10px] font-mono bg-[#F4F3F0] dark:bg-[#2A2A2A] text-[#9B9A97] dark:text-[#6B6B6B] px-1.5 py-0.5 rounded border border-[#E9E9E8] dark:border-[#3A3A3A] flex-shrink-0">
                  {key}
                </kbd>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 space-y-1.5">
          {[
            { icon: <Zap size={11} />, text: "Type / on any page to insert headings, lists, and code blocks" },
            { icon: <Tag size={11} />, text: "Tag pages and use ⌘⇧G to browse related content" },
            { icon: <Lock size={11} />, text: "Lock a page from the toolbar to prevent accidental edits" },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-start gap-2.5 px-4 py-2.5 rounded-xl bg-white dark:bg-[#1F1F1F] border border-[#E9E9E8] dark:border-[#2D2D2D]">
              <span className="text-indigo-500 dark:text-indigo-400 mt-0.5 flex-shrink-0">{icon}</span>
              <p className="text-[12px] text-[#9B9A97] dark:text-[#6B6B6B]">{text}</p>
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
  const { pages, activePageId, updateTitle, updateContent } = usePageStore();
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
    <div className="flex-1 flex overflow-hidden bg-[#F4F3F0] dark:bg-[#141414]">
      {/* Scrollable document area */}
      <div className="flex-1 overflow-y-auto">
        <div className="min-h-full flex flex-col px-5 py-5">
          {/* Document island */}
          <div className="flex-1 bg-white dark:bg-[#252525] rounded-2xl border border-[#E9E9E8] dark:border-[#2D2D2D] shadow-sm overflow-hidden flex flex-col">
            <Cover pageId={activePage.id} cover={activePage.cover} />
            <PropertyPanel pageId={activePage.id} />

            {/* Content */}
            <div className="flex-1 px-14 pt-8 pb-24 max-w-3xl w-full mx-auto">
              <div className="mb-2 flex items-end gap-3">
                <IconPicker icon={activePage.icon} pageId={activePage.id} locked={activePage.locked} />
                {activePage.locked && (
                  <span className="mb-2 flex items-center gap-1 text-[11px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-700/40 font-medium">
                    <Lock size={9} /> Locked
                  </span>
                )}
              </div>

              <textarea
                ref={titleRef}
                className="w-full text-[38px] font-bold text-[#37352F] dark:text-white resize-none border-none outline-none bg-transparent
                  placeholder-[#E4E3DF] dark:placeholder-[#3A3A3A] leading-tight mb-3 overflow-hidden tracking-tight"
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

            {/* Footer */}
            <div className="flex items-center justify-between px-14 py-3 border-t border-[#F4F3F0] dark:border-[#2D2D2D] max-w-3xl w-full mx-auto">
              <WordCount editor={editor} />
              <span className="text-[11px] text-[#C4C3BF] dark:text-[#444444]">
                Updated {new Date(activePage.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      <TableOfContents editor={editor} />
    </div>
  );
}
