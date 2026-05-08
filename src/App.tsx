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

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  useEffect(() => {
    initializeIfEmpty();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleExport = useCallback(
    (id: string) => {
      const page = pages[id];
      if (page) exportPageAsMarkdown(page);
    },
    [pages]
  );

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
        if (tag !== "INPUT" && tag !== "TEXTAREA") { setShortcutsOpen((v) => !v); }
      }
      if (e.key === "Escape") { setShortcutsOpen(false); }
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

  const btnCls = "w-7 h-7 flex items-center justify-center rounded-md text-[#9B9A97] dark:text-[#6B6B6B] hover:bg-[#37352F]/[0.06] dark:hover:bg-white/[0.05] hover:text-[#37352F] dark:hover:text-white transition-colors";

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

  return (
    <MantineProvider>
      <div className="flex h-screen w-screen overflow-hidden bg-[#F4F3F0] dark:bg-[#141414]">
        <Sidebar
          onSearch={() => setSearchOpen(true)}
          onExport={handleExport}
          onTemplates={() => setTemplatesOpen(true)}
          onShortcuts={() => setShortcutsOpen(true)}
        />

        {/* Main area */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Unified toolbar: view toggle + breadcrumb + actions */}
          <div className="h-11 flex items-center gap-3 px-4 border-b border-[#E9E9E8] dark:border-[#2D2D2D] bg-white dark:bg-[#1F1F1F] flex-shrink-0">

            {/* View toggle */}
            <div className="flex items-center gap-0.5 bg-[#F4F3F0] dark:bg-white/[0.05] rounded-lg p-0.5 flex-shrink-0">
              <button
                onClick={() => setViewMode("notes")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-medium transition-all
                  ${viewMode === "notes"
                    ? "bg-white dark:bg-[#2A2A2A] text-[#37352F] dark:text-white shadow-sm"
                    : "text-[#9B9A97] dark:text-[#6B6B6B] hover:text-[#37352F] dark:hover:text-white"}`}
              >
                <FileText size={12} /> Notes
              </button>
              <button
                onClick={() => setViewMode("board")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-medium transition-all
                  ${viewMode === "board"
                    ? "bg-white dark:bg-[#2A2A2A] text-[#37352F] dark:text-white shadow-sm"
                    : "text-[#9B9A97] dark:text-[#6B6B6B] hover:text-[#37352F] dark:hover:text-white"}`}
              >
                <LayoutGrid size={12} /> Board
              </button>
            </div>

            {/* Breadcrumb (notes + active page only) */}
            {viewMode === "notes" && activePage ? (
              <nav className="flex-1 flex items-center gap-0.5 min-w-0 overflow-hidden">
                {breadcrumbs.map((item, i) => (
                  <Fragment key={item.id}>
                    {i > 0 && <ChevronRight size={11} className="flex-shrink-0 text-[#C4C3BF] dark:text-[#444444] mx-0.5" />}
                    <button
                      onClick={() => setActive(item.id)}
                      className={`flex items-center gap-1 text-[12px] hover:text-[#37352F] dark:hover:text-white transition-colors truncate flex-shrink-0 max-w-[180px]
                        ${i === breadcrumbs.length - 1 ? "text-[#37352F] dark:text-white font-medium" : "text-[#9B9A97] dark:text-[#6B6B6B]"}`}
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

            {/* Page actions (notes + active page only) */}
            {viewMode === "notes" && activePage ? (
              <div className="flex items-center gap-0.5 flex-shrink-0">
                <button
                  onClick={() => toggleFavorite(activePage.id)}
                  className={`${btnCls} ${activePage.favorited ? "text-amber-400 dark:text-amber-400" : ""}`}
                  title={activePage.favorited ? "Remove from favorites" : "Favorite"}
                >
                  <Star size={13} fill={activePage.favorited ? "currentColor" : "none"} />
                </button>
                <button
                  onClick={() => toggleLocked(activePage.id)}
                  className={btnCls}
                  title={activePage.locked ? "Unlock" : "Lock page"}
                >
                  {activePage.locked ? <Unlock size={13} /> : <Lock size={13} />}
                </button>
                <button
                  onClick={() => handleExport(activePage.id)}
                  className={btnCls}
                  title="Export as Markdown"
                >
                  <Download size={13} />
                </button>
              </div>
            ) : (
              <span className="text-[10px] text-[#C4C3BF] dark:text-[#444444] font-mono select-none hidden sm:block">
                press ? for shortcuts
              </span>
            )}
          </div>

          {viewMode === "notes" ? (
            <Editor {...editorProps} />
          ) : (
            <KanbanBoard />
          )}
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
