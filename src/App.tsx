import { Fragment, useCallback, useEffect, useState } from "react";
import { MantineProvider, Box, Paper, Group, Text } from "@mantine/core";
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
  const [searchOpen, setSearchOpen]       = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [tagBrowserOpen, setTagBrowserOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [viewMode, setViewMode]           = useState<ViewMode>("notes");

  const { dark, toggleDark, focusMode, toggleFocusMode } = useSettingsStore();
  const { pages, activePageId, loaded, createPage, initializeIfEmpty, setActive, toggleFavorite, toggleLocked } = usePageStore();

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { void initializeIfEmpty(); }, []);

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
    onNew:       () => createPage(null),
    onSearch:    () => setSearchOpen(true),
    onTemplates: () => setTemplatesOpen(true),
    onShortcuts: () => setShortcutsOpen(true),
  };

  if (!loaded) {
    return (
      <MantineProvider forceColorScheme={dark ? "dark" : "light"}>
        <Box style={{ height: "100vh", width: "100vw", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--canvas)" }}>
          <span style={{ fontSize: 13, color: "var(--text3)" }}>Loading…</span>
        </Box>
      </MantineProvider>
    );
  }

  if (focusMode) {
    return (
      <MantineProvider forceColorScheme={dark ? "dark" : "light"}>
        <Box style={{ display: "flex", flexDirection: "column", height: "100vh", width: "100vw", overflow: "hidden", background: "var(--surface)" }}>
          <FocusModeBar onExport={handleExport} />
          <Box style={{ flex: 1, overflow: "hidden", paddingTop: 41 }}>
            <Editor {...editorProps} />
          </Box>
          <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
          <ShortcutsModal open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
        </Box>
      </MantineProvider>
    );
  }

  return (
    <MantineProvider forceColorScheme={dark ? "dark" : "light"}>
      {/* Island canvas */}
      <Box style={{ display: "flex", height: "100vh", width: "100vw", overflow: "hidden", gap: 12, padding: 12, background: "var(--canvas)" }}>

        <Sidebar
          onSearch={() => setSearchOpen(true)}
          onExport={handleExport}
          onTemplates={() => setTemplatesOpen(true)}
          onShortcuts={() => setShortcutsOpen(true)}
        />

        {/* Main island */}
        <Paper
          radius="xl"
          shadow="xs"
          style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          {/* Toolbar */}
          <Group
            px={24}
            gap={16}
            style={{ height: 48, flexShrink: 0, borderBottom: "1px solid var(--border)", background: "var(--surface)" }}
          >
            {/* View toggle */}
            <Group gap={2} style={{ background: "rgba(0,0,0,0.05)", borderRadius: 8, padding: 4, flexShrink: 0 }}>
              {([
                { mode: "notes" as ViewMode, icon: <FileText size={12} />, label: "Notes" },
                { mode: "board" as ViewMode, icon: <LayoutGrid size={12} />, label: "Board" },
              ]).map(({ mode, icon, label }) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  style={{
                    display: "flex", alignItems: "center", gap: 6, padding: "5px 12px",
                    borderRadius: 6, fontSize: 12, fontWeight: 500, border: "none", cursor: "pointer",
                    transition: "all 120ms",
                    background: viewMode === mode ? "var(--surface)" : "transparent",
                    color: viewMode === mode ? "var(--text)" : "var(--text2)",
                    boxShadow: viewMode === mode ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                  }}
                >
                  {icon} {label}
                </button>
              ))}
            </Group>

            {/* Breadcrumb */}
            {viewMode === "notes" && activePage ? (
              <Group gap={4} style={{ flex: 1, overflow: "hidden" }}>
                {breadcrumbs.map((item, i) => (
                  <Fragment key={item.id}>
                    {i > 0 && <ChevronRight size={12} style={{ color: "var(--text3)", flexShrink: 0 }} />}
                    <button
                      onClick={() => setActive(item.id)}
                      style={{
                        display: "flex", alignItems: "center", gap: 5, fontSize: 12,
                        color: i === breadcrumbs.length - 1 ? "var(--text)" : "var(--text2)",
                        fontWeight: i === breadcrumbs.length - 1 ? 500 : 400,
                        background: "transparent", border: "none", cursor: "pointer",
                        borderRadius: 6, padding: "3px 6px",
                        maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flexShrink: 0,
                      }}
                    >
                      <span style={{ fontSize: 13 }}>{item.icon}</span>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{item.title || "Untitled"}</span>
                    </button>
                  </Fragment>
                ))}
              </Group>
            ) : (
              <Box style={{ flex: 1 }} />
            )}

            {/* Actions */}
            {viewMode === "notes" && activePage ? (
              <Group gap={4} style={{ flexShrink: 0 }}>
                <button
                  onClick={() => toggleFavorite(activePage.id)}
                  className="icon-btn"
                  title="Favorite"
                  style={{ color: activePage.favorited ? "#F59E0B" : undefined }}
                >
                  <Star size={14} fill={activePage.favorited ? "currentColor" : "none"} />
                </button>
                <button onClick={() => toggleLocked(activePage.id)} className="icon-btn" title="Lock">
                  {activePage.locked ? <Unlock size={14} /> : <Lock size={14} />}
                </button>
                <button onClick={() => handleExport(activePage.id)} className="icon-btn" title="Export">
                  <Download size={14} />
                </button>
              </Group>
            ) : (
              <Text size="xs" style={{ color: "var(--text3)", fontFamily: "monospace" }}>
                press ? for shortcuts
              </Text>
            )}
          </Group>

          {/* Content */}
          {viewMode === "notes" ? <Editor {...editorProps} /> : <KanbanBoard />}
        </Paper>

        <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
        <TemplatesModal open={templatesOpen} onClose={() => setTemplatesOpen(false)} />
        <TagBrowser open={tagBrowserOpen} onClose={() => setTagBrowserOpen(false)} />
        <ShortcutsModal open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
        <QuickCapture />
      </Box>
    </MantineProvider>
  );
}
