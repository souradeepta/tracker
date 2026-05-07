import { describe, it, expect, vi, afterEach } from "vitest";
import { exportPageAsMarkdown, pageToMarkdown } from "../../lib/exportMarkdown";
import type { Page, PartialBlock } from "../../types";
import type { PartialBlock as BNPartialBlock } from "@blocknote/core";

function makePage(overrides: Partial<Page> = {}): Page {
  return {
    id: "test-id",
    title: "Test Page",
    content: [],
    parentId: null,
    icon: "📄",
    cover: null,
    favorited: false,
    deleted: false,
    deletedAt: null,
    locked: false,
    tags: [],
    status: "none",
    priority: "none",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  };
}

// ─── pageToMarkdown — pure function, no mocking needed ───────────────────
describe("pageToMarkdown", () => {
  it("starts with the page title as a level-1 heading", () => {
    const md = pageToMarkdown(makePage({ title: "Design Doc" }));
    expect(md).toMatch(/^# Design Doc/);
  });

  it("renders a heading block at the correct level", () => {
    const content = [
      { type: "heading", props: { level: 2 }, content: [{ type: "text", text: "Overview", styles: {} }] },
    ] as BNPartialBlock[];
    const md = pageToMarkdown(makePage({ content }));
    expect(md).toContain("## Overview");
  });

  it("renders a bullet list item", () => {
    const content = [
      { type: "bulletListItem", content: [{ type: "text", text: "Item A", styles: {} }] },
    ] as BNPartialBlock[];
    expect(pageToMarkdown(makePage({ content }))).toContain("- Item A");
  });

  it("renders a checked checkbox", () => {
    const content = [
      { type: "checkListItem", props: { checked: true }, content: [{ type: "text", text: "Done", styles: {} }] },
    ] as BNPartialBlock[];
    expect(pageToMarkdown(makePage({ content }))).toContain("- [x] Done");
  });

  it("renders an unchecked checkbox", () => {
    const content = [
      { type: "checkListItem", props: { checked: false }, content: [{ type: "text", text: "Todo", styles: {} }] },
    ] as BNPartialBlock[];
    expect(pageToMarkdown(makePage({ content }))).toContain("- [ ] Todo");
  });

  it("renders bold text with ** markers", () => {
    const content = [
      { type: "paragraph", content: [{ type: "text", text: "Hello", styles: { bold: true } }] },
    ] as BNPartialBlock[];
    expect(pageToMarkdown(makePage({ content }))).toContain("**Hello**");
  });

  it("renders a numbered list item", () => {
    const content = [
      { type: "numberedListItem", content: [{ type: "text", text: "First", styles: {} }] },
    ] as BNPartialBlock[];
    expect(pageToMarkdown(makePage({ content }))).toContain("1. First");
  });

  it("renders a code block with fences", () => {
    const content = [
      { type: "codeBlock", content: [{ type: "text", text: "const x = 1", styles: {} }] },
    ] as BNPartialBlock[];
    const md = pageToMarkdown(makePage({ content }));
    expect(md).toContain("```");
    expect(md).toContain("const x = 1");
  });
});

// ─── exportPageAsMarkdown — DOM side effects only ────────────────────────
describe("exportPageAsMarkdown", () => {
  afterEach(() => vi.restoreAllMocks());

  it("triggers a file download via anchor click", () => {
    const clickSpy = vi.fn();
    vi.spyOn(document, "createElement").mockReturnValue({
      click: clickSpy,
      href: "",
      download: "",
    } as unknown as HTMLAnchorElement);
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:test");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});

    exportPageAsMarkdown(makePage());
    expect(clickSpy).toHaveBeenCalledOnce();
  });

  it("sets the download filename from the page title", () => {
    let downloadAttr = "";
    vi.spyOn(document, "createElement").mockReturnValue({
      click: vi.fn(),
      href: "",
      get download() { return downloadAttr; },
      set download(v: string) { downloadAttr = v; },
    } as unknown as HTMLAnchorElement);
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:test");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});

    exportPageAsMarkdown(makePage({ title: "My Notes" }));
    expect(downloadAttr).toBe("My Notes.md");
  });

  it("falls back to 'untitled.md' when the page title is empty", () => {
    let downloadAttr = "";
    vi.spyOn(document, "createElement").mockReturnValue({
      click: vi.fn(),
      href: "",
      get download() { return downloadAttr; },
      set download(v: string) { downloadAttr = v; },
    } as unknown as HTMLAnchorElement);
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:test");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});

    exportPageAsMarkdown(makePage({ title: "" }));
    expect(downloadAttr).toBe("untitled.md");
  });
});
