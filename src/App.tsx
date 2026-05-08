import { useCallback, useEffect, useState } from "react";
import { MantineProvider } from "@mantine/core";
import { LayoutGrid, FileText } from "lucide-react";
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
  const { pages, createPage, initializeIfEmpty } = usePageStore();

  // Apply persisted dark mode class on first render
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  // Create Getting Started page if this is the first launch
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

  /* Focus mode — full-screen editor only */
  if (focusMode) {
    return (
      <MantineProvider>
        <div className="flex flex-col h-screen w-screen overflow-hidden bg-white dark:bg-[#191919]">
          <FocusModeBar onExport={handleExport} />
          <div className="flex-1 overflow-hidden pt-12">
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
      <div className="flex h-screen w-screen overflow-hidden bg-white dark:bg-[#191919]">
        <Sidebar
          onSearch={() => setSearchOpen(true)}
          onExport={handleExport}
          onTemplates={() => setTemplatesOpen(true)}
          onShortcuts={() => setShortcutsOpen(true)}
        />

        {/* Main area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* View toggle bar */}
          <div className="flex items-center gap-1 px-3 py-1.5 border-b border-[#37352F]/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#191919]">
            <button
              onClick={() => setViewMode("notes")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-medium transition-colors
                ${viewMode === "notes"
                  ? "bg-[#37352F]/[0.08] dark:bg-white/[0.08] text-[#37352F] dark:text-white"
                  : "text-[#37352F]/40 dark:text-white/35 hover:text-[#37352F]/70 dark:hover:text-white/70"}`}
            >
              <FileText size={12} /> Notes
            </button>
            <button
              onClick={() => setViewMode("board")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-medium transition-colors
                ${viewMode === "board"
                  ? "bg-[#37352F]/[0.08] dark:bg-white/[0.08] text-[#37352F] dark:text-white"
                  : "text-[#37352F]/40 dark:text-white/35 hover:text-[#37352F]/70 dark:hover:text-white/70"}`}
            >
              <LayoutGrid size={12} /> Board
            </button>
            <span className="ml-auto text-[10px] text-[#37352F]/25 dark:text-white/20 font-mono hidden sm:block select-none">
              ⌘⇧B · press ? for shortcuts
            </span>
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
