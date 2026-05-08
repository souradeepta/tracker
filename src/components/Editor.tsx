import React, { useEffect, useRef, useState, useCallback } from "react";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import type { PartialBlock } from "@blocknote/core";
import { Clock, FileText, Lock, Layers, Search } from "lucide-react";
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
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => !locked && setOpen((v) => !v)}
        disabled={locked}
        style={{
          fontSize: 48, lineHeight: 1, background: "transparent", border: "none",
          borderRadius: 12, padding: "8px 8px", marginLeft: -8,
          cursor: locked ? "default" : "pointer",
          transition: "background 100ms",
        }}
        onMouseEnter={(e) => { if (!locked) (e.currentTarget as HTMLButtonElement).style.background = "var(--hover)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
      >
        {icon}
      </button>
      {open && !locked && (
        <div style={{
          position: "absolute", top: 72, left: 0, zIndex: 50,
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: 16, boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          padding: 12, display: "grid", gridTemplateColumns: "repeat(8,1fr)", gap: 4, width: 288,
        }}>
          {EMOJI_OPTIONS.map((e) => (
            <button
              key={e}
              onClick={() => { updateIcon(pageId, e); setOpen(false); }}
              style={{
                fontSize: 20, background: "transparent", border: "none", borderRadius: 8,
                padding: 6, cursor: "pointer", transition: "background 100ms",
              }}
              onMouseEnter={(el) => { (el.currentTarget as HTMLButtonElement).style.background = "var(--hover)"; }}
              onMouseLeave={(el) => { (el.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
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
        .map((b: { content?: unknown }) =>
          Array.isArray(b.content) ? (b.content as { text: string }[]).map((c) => c.text).join(" ") : ""
        )
        .join(" ");
      setCount(text.trim() ? text.trim().split(/\s+/).length : 0);
    };
    calc();
    return editor.onChange(calc);
  }, [editor]);
  const readingMins = estimateReadingTime(count);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 12, color: "var(--text3)" }}>
      <span>{count} {count === 1 ? "word" : "words"}</span>
      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <Clock size={11} /> {readingMins} min read
      </span>
    </div>
  );
}

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
    <div style={{ flex: 1, overflowY: "auto", background: "var(--surface)" }}>
      <div className="content-col" style={{ padding: "96px 48px 96px" }}>
        <h1 style={{ fontSize: 36, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em", marginBottom: 48, margin: "0 0 48px" }}>
          {greeting}
        </h1>

        {recent.length > 0 && (
          <section style={{ marginBottom: 48 }}>
            <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text3)", display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <Clock size={11} /> Recently visited
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
              {recent.map((page) => {
                const coverGrad = page.cover ? COVERS[page.cover] : null;
                return (
                  <button
                    key={page.id}
                    onClick={() => setActive(page.id)}
                    style={{
                      textAlign: "left", border: "1px solid var(--border)", borderRadius: 16,
                      overflow: "hidden", background: "var(--surface)", cursor: "pointer",
                      transition: "box-shadow 150ms, border-color 150ms",
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget as HTMLButtonElement;
                      el.style.boxShadow = "0 4px 20px rgba(0,0,0,0.10)";
                      el.style.borderColor = "rgba(0,0,0,0.14)";
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLButtonElement;
                      el.style.boxShadow = "none";
                      el.style.borderColor = "var(--border)";
                    }}
                  >
                    <div style={{ height: 80, background: coverGrad ?? "linear-gradient(135deg,#f0ede8,#e8e4de)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {!coverGrad && <span style={{ fontSize: 36, opacity: 0.25 }}>{page.icon}</span>}
                    </div>
                    <div style={{ padding: "12px 16px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 15 }}>{page.icon}</span>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{page.title || "Untitled"}</p>
                      </div>
                      <p style={{ fontSize: 11, color: "var(--text3)", margin: 0 }}>{timeAgo(page.updatedAt)}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        <section>
          <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text3)", marginBottom: 16 }}>
            Quick actions
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
            {[
              { icon: <FileText size={16} />, title: "New page",  desc: "Start writing instantly", action: onNew },
              { icon: <Search size={16} />,   title: "Search",    desc: "Find anything fast",     action: onSearch },
              { icon: <Layers size={16} />,   title: "Templates", desc: "Start from a layout",    action: onTemplates },
            ].map(({ icon, title, desc, action }) => (
              <button
                key={title}
                onClick={action}
                style={{
                  display: "flex", alignItems: "center", gap: 16, padding: 20,
                  borderRadius: 16, border: "1px solid var(--border)", background: "var(--surface)",
                  cursor: "pointer", textAlign: "left", transition: "border-color 150ms, box-shadow 150ms",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLButtonElement;
                  el.style.borderColor = "#a5b4fc";
                  el.style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLButtonElement;
                  el.style.borderColor = "var(--border)";
                  el.style.boxShadow = "none";
                }}
              >
                <div style={{ width: 40, height: 40, borderRadius: 12, background: "var(--hover)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text2)", flexShrink: 0 }}>
                  {icon}
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", margin: "0 0 2px" }}>{title}</p>
                  <p style={{ fontSize: 12, color: "var(--text3)", margin: 0 }}>{desc}</p>
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

  const [localTitle, setLocalTitle]             = useState(activePage?.title ?? "");
  const [localDescription, setLocalDescription] = useState(activePage?.description ?? "");
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const descRef  = useRef<HTMLTextAreaElement>(null);
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
    <div style={{ flex: 1, display: "flex", overflow: "hidden", background: "var(--surface)" }}>
      {/* Scrollable column */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        <Cover pageId={activePage.id} cover={activePage.cover} />

        <div className="content-col">
          {/* Properties bar */}
          <div style={{ borderBottom: "1px solid var(--border)" }}>
            <div className="content-body" style={{ paddingTop: 12, paddingBottom: 12 }}>
              <PropertyPanel pageId={activePage.id} />
            </div>
          </div>

          {/* Page body */}
          <div className="content-body" style={{ paddingTop: 56, paddingBottom: 160 }}>
            {/* Icon + lock badge */}
            <div style={{ display: "flex", alignItems: "flex-end", gap: 12, marginBottom: 20 }}>
              <IconPicker icon={activePage.icon} pageId={activePage.id} locked={activePage.locked} />
              {activePage.locked && (
                <span style={{
                  marginBottom: 8, display: "flex", alignItems: "center", gap: 6, fontSize: 11,
                  color: "#92400e", background: "#fffbeb", padding: "3px 10px", borderRadius: 999,
                  border: "1px solid #fde68a", fontWeight: 500,
                }}>
                  <Lock size={9} /> Locked
                </span>
              )}
            </div>

            {/* Title */}
            <textarea
              ref={titleRef}
              style={{
                width: "100%", fontSize: 42, fontWeight: 700, color: "var(--text)",
                resize: "none", border: "none", outline: "none", background: "transparent",
                lineHeight: 1.2, marginBottom: 12, overflow: "hidden",
                letterSpacing: "-0.02em", fontFamily: "inherit",
              }}
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

            {/* Description */}
            <textarea
              ref={descRef}
              style={{
                width: "100%", fontSize: 17, color: "var(--text2)",
                resize: "none", border: "none", outline: "none", background: "transparent",
                lineHeight: 1.6, marginBottom: 40, overflow: "hidden", fontFamily: "inherit",
              }}
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
          <div style={{ borderTop: "1px solid var(--border)" }}>
            <div className="content-body" style={{ paddingTop: 20, paddingBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <WordCount editor={editor} />
              <span style={{ fontSize: 12, color: "var(--text3)" }}>
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
