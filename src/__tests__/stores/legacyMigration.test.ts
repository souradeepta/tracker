import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  bulkPut: vi.fn(),
  pagesToArray: vi.fn(),
  navPut: vi.fn(),
  navGet: vi.fn(),
}));

vi.mock("../../lib/db", () => ({
  db: {
    pages: {
      bulkPut: mocks.bulkPut,
      toArray: mocks.pagesToArray,
      put: vi.fn().mockResolvedValue(undefined),
    },
    nav: {
      put: mocks.navPut,
      get: mocks.navGet,
    },
  },
}));

import { usePageStore } from "../../store/pages";

const page = {
  id: "legacy-page",
  title: "Migrated page",
  content: [],
  parentId: null,
  icon: "📄",
  cover: null,
  favorited: false,
  deleted: false,
  deletedAt: null,
  locked: false,
  description: "",
  tags: [],
  status: "none" as const,
  priority: "none" as const,
  createdAt: 1,
  updatedAt: 1,
};

describe("legacy page migration", () => {
  beforeEach(() => {
    vi.stubGlobal("indexedDB", {} as IDBFactory);
    localStorage.clear();
    mocks.bulkPut.mockResolvedValue(undefined);
    mocks.pagesToArray.mockResolvedValue([page]);
    mocks.navPut.mockResolvedValue(undefined);
    mocks.navGet.mockResolvedValue({ key: "state", activePageId: page.id, expandedIds: [], recentPageIds: [page.id] });
    usePageStore.setState({ pages: {}, activePageId: null, expandedIds: [], recentPageIds: [], loaded: false });
  });

  it("copies legacy pages and navigation into IndexedDB state", async () => {
    localStorage.setItem("notion-clone-pages", JSON.stringify({
      state: {
        pages: { [page.id]: page },
        activePageId: page.id,
        expandedIds: [],
        recentPageIds: [page.id],
      },
    }));

    await usePageStore.getState().initializeIfEmpty();

    expect(mocks.bulkPut).toHaveBeenCalledWith([page]);
    expect(mocks.navPut).toHaveBeenCalledWith({
      key: "state",
      activePageId: page.id,
      expandedIds: [],
      recentPageIds: [page.id],
    });
    expect(usePageStore.getState().pages[page.id].title).toBe("Migrated page");
    expect(usePageStore.getState().activePageId).toBe(page.id);
    expect(localStorage.getItem("notion-clone-pages")).toBeNull();
  });

  it("preserves malformed legacy data instead of deleting it", async () => {
    mocks.pagesToArray.mockResolvedValue([]);
    mocks.navGet.mockResolvedValue(undefined);
    localStorage.setItem("notion-clone-pages", "not valid JSON");

    await usePageStore.getState().initializeIfEmpty();

    expect(localStorage.getItem("notion-clone-pages")).toBe("not valid JSON");
    expect(usePageStore.getState().loaded).toBe(true);
    expect(Object.values(usePageStore.getState().pages)).toHaveLength(1);
  });

  it("fills defaults for legacy records missing newer fields", async () => {
    const legacyPage = { id: page.id, title: "Older page", content: [] };
    mocks.pagesToArray.mockResolvedValue([legacyPage]);
    mocks.navGet.mockResolvedValue({ key: "state", activePageId: page.id, expandedIds: [], recentPageIds: [] });

    localStorage.setItem("notion-clone-pages", JSON.stringify({ state: { pages: { [page.id]: legacyPage } } }));
    await usePageStore.getState().initializeIfEmpty();

    const migrated = usePageStore.getState().pages[page.id];
    expect(migrated.description).toBe("");
    expect(migrated.tags).toEqual([]);
    expect(migrated.locked).toBe(false);
    expect(migrated.status).toBe("none");
    expect(migrated.priority).toBe("none");
  });
});
