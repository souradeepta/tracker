import { describe, it, expect, beforeEach } from "vitest";
import { usePageStore } from "../../store/pages";

function reset() {
  usePageStore.setState({ pages: {}, activePageId: null, expandedIds: [], recentPageIds: [] });
}

describe("initializeIfEmpty", () => {
  beforeEach(reset);

  it("creates a Getting Started page when the store has no pages", () => {
    usePageStore.getState().initializeIfEmpty();
    const pages = Object.values(usePageStore.getState().pages);
    expect(pages).toHaveLength(1);
    expect(pages[0].title).toBe("Getting Started");
  });

  it("sets the Getting Started page as active", () => {
    usePageStore.getState().initializeIfEmpty();
    const { activePageId, pages } = usePageStore.getState();
    expect(activePageId).toBe(Object.values(pages)[0].id);
  });

  it("does not create pages when pages already exist", () => {
    usePageStore.getState().createPage();
    const before = Object.keys(usePageStore.getState().pages).length;
    usePageStore.getState().initializeIfEmpty();
    expect(Object.keys(usePageStore.getState().pages)).toHaveLength(before);
  });

  it("is idempotent — calling twice does not add a second page", () => {
    usePageStore.getState().initializeIfEmpty();
    usePageStore.getState().initializeIfEmpty();
    expect(Object.keys(usePageStore.getState().pages)).toHaveLength(1);
  });
});
