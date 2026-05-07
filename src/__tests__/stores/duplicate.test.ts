import { describe, it, expect, beforeEach } from "vitest";
import { usePageStore } from "../../store/pages";

function resetStore() {
  usePageStore.setState({ pages: {}, activePageId: null, expandedIds: [], recentPageIds: [] });
}

describe("duplicatePage", () => {
  beforeEach(resetStore);

  it("creates a new page with a different id", () => {
    const id = usePageStore.getState().createPage();
    const cloneId = usePageStore.getState().duplicatePage(id);
    expect(cloneId).not.toBe(id);
    expect(usePageStore.getState().pages[cloneId]).toBeDefined();
  });

  it("copies title with '(copy)' suffix", () => {
    const id = usePageStore.getState().createPage();
    usePageStore.getState().updateTitle(id, "My Page");
    const cloneId = usePageStore.getState().duplicatePage(id);
    expect(usePageStore.getState().pages[cloneId].title).toBe("My Page (copy)");
  });

  it("preserves the same parentId as the source", () => {
    const parentId = usePageStore.getState().createPage();
    const childId = usePageStore.getState().createPage(parentId);
    const cloneId = usePageStore.getState().duplicatePage(childId);
    expect(usePageStore.getState().pages[cloneId].parentId).toBe(parentId);
  });

  it("does not copy the favorited flag", () => {
    const id = usePageStore.getState().createPage();
    usePageStore.getState().toggleFavorite(id);
    const cloneId = usePageStore.getState().duplicatePage(id);
    expect(usePageStore.getState().pages[cloneId].favorited).toBe(false);
  });

  it("sets the duplicate as active", () => {
    const id = usePageStore.getState().createPage();
    const cloneId = usePageStore.getState().duplicatePage(id);
    expect(usePageStore.getState().activePageId).toBe(cloneId);
  });
});
