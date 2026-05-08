import React, { useEffect, useRef, useState, useCallback } from "react";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import type { PartialBlock } from "@blocknote/core";
import { Lock, Clock, FileText, Search, Layers } from "lucide-react";
import { usePageStore } from "../store/pages";
import { useSettingsStore } from "../store/settings";
import { estimateReadingTime } from "../lib/readingTime";
import { Cover, COVERS } from "./Cover";
import { TableOfContents } from "./TableOfContents";
import { PropertyPanel } from "./PropertyPanel";
import type { Page } from "../types";

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

// ─── Time helper ──────────────────────────────────────────────────────────────
function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ─── Home Dashboard ───────────────────────────────────────────────────────────
function HomeDashboard({ pages, recentPageIds, onNew, onSearch, onTemplates }: {
  pages: Record<string, Page>;
  recentPageIds: string[];
  onNew: () => void;
  onSearch: () => void;
  onTemplates: () => void;
}) {
  const { setActive } = usePageStore();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const recent = recentPageIds
    .map((id) => pages[id])
    .filter((p): p is Page => !!p && !p.deleted)
    .slice(0, 6);

  return (
    <div className="flex-1 overflow-y-auto bg-white dark:bg-[#191919]">
      <div className="max-w-[860px] mx-auto px-[120px] pt-24 pb-24">
        <h1 className="text-[32px] font-bold text-[#1A1A1A] dark:text-white tracking-[-0.5px] mb-10">
          {greeting}
        </h1>

        {recent.length > 0 && (
          <section className="mb-10">
            <p className="text-[11px] font-semibold text-[#9B9A97] dark:text-[#555] uppercase tracking-[0.08em] mb-3 flex items-center gap-1.5">
              <Clock size={11} /> Recently visited
            </p>
            <div className="grid grid-cols-3 gap-3">
              {recent.map((page) => {
                const coverGrad = page.cover ? COVERS[page.cover] : null;
                return (
                  <button
                    key={page.id}
                    onClick={() => setActive(page.id)}
                    className="text-left border border-black/[0.07] dark:border-white/[0.07] rounded-xl overflow-hidden hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all bg-white dark:bg-[#1E1E1E]"
                  >
                    <div
                      className="h-[72px]"
                      style={coverGrad ? { background: coverGrad } : { background: "#F5F4F1" }}
                    >
                      {!coverGrad && (
                        <div className="h-full flex items-center justify-center text-3xl opacity-30 dark:opacity-20">
                          {page.icon}
                        </div>
                      )}
                    </div>
                    <div className="px-3.5 py-3">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[13px] leading-none">{page.icon}</span>
                        <p className="text-[13px] font-semibold text-[#1A1A1A] dark:text-white truncate">
                          {page.title || "Untitled"}
                        </p>
                      </div>
                      <p className="text-[11px] text-[#9B9A97] dark:text-[#555]">{timeAgo(page.updatedAt)}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        <section>
          <p className="text-[11px] font-semibold text-[#9B9A97] dark:text-[#555] uppercase tracking-[0.08em] mb-3">
            Quick actions
          </p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: <FileText size={15} />, title: "New page", desc: "Start writing instantly", action: onNew },
              { icon: <Search size={15} />, title: "Search", desc: "Find anything fast", action: onSearch },
              { icon: <Layers size={15} />, title: "Templates", desc: "Start from a layout", action: onTemplates },
            ].map(({ icon, title, desc, action }) => (
              <button
                key={title}
                onClick={action}
                className="flex items-center gap-3 p-4 rounded-xl border border-black/[0.07] dark:border-white/[0.07] bg-white dark:bg-[#1E1E1E] hover:border-indigo-200 dark:hover:border-indigo-700/60 hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all text-left group"
              >
                <div className="w-8 h-8 rounded-lg bg-[#F5F4F1] dark:bg-white/[0.05] flex items-center justify-center text-[#5E5C58] dark:text-white/60 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/10 transition-colors flex-shrink-0">
                  {icon}
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[#1A1A1A] dark:text-white">{title}</p>
                  <p className="text-[11px] text-[#9B9A97] dark:text-[#555] leading-relaxed">{desc}</p>
                </div>
              </button>
            ))}
          </div>
        </section>
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

export function Editor({ onExport: _onExport, onNew, onSearch, onTemplates }: EditorProps) {
  const { pages, activePageId, recentPageIds, updateTitle, updateDescription, updateContent } = usePageStore();
  const { dark } = useSettingsStore();
  const activePage = activePageId ? pages[activePageId] : null;

  const [localTitle, setLocalTitle] = useState(activePage?.title ?? "");
  const [localDescription, setLocalDescription] = useState(activePage?.description ?? "");
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const editor = useCreateBlockNote(
    { initialContent: activePage?.content?.length ? (activePage.content as PartialBlock[]) : undefined },
    [activePageId]
  );

  useEffect(() => {
    setLocalTitle(activePage?.title ?? "");
    setLocalDescription(activePage?.description ?? "");
  }, [activePageId]);

  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.style.height = "auto";
      titleRef.current.style.height = `${titleRef.current.scrollHeight}px`;
    }
  }, [localTitle]);

  useEffect(() => {
    if (descRef.current) {
      descRef.current.style.height = "auto";
      descRef.current.style.height = `${descRef.current.scrollHeight}px`;
    }
  }, [localDescription]);

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setLocalTitle(val);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => { if (activePageId) updateTitle(activePageId, val); }, 300);
  }, [activePageId, updateTitle]);

  const handleDescriptionChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setLocalDescription(val);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => { if (activePageId) updateDescription(activePageId, val); }, 300);
  }, [activePageId, updateDescription]);

  const handleEditorChange = useCallback(() => {
    if (!activePageId || activePage?.locked) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      updateContent(activePageId, editor.document as PartialBlock[]);
    }, 500);
  }, [activePageId, activePage?.locked, editor, updateContent]);

  if (!activePage) {
    return (
      <HomeDashboard
        pages={pages}
        recentPageIds={recentPageIds}
        onNew={onNew ?? (() => {})}
        onSearch={onSearch ?? (() => {})}
        onTemplates={onTemplates ?? (() => {})}
      />
    );
  }

  return (
    <div className="flex-1 flex overflow-hidden bg-white dark:bg-[#191919]">
      <div className="flex-1 overflow-y-auto">
        {/* Cover — full viewport width */}
        <Cover pageId={activePage.id} cover={activePage.cover} />

        {/* Centered content column */}
        <div className="max-w-[900px] mx-auto w-full">
          {/* Property panel */}
          <PropertyPanel pageId={activePage.id} />

          {/* Page body */}
          <div className="px-[120px] pt-14 pb-40">
            <div className="mb-4 flex items-end gap-3">
              <IconPicker icon={activePage.icon} pageId={activePage.id} locked={activePage.locked} />
              {activePage.locked && (
                <span className="mb-2 flex items-center gap-1.5 text-[11px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1 rounded-full border border-amber-200/60 dark:border-amber-700/40 font-medium">
                  <Lock size={9} /> Locked
                </span>
              )}
            </div>

            <textarea
              ref={titleRef}
              className="w-full text-[40px] font-bold text-[#1A1A1A] dark:text-white resize-none border-none outline-none bg-transparent placeholder-black/10 dark:placeholder-white/10 leading-[1.15] mb-2 overflow-hidden tracking-[-0.5px]"
              placeholder="Untitled"
              value={localTitle}
              onChange={handleTitleChange}
              onKeyDown={(e) => {
                if (e.key === "Enter") { e.preventDefault(); descRef.current?.focus(); }
                if (e.key === "ArrowDown") { e.preventDefault(); descRef.current?.focus(); }
              }}
              rows={1}
              readOnly={activePage.locked}
            />

            <textarea
              ref={descRef}
              className="w-full text-[16px] text-[#9B9A97] dark:text-[#666] resize-none border-none outline-none bg-transparent placeholder-black/[0.12] dark:placeholder-white/[0.12] leading-relaxed mb-8 overflow-hidden"
              placeholder="Add a description..."
              value={localDescription}
              onChange={handleDescriptionChange}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); editor.focus(); }
                if (e.key === "ArrowDown") { e.preventDefault(); editor.focus(); }
              }}
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
          <div className="border-t border-black/[0.05] dark:border-white/[0.05]">
            <div className="flex items-center justify-between px-[120px] py-5">
              <WordCount editor={editor} />
              <span className="text-[12px] text-[#C4C3BF] dark:text-[#444444]">
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
