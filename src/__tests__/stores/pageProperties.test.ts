/**
 * RED tests for page properties feature.
 * These must fail before implementation is written.
 */
import { describe, it, expect, beforeEach } from "vitest";
import { usePageStore } from "../../store/pages";

function resetStore() {
  usePageStore.setState({ pages: {}, activePageId: null, expandedIds: [] });
}

describe("page properties — tags", () => {
  beforeEach(resetStore);

  it("new page has an empty tags array", () => {
    const id = usePageStore.getState().createPage();
    expect(usePageStore.getState().pages[id].tags).toEqual([]);
  });

  it("addTag adds a tag to the page", () => {
    const id = usePageStore.getState().createPage();
    usePageStore.getState().addTag(id, "design");
    expect(usePageStore.getState().pages[id].tags).toContain("design");
  });

  it("addTag does not add duplicate tags", () => {
    const id = usePageStore.getState().createPage();
    usePageStore.getState().addTag(id, "design");
    usePageStore.getState().addTag(id, "design");
    expect(usePageStore.getState().pages[id].tags).toHaveLength(1);
  });

  it("removeTag removes a tag from the page", () => {
    const id = usePageStore.getState().createPage();
    usePageStore.getState().addTag(id, "design");
    usePageStore.getState().removeTag(id, "design");
    expect(usePageStore.getState().pages[id].tags).not.toContain("design");
  });
});

describe("page properties — status", () => {
  beforeEach(resetStore);

  it("new page has status 'none'", () => {
    const id = usePageStore.getState().createPage();
    expect(usePageStore.getState().pages[id].status).toBe("none");
  });

  it("setStatus updates the page status", () => {
    const id = usePageStore.getState().createPage();
    usePageStore.getState().setStatus(id, "in-progress");
    expect(usePageStore.getState().pages[id].status).toBe("in-progress");
  });

  it("setStatus accepts all valid status values", () => {
    const id = usePageStore.getState().createPage();
    const statuses = ["none", "todo", "in-progress", "done"] as const;
    for (const s of statuses) {
      usePageStore.getState().setStatus(id, s);
      expect(usePageStore.getState().pages[id].status).toBe(s);
    }
  });
});

describe("page properties — priority", () => {
  beforeEach(resetStore);

  it("new page has priority 'none'", () => {
    const id = usePageStore.getState().createPage();
    expect(usePageStore.getState().pages[id].priority).toBe("none");
  });

  it("setPriority updates the page priority", () => {
    const id = usePageStore.getState().createPage();
    usePageStore.getState().setPriority(id, "high");
    expect(usePageStore.getState().pages[id].priority).toBe("high");
  });
});
