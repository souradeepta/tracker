import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../lib/db", () => ({
  db: {
    pages: {
      bulkPut: vi.fn().mockRejectedValue(new Error("IndexedDB unavailable")),
      toArray: vi.fn().mockRejectedValue(new Error("IndexedDB unavailable")),
      put: vi.fn().mockResolvedValue(undefined),
    },
    nav: {
      get: vi.fn().mockRejectedValue(new Error("IndexedDB unavailable")),
      put: vi.fn().mockResolvedValue(undefined),
    },
  },
}));

import { usePageStore } from "../../store/pages";

describe("IndexedDB initialization fallback", () => {
  beforeEach(() => {
    vi.stubGlobal("indexedDB", {} as IDBFactory);
    usePageStore.setState({ pages: {}, activePageId: null, expandedIds: [], recentPageIds: [], loaded: false });
  });

  it("loads an in-memory onboarding page when database access fails", async () => {
    await usePageStore.getState().initializeIfEmpty();

    const { loaded, pages } = usePageStore.getState();
    expect(loaded).toBe(true);
    expect(Object.values(pages)).toHaveLength(1);
    expect(Object.values(pages)[0].title).toBe("Getting Started");
  });
});
