import React, { useCallback, useEffect, useState } from "react";
import { MantineProvider } from "@mantine/core";
import { Sidebar } from "./components/Sidebar";
import { Editor } from "./components/Editor";
import { SearchModal } from "./components/SearchModal";
import { TemplatesModal } from "./components/TemplatesModal";
import { useSettingsStore } from "./store/settings";
import { usePageStore } from "./store/pages";
import { exportPageAsMarkdown } from "./lib/exportMarkdown";

export default function App() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const { dark, toggleDark } = useSettingsStore();
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
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [createPage, toggleDark]);

  return (
    <MantineProvider>
      <div className="flex h-screen w-screen overflow-hidden bg-white dark:bg-neutral-950">
        <Sidebar
          onSearch={() => setSearchOpen(true)}
          onExport={handleExport}
          onTemplates={() => setTemplatesOpen(true)}
        />
        <Editor onExport={handleExport} />
        <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
        <TemplatesModal open={templatesOpen} onClose={() => setTemplatesOpen(false)} />
      </div>
    </MantineProvider>
  );
}
