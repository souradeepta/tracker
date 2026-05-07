import { describe, it, expect, beforeEach } from "vitest";
import { usePageStore } from "../../store/pages";

function resetStore() {
  usePageStore.setState({ pages: {}, activePageId: null, expandedIds: [] });
}

describe("pages store — createPage", () => {
  beforeEach(resetStore);

  it("creates a root page with correct defaults", () => {
    const id = usePageStore.getState().createPage();
    const page = usePageStore.getState().pages[id];
    expect(page.title).toBe("Untitled");
    expect(page.parentId).toBeNull();
    expect(page.deleted).toBe(false);
    expect(page.favorited).toBe(false);
    expect(page.cover).toBeNull();
    expect(page.content).toEqual([]);
    expect(page.icon).toBeTruthy();
  });

  it("sets the new page as active", () => {
    const id = usePageStore.getState().createPage();
    expect(usePageStore.getState().activePageId).toBe(id);
  });

  it("creates a child page with correct parentId", () => {
    const parentId = usePageStore.getState().createPage();
    const childId = usePageStore.getState().createPage(parentId);
    const child = usePageStore.getState().pages[childId];
    expect(child.parentId).toBe(parentId);
  });

  it("auto-expands parent when creating a child page", () => {
    const parentId = usePageStore.getState().createPage();
    usePageStore.getState().createPage(parentId);
    expect(usePageStore.getState().expandedIds).toContain(parentId);
  });
});

describe("pages store — updateTitle", () => {
  beforeEach(resetStore);

  it("updates the title and bumps updatedAt", () => {
    const id = usePageStore.getState().createPage();
    const before = usePageStore.getState().pages[id].updatedAt;
    usePageStore.getState().updateTitle(id, "My New Title");
    const page = usePageStore.getState().pages[id];
    expect(page.title).toBe("My New Title");
    expect(page.updatedAt).toBeGreaterThanOrEqual(before);
  });
});

describe("pages store — trashPage / restorePage / permanentDelete", () => {
  beforeEach(resetStore);

  it("marks a page as deleted without removing it", () => {
    const id = usePageStore.getState().createPage();
    usePageStore.getState().trashPage(id);
    expect(usePageStore.getState().pages[id].deleted).toBe(true);
    expect(usePageStore.getState().pages[id].deletedAt).toBeTypeOf("number");
  });

  it("trashing a parent also trashes its children", () => {
    const parentId = usePageStore.getState().createPage();
    const childId = usePageStore.getState().createPage(parentId);
    usePageStore.getState().trashPage(parentId);
    expect(usePageStore.getState().pages[childId].deleted).toBe(true);
  });

  it("restores a trashed page", () => {
    const id = usePageStore.getState().createPage();
    usePageStore.getState().trashPage(id);
    usePageStore.getState().restorePage(id);
    const page = usePageStore.getState().pages[id];
    expect(page.deleted).toBe(false);
    expect(page.deletedAt).toBeNull();
  });

  it("permanently deletes a page and all its descendants", () => {
    const parentId = usePageStore.getState().createPage();
    const childId = usePageStore.getState().createPage(parentId);
    const grandchildId = usePageStore.getState().createPage(childId);
    usePageStore.getState().permanentDelete(parentId);
    const state = usePageStore.getState().pages;
    expect(state[parentId]).toBeUndefined();
    expect(state[childId]).toBeUndefined();
    expect(state[grandchildId]).toBeUndefined();
  });

  it("emptyTrash removes all deleted pages", () => {
    const id1 = usePageStore.getState().createPage();
    const id2 = usePageStore.getState().createPage();
    usePageStore.getState().trashPage(id1);
    usePageStore.getState().emptyTrash();
    const state = usePageStore.getState().pages;
    expect(state[id1]).toBeUndefined();
    expect(state[id2]).toBeDefined();
  });
});

describe("pages store — toggleFavorite", () => {
  beforeEach(resetStore);

  it("favorites an unfavorited page", () => {
    const id = usePageStore.getState().createPage();
    usePageStore.getState().toggleFavorite(id);
    expect(usePageStore.getState().pages[id].favorited).toBe(true);
  });

  it("unfavorites a favorited page", () => {
    const id = usePageStore.getState().createPage();
    usePageStore.getState().toggleFavorite(id);
    usePageStore.getState().toggleFavorite(id);
    expect(usePageStore.getState().pages[id].favorited).toBe(false);
  });
});

describe("pages store — toggleExpand", () => {
  beforeEach(resetStore);

  it("expands a collapsed page", () => {
    const id = usePageStore.getState().createPage();
    usePageStore.getState().toggleExpand(id);
    expect(usePageStore.getState().expandedIds).toContain(id);
  });

  it("collapses an expanded page", () => {
    const id = usePageStore.getState().createPage();
    usePageStore.getState().toggleExpand(id);
    usePageStore.getState().toggleExpand(id);
    expect(usePageStore.getState().expandedIds).not.toContain(id);
  });
});

describe("pages store — updateCover / updateIcon", () => {
  beforeEach(resetStore);

  it("sets and clears a cover", () => {
    const id = usePageStore.getState().createPage();
    usePageStore.getState().updateCover(id, "aurora");
    expect(usePageStore.getState().pages[id].cover).toBe("aurora");
    usePageStore.getState().updateCover(id, null);
    expect(usePageStore.getState().pages[id].cover).toBeNull();
  });

  it("updates the icon", () => {
    const id = usePageStore.getState().createPage();
    usePageStore.getState().updateIcon(id, "🚀");
    expect(usePageStore.getState().pages[id].icon).toBe("🚀");
  });
});
