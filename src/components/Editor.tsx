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
        className="text-5xl hover:bg-black/[0.04] dark:hover:bg-white/[0.04] rounded-xl p-2 -ml-2 transition-colors disabled:cursor-default"
        onClick={() => !locked && setOpen((v) => !v)}
        title={locked ? "Page is locked" : "Change icon"}
        disabled={locked}
      >
        {icon}
      </button>
      {open && !locked && (
        <div className="absolute top-16 left-0 z-50 bg-white dark:bg-[#1E1E1E] border border-black/[0.08] dark:border-white/[0.08] rounded-2xl shadow-xl p-3 grid grid-cols-8 gap-1 w-72">
          {EMOJI_OPTIONS.map((e) => (
            <button
              key={e}
              className="text-xl hover:bg-black/[0.04] dark:hover:bg-white/[0.04] rounded-lg p-1.5 transition-colors"
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
    <div className="flex items-center gap-3 text-[12px] text-[#9B9A97] dark:text-[#666666]">
      <span>{count} {count === 1 ? "word" : "words"}</span>
      <span className="flex items-center gap-1.5"><Clock size={11} /> {readingMins} min read</span>
    </div>
  );
}

// ─── Feature card ─────────────────────────────────────────────────────────────
function FeatureCard({ icon, title, desc, shortcut, onClick }: {
  icon: React.ReactNode; title: string; desc: string; shortcut?: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col gap-3 p-5 rounded-2xl border border-black/[0.06] dark:border-white/[0.06] bg-white dark:bg-[#1A1A1A] hover:border-indigo-200 dark:hover:border-indigo-700/60 hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all text-left"
    >
      <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform flex-shrink-0">
        {icon}
      </div>
      <div>
        <div className="flex items-center gap-2 mb-1">
          <p className="text-[13px] font-semibold text-[#1A1A1A] dark:text-white">{title}</p>
          {shortcut && (
            <kbd className="text-[10px] font-mono bg-[#F5F4F1] dark:bg-[#252525] text-[#9B9A97] dark:text-[#666666] px-1.5 py-0.5 rounded border border-black/[0.06] dark:border-white/[0.06]">
              {shortcut}
            </kbd>
          )}
        </div>
        <p className="text-[12px] text-[#9B9A97] dark:text-[#666666] leading-relaxed">{desc}</p>
      </div>
    </button>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ onNew, onSearch, onTemplates, onShortcuts }: {
  onNew: () => void; onSearch: () => void; onTemplates: () => void; onShortcuts: () => void;
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#F5F4F1] dark:bg-[#111111] overflow-y-auto">
      <div className="w-full max-w-[560px] px-8 py-16">
        <div className="text-center mb-12">
          <div className="w-14 h-14 rounded-[18px] bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mx-auto mb-5 shadow-[0_8px_24px_rgba(99,102,241,0.3)]">
            <span className="text-white text-2xl font-bold">T</span>
          </div>
          <h1 className="text-[28px] font-bold text-[#1A1A1A] dark:text-white tracking-[-0.5px] mb-2">Welcome to Tracker</h1>
          <p className="text-[14px] text-[#9B9A97] dark:text-[#666666] leading-relaxed">Your workspace for notes, tasks, and knowledge.</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <FeatureCard icon={<FileText size={16} />} title="New page" desc="Start writing instantly" shortcut="⌘N" onClick={onNew} />
          <FeatureCard icon={<Search size={16} />} title="Search" desc="Find anything fast" shortcut="⌘K" onClick={onSearch} />
          <FeatureCard icon={<Layers size={16} />} title="Templates" desc="Start from a layout" shortcut="⌘⇧T" onClick={onTemplates} />
          <FeatureCard icon={<LayoutGrid size={16} />} title="Board view" desc="Visualize your work" shortcut="⌘⇧B" onClick={() => {}} />
        </div>

        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-black/[0.06] dark:border-white/[0.06] overflow-hidden mb-4">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-black/[0.04] dark:border-white/[0.04]">
            <p className="text-[12px] font-semibold text-[#1A1A1A] dark:text-white flex items-center gap-2">
              <Keyboard size={12} className="text-indigo-500" /> Keyboard shortcuts
            </p>
            <button onClick={onShortcuts} className="text-[11px] text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors">
              View all →
            </button>
          </div>
          <div className="grid grid-cols-2 gap-y-0 divide-y divide-black/[0.03] dark:divide-white/[0.03]">
            {[
              ["⌘⇧F", "Focus mode"], ["⌘⇧G", "Tag browser"],
              ["⌘⇧D", "Dark mode"], ["/", "Insert block"],
              ["Right-click", "Page actions"], ["?", "All shortcuts"],
            ].map(([key, desc], i) => (
              <div key={key} className={`flex items-center justify-between px-5 py-2.5 ${i % 2 === 0 ? "" : "border-l border-black/[0.03] dark:border-white/[0.03]"}`}>
                <span className="text-[12px] text-[#6B6B6B] dark:text-[#888888]">{desc}</span>
                <kbd className="text-[10px] font-mono bg-[#F5F4F1] dark:bg-[#252525] text-[#9B9A97] dark:text-[#666666] px-1.5 py-0.5 rounded border border-black/[0.06] dark:border-white/[0.06]">
                  {key}
                </kbd>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {[
            { icon: <Zap size={11} />, text: "Type / on any page to insert headings, lists, and code blocks" },
            { icon: <Tag size={11} />, text: "Tag pages and use ⌘⇧G to browse related content" },
            { icon: <Lock size={11} />, text: "Lock a page from the toolbar to prevent accidental edits" },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white dark:bg-[#1A1A1A] border border-black/[0.06] dark:border-white/[0.06]">
              <span className="text-indigo-500 dark:text-indigo-400 flex-shrink-0">{icon}</span>
              <p className="text-[12px] text-[#6B6B6B] dark:text-[#888888]">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Editor ──────────────────────────────────────────────────────────────
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
    <div className="flex-1 flex overflow-hidden bg-[#F5F4F1] dark:bg-[#111111]">
      {/* Scrollable document area */}
      <div className="flex-1 overflow-y-auto">
        <div className="min-h-full flex flex-col p-6">
          {/* Document island card */}
          <div className="flex-1 max-w-[900px] w-full mx-auto bg-white dark:bg-[#1E1E1E] rounded-2xl border border-black/[0.07] dark:border-white/[0.07] shadow-[0_2px_12px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col">

            <Cover pageId={activePage.id} cover={activePage.cover} />
            <PropertyPanel pageId={activePage.id} />

            {/* Page content */}
            <div className="flex-1 px-20 pt-10 pb-28">
              <div className="mb-3 flex items-end gap-3">
                <IconPicker icon={activePage.icon} pageId={activePage.id} locked={activePage.locked} />
                {activePage.locked && (
                  <span className="mb-2 flex items-center gap-1.5 text-[11px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1 rounded-full border border-amber-200/60 dark:border-amber-700/40 font-medium">
                    <Lock size={9} /> Locked
                  </span>
                )}
              </div>

              <textarea
                ref={titleRef}
                className="w-full text-[38px] font-bold text-[#1A1A1A] dark:text-white resize-none border-none outline-none bg-transparent
                  placeholder-black/10 dark:placeholder-white/10 leading-[1.2] mb-6 overflow-hidden tracking-[-0.5px]"
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
            <div className="border-t border-black/[0.04] dark:border-white/[0.04]">
              <div className="flex items-center justify-between px-20 py-3.5">
                <WordCount editor={editor} />
                <span className="text-[12px] text-[#C4C3BF] dark:text-[#444444]">
                  Updated {new Date(activePage.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>

      <TableOfContents editor={editor} />
    </div>
  );
}
