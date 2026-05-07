import { describe, it, expect, beforeEach } from "vitest";
import { usePageStore } from "../../store/pages";
import { TEMPLATES, getTemplate } from "../../lib/templates";

function resetStore() {
  usePageStore.setState({ pages: {}, activePageId: null, expandedIds: [], recentPageIds: [] });
}

describe("templates registry", () => {
  it("exposes at least 5 templates", () => {
    expect(TEMPLATES.length).toBeGreaterThanOrEqual(5);
  });

  it("each template has a unique key", () => {
    const keys = TEMPLATES.map((t) => t.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("each template has name, icon, description, and content", () => {
    for (const t of TEMPLATES) {
      expect(t.name).toBeTruthy();
      expect(t.icon).toBeTruthy();
      expect(t.description).toBeTruthy();
      expect(Array.isArray(t.content)).toBe(true);
    }
  });

  it("getTemplate returns the template by key", () => {
    const t = getTemplate("meeting");
    expect(t).toBeDefined();
    expect(t?.key).toBe("meeting");
  });

  it("getTemplate returns undefined for unknown key", () => {
    expect(getTemplate("nonexistent-xyz")).toBeUndefined();
  });
});

describe("createFromTemplate store action", () => {
  beforeEach(resetStore);

  it("creates a page with the template's title and icon", () => {
    const id = usePageStore.getState().createFromTemplate("meeting");
    const page = usePageStore.getState().pages[id];
    expect(page).toBeDefined();
    expect(page.title).not.toBe("Untitled");
    expect(page.icon).toBeTruthy();
  });

  it("creates a page with non-empty content from the template", () => {
    const id = usePageStore.getState().createFromTemplate("meeting");
    const page = usePageStore.getState().pages[id];
    expect(page.content.length).toBeGreaterThan(0);
  });

  it("returns the new page id and sets it as active", () => {
    const id = usePageStore.getState().createFromTemplate("daily");
    expect(usePageStore.getState().activePageId).toBe(id);
  });

  it("returns null-like for unknown template key and creates a blank page", () => {
    const id = usePageStore.getState().createFromTemplate("unknown-key-xyz");
    expect(usePageStore.getState().pages[id]).toBeDefined();
    expect(usePageStore.getState().pages[id].title).toBe("Untitled");
  });
});
