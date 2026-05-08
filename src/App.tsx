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
import { KanbanBoard } from "./components/views/KanbanBoard";
import { useSettingsStore } from "./store/settings";
import { usePageStore } from "./store/pages";
import { exportPageAsMarkdown } from "./lib/exportMarkdown";

type ViewMode = "notes" | "board";

export default function App() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [tagBrowserOpen, setTagBrowserOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("notes");

  const { dark, toggleDark, focusMode, toggleFocusMode } = useSettingsStore();
  const { pages, createPage } = usePageStore();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

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
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [createPage, toggleDark, toggleFocusMode]);

  /* Focus mode — full-screen editor only */
  if (focusMode) {
    return (
      <MantineProvider>
        <div className="flex flex-col h-screen w-screen overflow-hidden bg-white dark:bg-neutral-950">
          <FocusModeBar onExport={handleExport} />
          <div className="flex-1 overflow-hidden pt-12">
            <Editor onExport={handleExport} />
          </div>
          <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
        </div>
      </MantineProvider>
    );
  }

  return (
    <MantineProvider>
      <div className="flex h-screen w-screen overflow-hidden bg-white dark:bg-neutral-950">
        <Sidebar
          onSearch={() => setSearchOpen(true)}
          onExport={handleExport}
          onTemplates={() => setTemplatesOpen(true)}
        />

        {/* Main area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* View toggle bar */}
          <div className="flex items-center gap-1 px-4 py-1.5 border-b border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-950">
            <button
              onClick={() => setViewMode("notes")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors
                ${viewMode === "notes"
                  ? "bg-gray-100 dark:bg-neutral-800 text-gray-800 dark:text-neutral-100"
                  : "text-gray-400 dark:text-neutral-500 hover:text-gray-700 dark:hover:text-neutral-300"}`}
            >
              <FileText size={12} /> Notes
            </button>
            <button
              onClick={() => setViewMode("board")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors
                ${viewMode === "board"
                  ? "bg-gray-100 dark:bg-neutral-800 text-gray-800 dark:text-neutral-100"
                  : "text-gray-400 dark:text-neutral-500 hover:text-gray-700 dark:hover:text-neutral-300"}`}
            >
              <LayoutGrid size={12} /> Board
            </button>
            <span className="ml-auto text-[10px] text-gray-400 dark:text-neutral-600 font-mono hidden sm:block">
              ⌘⇧B toggle view · ⌘⇧F focus · ⌘⇧G tags
            </span>
          </div>

          {viewMode === "notes" ? (
            <Editor onExport={handleExport} />
          ) : (
            <KanbanBoard />
          )}
        </div>

        <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
        <TemplatesModal open={templatesOpen} onClose={() => setTemplatesOpen(false)} />
        <TagBrowser open={tagBrowserOpen} onClose={() => setTagBrowserOpen(false)} />
        <QuickCapture />
      </div>
    </MantineProvider>
  );
}
