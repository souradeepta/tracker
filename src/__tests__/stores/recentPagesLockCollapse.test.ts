import { describe, it, expect, beforeEach } from "vitest";
import { usePageStore } from "../../store/pages";
import { useSettingsStore } from "../../store/settings";

function resetPages() {
  usePageStore.setState({ pages: {}, activePageId: null, expandedIds: [], recentPageIds: [] });
}
function resetSettings() {
  useSettingsStore.setState({ dark: false, sidebarWidth: 240, sidebarCollapsed: false });
}

// ─── Recent pages ───────────────────────────────────────────────────────────
describe("recent pages", () => {
  beforeEach(resetPages);

  it("visiting a page adds it to recentPageIds", () => {
    const id = usePageStore.getState().createPage();
    // createPage already calls setActive internally, so recentPageIds should have the id
    expect(usePageStore.getState().recentPageIds).toContain(id);
  });

  it("switching pages prepends to recentPageIds", () => {
    const id1 = usePageStore.getState().createPage();
    const id2 = usePageStore.getState().createPage();
    usePageStore.getState().setActive(id1);
    expect(usePageStore.getState().recentPageIds[0]).toBe(id1);
    expect(usePageStore.getState().recentPageIds).toContain(id2);
  });

  it("visiting the same page twice does not create duplicate entries", () => {
    const id = usePageStore.getState().createPage();
    usePageStore.getState().setActive(id);
    usePageStore.getState().setActive(id);
    const recents = usePageStore.getState().recentPageIds;
    expect(recents.filter((r) => r === id)).toHaveLength(1);
  });

  it("recentPageIds is capped at 10 entries", () => {
    for (let i = 0; i < 15; i++) {
      usePageStore.getState().createPage();
    }
    expect(usePageStore.getState().recentPageIds.length).toBeLessThanOrEqual(10);
  });
});

// ─── Sidebar collapse ───────────────────────────────────────────────────────
describe("sidebar collapse (settings store)", () => {
  beforeEach(resetSettings);

  it("sidebar starts expanded", () => {
    expect(useSettingsStore.getState().sidebarCollapsed).toBe(false);
  });

  it("toggleSidebarCollapsed collapses the sidebar", () => {
    useSettingsStore.getState().toggleSidebarCollapsed();
    expect(useSettingsStore.getState().sidebarCollapsed).toBe(true);
  });

  it("toggleSidebarCollapsed expands a collapsed sidebar", () => {
    useSettingsStore.getState().toggleSidebarCollapsed();
    useSettingsStore.getState().toggleSidebarCollapsed();
    expect(useSettingsStore.getState().sidebarCollapsed).toBe(false);
  });
});

// ─── Page lock ──────────────────────────────────────────────────────────────
describe("page lock", () => {
  beforeEach(resetPages);

  it("new page starts unlocked", () => {
    const id = usePageStore.getState().createPage();
    expect(usePageStore.getState().pages[id].locked).toBe(false);
  });

  it("toggleLocked locks an unlocked page", () => {
    const id = usePageStore.getState().createPage();
    usePageStore.getState().toggleLocked(id);
    expect(usePageStore.getState().pages[id].locked).toBe(true);
  });

  it("toggleLocked unlocks a locked page", () => {
    const id = usePageStore.getState().createPage();
    usePageStore.getState().toggleLocked(id);
    usePageStore.getState().toggleLocked(id);
    expect(usePageStore.getState().pages[id].locked).toBe(false);
  });
});
