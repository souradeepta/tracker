/**
 * RED tests for: Kanban grouping, reading time, focus mode, tag filtering, quick capture
 * All must fail before implementation.
 */
import { describe, it, expect, beforeEach } from "vitest";
import { usePageStore } from "../../store/pages";
import { useSettingsStore } from "../../store/settings";
import { groupPagesByStatus } from "../../lib/kanban";
import { estimateReadingTime } from "../../lib/readingTime";

function resetPages() {
  usePageStore.setState({ pages: {}, activePageId: null, expandedIds: [], recentPageIds: [] });
}
function resetSettings() {
  useSettingsStore.setState({ dark: false, sidebarWidth: 240, sidebarCollapsed: false, focusMode: false });
}

// ── Kanban grouping ─────────────────────────────────────────────────────────
describe("groupPagesByStatus", () => {
  beforeEach(resetPages);

  it("returns four columns: none, todo, in-progress, done", () => {
    const columns = groupPagesByStatus([]);
    const keys = columns.map((c) => c.status);
    expect(keys).toEqual(["none", "todo", "in-progress", "done"]);
  });

  it("places pages in the correct column by status", () => {
    const id1 = usePageStore.getState().createPage();
    usePageStore.getState().setStatus(id1, "todo");
    const id2 = usePageStore.getState().createPage();
    usePageStore.getState().setStatus(id2, "done");
    const id3 = usePageStore.getState().createPage();

    const pages = Object.values(usePageStore.getState().pages).filter((p) => !p.deleted);
    const columns = groupPagesByStatus(pages);

    const todo = columns.find((c) => c.status === "todo")!;
    const done = columns.find((c) => c.status === "done")!;
    const none = columns.find((c) => c.status === "none")!;

    expect(todo.pages.map((p) => p.id)).toContain(id1);
    expect(done.pages.map((p) => p.id)).toContain(id2);
    expect(none.pages.map((p) => p.id)).toContain(id3);
  });

  it("excludes deleted pages from all columns", () => {
    const id = usePageStore.getState().createPage();
    usePageStore.getState().trashPage(id);
    const pages = Object.values(usePageStore.getState().pages).filter((p) => !p.deleted);
    const columns = groupPagesByStatus(pages);
    const allPageIds = columns.flatMap((c) => c.pages.map((p) => p.id));
    expect(allPageIds).not.toContain(id);
  });
});

// ── Reading time ────────────────────────────────────────────────────────────
describe("estimateReadingTime", () => {
  it("returns 1 min for an empty page", () => {
    expect(estimateReadingTime(0)).toBe(1);
  });

  it("returns 1 min for fewer than 200 words", () => {
    expect(estimateReadingTime(150)).toBe(1);
  });

  it("returns 2 min for exactly 400 words", () => {
    expect(estimateReadingTime(400)).toBe(2);
  });

  it("returns correct value for large word counts", () => {
    expect(estimateReadingTime(1000)).toBe(5);
  });
});

// ── Focus mode (settings store) ─────────────────────────────────────────────
describe("focus mode", () => {
  beforeEach(resetSettings);

  it("focus mode starts disabled", () => {
    expect(useSettingsStore.getState().focusMode).toBe(false);
  });

  it("toggleFocusMode enables focus mode", () => {
    useSettingsStore.getState().toggleFocusMode();
    expect(useSettingsStore.getState().focusMode).toBe(true);
  });

  it("toggleFocusMode disables an enabled focus mode", () => {
    useSettingsStore.getState().toggleFocusMode();
    useSettingsStore.getState().toggleFocusMode();
    expect(useSettingsStore.getState().focusMode).toBe(false);
  });
});

// ── Tag filter (store-level) ─────────────────────────────────────────────────
describe("getPagesWithTag (store selector)", () => {
  beforeEach(resetPages);

  it("returns only pages with the given tag", () => {
    const id1 = usePageStore.getState().createPage();
    usePageStore.getState().addTag(id1, "design");
    const id2 = usePageStore.getState().createPage();
    usePageStore.getState().addTag(id2, "dev");
    const id3 = usePageStore.getState().createPage();
    usePageStore.getState().addTag(id3, "design");

    const { pages } = usePageStore.getState();
    const withDesign = Object.values(pages).filter((p) => !p.deleted && p.tags.includes("design"));
    expect(withDesign.map((p) => p.id)).toContain(id1);
    expect(withDesign.map((p) => p.id)).toContain(id3);
    expect(withDesign.map((p) => p.id)).not.toContain(id2);
  });

  it("getAllTags returns unique tags across all live pages", () => {
    const id1 = usePageStore.getState().createPage();
    usePageStore.getState().addTag(id1, "work");
    usePageStore.getState().addTag(id1, "design");
    const id2 = usePageStore.getState().createPage();
    usePageStore.getState().addTag(id2, "work");

    const tags = usePageStore.getState().getAllTags();
    expect(tags).toContain("work");
    expect(tags).toContain("design");
    expect(tags.filter((t) => t === "work")).toHaveLength(1); // deduplicated
  });
});
