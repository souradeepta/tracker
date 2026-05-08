import { Fragment, useCallback, useEffect, useState } from "react";
import { MantineProvider } from "@mantine/core";
import { LayoutGrid, FileText, Star, Lock, Unlock, Download, ChevronRight } from "lucide-react";
import { Sidebar } from "./components/Sidebar";
import { Editor } from "./components/Editor";
import { SearchModal } from "./components/SearchModal";
import { TemplatesModal } from "./components/TemplatesModal";
import { TagBrowser } from "./components/TagBrowser";
import { QuickCapture } from "./components/QuickCapture";
import { FocusModeBar } from "./components/FocusModeBar";
import { ShortcutsModal } from "./components/ShortcutsModal";
import { KanbanBoard } from "./components/views/KanbanBoard";
import { useSettingsStore } from "./store/settings";
import { usePageStore } from "./store/pages";
import { exportPageAsMarkdown } from "./lib/exportMarkdown";

type ViewMode = "notes" | "board";

export default function App() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [tagBrowserOpen, setTagBrowserOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("notes");

  const { dark, toggleDark, focusMode, toggleFocusMode } = useSettingsStore();
  const { pages, activePageId, createPage, initializeIfEmpty, setActive, toggleFavorite, toggleLocked } = usePageStore();

  const activePage = activePageId ? pages[activePageId] : null;

  const breadcrumbs: { id: string; title: string; icon: string }[] = [];
  if (activePage) {
    let cur = activePage;
    while (cur) {
      breadcrumbs.unshift({ id: cur.id, title: cur.title, icon: cur.icon });
      cur = cur.parentId ? (pages[cur.parentId] ?? null!) : null!;
      if (!cur?.id) break;
    }
  }

  useEffect(() => { document.documentElement.classList.toggle("dark", dark); }, [dark]);
  useEffect(() => { initializeIfEmpty(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const handleExport = useCallback((id: string) => {
    const page = pages[id];
    if (page) exportPageAsMarkdown(page);
  }, [pages]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key === "k") { e.preventDefault(); setSearchOpen((v) => !v); }
      if (mod && e.key === "n") { e.preventDefault(); createPage(null); }
      if (mod && e.shiftKey && e.key.toLowerCase() === "d") { e.preventDefault(); toggleDark(); }
      if (mod && e.shiftKey && e.key.toLowerCase() === "t") { e.preventDefault(); setTemplatesOpen((v) => !v); }
      if (mod && e.shiftKey && e.key.toLowerCase() === "f") { e.preventDefault(); toggleFocusMode(); }
      if (mod && e.shiftKey && e.key.toLowerCase() === "g") { e.preventDefault(); setTagBrowserOpen((v) => !v); }
      if (mod && e.shiftKey && e.key.toLowerCase() === "b") { e.preventDefault(); setViewMode((v) => v === "board" ? "notes" : "board"); }
      if (e.key === "?" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const tag = (e.target as HTMLElement).tagName;
        if (tag !== "INPUT" && tag !== "TEXTAREA") setShortcutsOpen((v) => !v);
      }
      if (e.key === "Escape") setShortcutsOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [createPage, toggleDark, toggleFocusMode]);

  const editorProps = {
    onExport: handleExport,
    onNew: () => createPage(null),
    onSearch: () => setSearchOpen(true),
    onTemplates: () => setTemplatesOpen(true),
    onShortcuts: () => setShortcutsOpen(true),
  };

  if (focusMode) {
    return (
      <MantineProvider>
        <div className="flex flex-col h-screen w-screen overflow-hidden bg-white dark:bg-[#191919]">
          <FocusModeBar onExport={handleExport} />
          <div className="flex-1 overflow-hidden pt-[41px]">
            <Editor {...editorProps} />
          </div>
          <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
          <ShortcutsModal open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
        </div>
      </MantineProvider>
    );
  }

  const btnCls = "w-8 h-8 flex items-center justify-center rounded-lg text-[#9B9A97] dark:text-[#666] hover:bg-black/[0.06] dark:hover:bg-white/[0.06] hover:text-[#1A1A1A] dark:hover:text-white transition-colors";

  return (
    <MantineProvider>
      {/* ── Island canvas ───────────────────────────────────────────────────── */}
      <div
        className="flex h-screen w-screen overflow-hidden gap-3 p-3"
        style={{ background: "var(--canvas-bg, #D8D3CD)" }}
      >
        <Sidebar
          onSearch={() => setSearchOpen(true)}
          onExport={handleExport}
          onTemplates={() => setTemplatesOpen(true)}
          onShortcuts={() => setShortcutsOpen(true)}
        />

        {/* ── Main island ─────────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden rounded-2xl bg-white dark:bg-[#1E1E1E] shadow-lg">

          {/* Toolbar */}
          <div className="h-12 flex items-center gap-4 px-6 border-b border-black/[0.07] dark:border-white/[0.07] flex-shrink-0 bg-white dark:bg-[#1E1E1E]">

            {/* View toggle */}
            <div className="flex items-center bg-black/[0.05] dark:bg-white/[0.06] rounded-lg p-1 gap-0.5 flex-shrink-0">
              {([
                { mode: "notes" as ViewMode, icon: <FileText size={12} />, label: "Notes" },
                { mode: "board" as ViewMode, icon: <LayoutGrid size={12} />, label: "Board" },
              ]).map(({ mode, icon, label }) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium transition-all ${
                    viewMode === mode
                      ? "bg-white dark:bg-[#2C2C2C] text-[#1A1A1A] dark:text-white shadow-sm"
                      : "text-[#9B9A97] dark:text-[#666] hover:text-[#1A1A1A] dark:hover:text-white"
                  }`}
                >
                  {icon} {label}
                </button>
              ))}
            </div>

            {/* Breadcrumb */}
            {viewMode === "notes" && activePage ? (
              <nav className="flex-1 flex items-center gap-1 min-w-0 overflow-hidden">
                {breadcrumbs.map((item, i) => (
                  <Fragment key={item.id}>
                    {i > 0 && <ChevronRight size={12} className="flex-shrink-0 text-[#C4C3BF] dark:text-[#555]" />}
                    <button
                      onClick={() => setActive(item.id)}
                      className={`flex items-center gap-1.5 text-[12px] transition-colors truncate flex-shrink-0 max-w-[200px] px-1.5 py-0.5 rounded-md hover:bg-black/[0.05] dark:hover:bg-white/[0.05] ${
                        i === breadcrumbs.length - 1
                          ? "text-[#37352F] dark:text-white font-medium"
                          : "text-[#9B9A97] dark:text-[#666]"
                      }`}
                    >
                      <span className="text-[13px]">{item.icon}</span>
                      <span className="truncate">{item.title || "Untitled"}</span>
                    </button>
                  </Fragment>
                ))}
              </nav>
            ) : (
              <div className="flex-1" />
            )}

            {/* Actions */}
            {viewMode === "notes" && activePage ? (
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => toggleFavorite(activePage.id)}
                  className={`${btnCls} ${activePage.favorited ? "text-amber-400" : ""}`}
                  title="Favorite"
                >
                  <Star size={14} fill={activePage.favorited ? "currentColor" : "none"} />
                </button>
                <button onClick={() => toggleLocked(activePage.id)} className={btnCls} title="Lock">
                  {activePage.locked ? <Unlock size={14} /> : <Lock size={14} />}
                </button>
                <button onClick={() => handleExport(activePage.id)} className={btnCls} title="Export">
                  <Download size={14} />
                </button>
              </div>
            ) : (
              <span className="text-[11px] text-[#C4C3BF] dark:text-[#444] font-mono select-none">
                press ? for shortcuts
              </span>
            )}
          </div>

          {/* Content */}
          {viewMode === "notes" ? <Editor {...editorProps} /> : <KanbanBoard />}
        </div>

        <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
        <TemplatesModal open={templatesOpen} onClose={() => setTemplatesOpen(false)} />
        <TagBrowser open={tagBrowserOpen} onClose={() => setTagBrowserOpen(false)} />
        <ShortcutsModal open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
        <QuickCapture />
      </div>
    </MantineProvider>
  );
}
