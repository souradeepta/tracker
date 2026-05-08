import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import type { PartialBlock } from "@blocknote/core";
import type { Page, PageStatus, PagePriority } from "../types";
import { getTemplate } from "../lib/templates";

const ICONS = ["📄", "📝", "📌", "🗒️", "📋", "🔖", "💡", "🎯", "📚", "🗂️"];
const MAX_RECENTS = 10;

interface PageStore {
  pages: Record<string, Page>;
  activePageId: string | null;
  expandedIds: string[];
  recentPageIds: string[];

  // CRUD
  createPage: (parentId?: string | null, overrides?: Partial<Page>) => string;
  trashPage: (id: string) => void;
  restorePage: (id: string) => void;
  permanentDelete: (id: string) => void;
  emptyTrash: () => void;
  duplicatePage: (id: string) => string;
  createFromTemplate: (templateKey: string, parentId?: string | null) => string;

  // Updates
  updateTitle: (id: string, title: string) => void;
  updateDescription: (id: string, description: string) => void;
  updateIcon: (id: string, icon: string) => void;
  updateCover: (id: string, cover: string | null) => void;
  updateContent: (id: string, content: PartialBlock[]) => void;
  toggleLocked: (id: string) => void;

  // Properties
  addTag: (id: string, tag: string) => void;
  removeTag: (id: string, tag: string) => void;
  setStatus: (id: string, status: PageStatus) => void;
  setPriority: (id: string, priority: PagePriority) => void;

  // Navigation
  setActive: (id: string | null) => void;
  toggleExpand: (id: string) => void;

  // Favorites
  toggleFavorite: (id: string) => void;

  // Derived / selectors
  getAllTags: () => string[];

  // Onboarding
  initializeIfEmpty: () => void;
}

function newPage(overrides?: Partial<Page>): Page {
  const icon = ICONS[Math.floor(Math.random() * ICONS.length)];
  return {
    id: uuidv4(),
    title: "Untitled",
    content: [],
    parentId: null,
    icon,
    cover: null,
    favorited: false,
    deleted: false,
    deletedAt: null,
    locked: false,
    description: "",
    tags: [],
    status: "none",
    priority: "none",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  };
}

export const usePageStore = create<PageStore>()(
  persist(
    (set) => ({
      pages: {},
      activePageId: null,
      expandedIds: [],
      recentPageIds: [],

      createPage: (parentId = null, overrides = {}) => {
        const page = newPage({ ...overrides, parentId: parentId ?? null, id: uuidv4() });
        set((state) => ({
          pages: { ...state.pages, [page.id]: page },
          activePageId: page.id,
          recentPageIds: [page.id, ...state.recentPageIds.filter((id) => id !== page.id)].slice(0, MAX_RECENTS),
          expandedIds:
            parentId && !state.expandedIds.includes(parentId)
              ? [...state.expandedIds, parentId]
              : state.expandedIds,
        }));
        return page.id;
      },

      duplicatePage: (id) => {
        const src = usePageStore.getState().pages[id];
        if (!src) return id;
        const clone = newPage({
          ...src,
          id: uuidv4(),
          title: `${src.title} (copy)`,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          favorited: false,
        });
        set((state) => ({
          pages: { ...state.pages, [clone.id]: clone },
          activePageId: clone.id,
          recentPageIds: [clone.id, ...state.recentPageIds].slice(0, MAX_RECENTS),
        }));
        return clone.id;
      },

      createFromTemplate: (templateKey, parentId = null) => {
        const tpl = getTemplate(templateKey);
        const page = newPage({
          id: uuidv4(),
          parentId: parentId ?? null,
          title: tpl?.name ?? "Untitled",
          icon: tpl?.icon ?? "📄",
          content: tpl?.content ?? [],
        });
        set((state) => ({
          pages: { ...state.pages, [page.id]: page },
          activePageId: page.id,
          recentPageIds: [page.id, ...state.recentPageIds].slice(0, MAX_RECENTS),
        }));
        return page.id;
      },

      trashPage: (id) => {
        set((state) => {
          const trashRecursive = (pages: Record<string, Page>, pageId: string) => {
            pages[pageId] = { ...pages[pageId], deleted: true, deletedAt: Date.now() };
            Object.values(pages)
              .filter((p) => p.parentId === pageId && !p.deleted)
              .forEach((p) => trashRecursive(pages, p.id));
          };
          const newPages = { ...state.pages };
          trashRecursive(newPages, id);

          const liveIds = Object.values(newPages).filter((p) => !p.deleted).map((p) => p.id);
          const newActive =
            state.activePageId && newPages[state.activePageId]?.deleted
              ? liveIds[0] ?? null
              : state.activePageId;

          return { pages: newPages, activePageId: newActive };
        });
      },

      restorePage: (id) =>
        set((state) => ({
          pages: { ...state.pages, [id]: { ...state.pages[id], deleted: false, deletedAt: null } },
        })),

      permanentDelete: (id) => {
        set((state) => {
          const newPages = { ...state.pages };
          const deleteRecursive = (pageId: string) => {
            Object.values(newPages)
              .filter((p) => p.parentId === pageId)
              .forEach((p) => deleteRecursive(p.id));
            delete newPages[pageId];
          };
          deleteRecursive(id);
          const newActive =
            state.activePageId === id ? Object.keys(newPages)[0] ?? null : state.activePageId;
          return { pages: newPages, activePageId: newActive };
        });
      },

      emptyTrash: () =>
        set((state) => ({
          pages: Object.fromEntries(Object.entries(state.pages).filter(([, p]) => !p.deleted)),
        })),

      updateTitle: (id, title) =>
        set((state) => ({
          pages: { ...state.pages, [id]: { ...state.pages[id], title, updatedAt: Date.now() } },
        })),

      updateDescription: (id, description) =>
        set((state) => ({
          pages: { ...state.pages, [id]: { ...state.pages[id], description, updatedAt: Date.now() } },
        })),

      updateIcon: (id, icon) =>
        set((state) => ({
          pages: { ...state.pages, [id]: { ...state.pages[id], icon, updatedAt: Date.now() } },
        })),

      updateCover: (id, cover) =>
        set((state) => ({
          pages: { ...state.pages, [id]: { ...state.pages[id], cover, updatedAt: Date.now() } },
        })),

      updateContent: (id, content) =>
        set((state) => ({
          pages: { ...state.pages, [id]: { ...state.pages[id], content, updatedAt: Date.now() } },
        })),

      toggleLocked: (id) =>
        set((state) => ({
          pages: { ...state.pages, [id]: { ...state.pages[id], locked: !state.pages[id].locked, updatedAt: Date.now() } },
        })),

      addTag: (id, tag) =>
        set((state) => {
          const existing = state.pages[id]?.tags ?? [];
          if (existing.includes(tag)) return state;
          return {
            pages: { ...state.pages, [id]: { ...state.pages[id], tags: [...existing, tag], updatedAt: Date.now() } },
          };
        }),

      removeTag: (id, tag) =>
        set((state) => ({
          pages: {
            ...state.pages,
            [id]: { ...state.pages[id], tags: state.pages[id].tags.filter((t) => t !== tag), updatedAt: Date.now() },
          },
        })),

      setStatus: (id, status) =>
        set((state) => ({
          pages: { ...state.pages, [id]: { ...state.pages[id], status, updatedAt: Date.now() } },
        })),

      setPriority: (id, priority) =>
        set((state) => ({
          pages: { ...state.pages, [id]: { ...state.pages[id], priority, updatedAt: Date.now() } },
        })),

      setActive: (id) =>
        set((state) => ({
          activePageId: id,
          recentPageIds: id
            ? [id, ...state.recentPageIds.filter((r) => r !== id)].slice(0, MAX_RECENTS)
            : state.recentPageIds,
        })),

      toggleExpand: (id) =>
        set((state) => ({
          expandedIds: state.expandedIds.includes(id)
            ? state.expandedIds.filter((eid) => eid !== id)
            : [...state.expandedIds, id],
        })),

      toggleFavorite: (id) =>
        set((state) => ({
          pages: { ...state.pages, [id]: { ...state.pages[id], favorited: !state.pages[id].favorited } },
        })),

      getAllTags: () => {
        const { pages } = usePageStore.getState();
        const tagSet = new Set<string>();
        Object.values(pages).filter((p) => !p.deleted).forEach((p) => p.tags.forEach((t) => tagSet.add(t)));
        return Array.from(tagSet).sort();
      },

      initializeIfEmpty: () => {
        const { pages, createPage, updateContent } = usePageStore.getState();
        if (Object.keys(pages).length > 0) return;
        const id = createPage(null, { title: "Getting Started", icon: "🚀" });
        updateContent(id, [
          { type: "heading", props: { level: 1, textAlignment: "left", textColor: "default", backgroundColor: "default" }, content: [{ type: "text", text: "Welcome to Tracker 👋", styles: {} }], children: [] },
          { type: "paragraph", props: { textAlignment: "left", textColor: "default", backgroundColor: "default" }, content: [{ type: "text", text: "Tracker is your personal knowledge workspace — a place to capture ideas, track projects, and organize your thoughts.", styles: {} }], children: [] },
          { type: "heading", props: { level: 2, textAlignment: "left", textColor: "default", backgroundColor: "default" }, content: [{ type: "text", text: "Quick start", styles: {} }], children: [] },
          { type: "bulletListItem", props: { textAlignment: "left", textColor: "default", backgroundColor: "default" }, content: [{ type: "text", text: "Press ", styles: {} }, { type: "text", text: "⌘N", styles: { bold: true } }, { type: "text", text: " to create a new page from anywhere.", styles: {} }], children: [] },
          { type: "bulletListItem", props: { textAlignment: "left", textColor: "default", backgroundColor: "default" }, content: [{ type: "text", text: "Press ", styles: {} }, { type: "text", text: "⌘K", styles: { bold: true } }, { type: "text", text: " to search across all your pages.", styles: {} }], children: [] },
          { type: "bulletListItem", props: { textAlignment: "left", textColor: "default", backgroundColor: "default" }, content: [{ type: "text", text: "Type ", styles: {} }, { type: "text", text: "/", styles: { bold: true } }, { type: "text", text: " inside any page to insert headings, lists, code blocks, and more.", styles: {} }], children: [] },
          { type: "bulletListItem", props: { textAlignment: "left", textColor: "default", backgroundColor: "default" }, content: [{ type: "text", text: "Right-click any page in the sidebar to duplicate, favorite, lock, or delete it.", styles: {} }], children: [] },
          { type: "heading", props: { level: 2, textAlignment: "left", textColor: "default", backgroundColor: "default" }, content: [{ type: "text", text: "Keyboard shortcuts", styles: {} }], children: [] },
          { type: "bulletListItem", props: { textAlignment: "left", textColor: "default", backgroundColor: "default" }, content: [{ type: "text", text: "⌘⇧F", styles: { bold: true } }, { type: "text", text: "  — Focus mode (distraction-free writing)", styles: {} }], children: [] },
          { type: "bulletListItem", props: { textAlignment: "left", textColor: "default", backgroundColor: "default" }, content: [{ type: "text", text: "⌘⇧B", styles: { bold: true } }, { type: "text", text: "  — Toggle Board / Kanban view", styles: {} }], children: [] },
          { type: "bulletListItem", props: { textAlignment: "left", textColor: "default", backgroundColor: "default" }, content: [{ type: "text", text: "⌘⇧T", styles: { bold: true } }, { type: "text", text: "  — Open template gallery", styles: {} }], children: [] },
          { type: "bulletListItem", props: { textAlignment: "left", textColor: "default", backgroundColor: "default" }, content: [{ type: "text", text: "⌘⇧G", styles: { bold: true } }, { type: "text", text: "  — Open tag browser", styles: {} }], children: [] },
          { type: "bulletListItem", props: { textAlignment: "left", textColor: "default", backgroundColor: "default" }, content: [{ type: "text", text: "⌘⇧D", styles: { bold: true } }, { type: "text", text: "  — Toggle dark mode", styles: {} }], children: [] },
          { type: "heading", props: { level: 2, textAlignment: "left", textColor: "default", backgroundColor: "default" }, content: [{ type: "text", text: "Power features", styles: {} }], children: [] },
          { type: "bulletListItem", props: { textAlignment: "left", textColor: "default", backgroundColor: "default" }, content: [{ type: "text", text: "Add a ", styles: {} }, { type: "text", text: "cover image", styles: { bold: true } }, { type: "text", text: " to personalize any page — click the icon above the title.", styles: {} }], children: [] },
          { type: "bulletListItem", props: { textAlignment: "left", textColor: "default", backgroundColor: "default" }, content: [{ type: "text", text: "Set ", styles: {} }, { type: "text", text: "status & priority", styles: { bold: true } }, { type: "text", text: " on pages, then view them in the Kanban board.", styles: {} }], children: [] },
          { type: "bulletListItem", props: { textAlignment: "left", textColor: "default", backgroundColor: "default" }, content: [{ type: "text", text: "Use ", styles: {} }, { type: "text", text: "tags", styles: { bold: true } }, { type: "text", text: " to cross-link pages across topics (⌘⇧G to browse).", styles: {} }], children: [] },
          { type: "bulletListItem", props: { textAlignment: "left", textColor: "default", backgroundColor: "default" }, content: [{ type: "text", text: "Lock a page", styles: { bold: true } }, { type: "text", text: " to prevent accidental edits — click the lock icon in the footer.", styles: {} }], children: [] },
          { type: "paragraph", props: { textAlignment: "left", textColor: "default", backgroundColor: "default" }, content: [{ type: "text", text: "Feel free to delete this page whenever you're ready. Happy writing! ✨", styles: { italic: true } }], children: [] },
        ] as Parameters<typeof updateContent>[1]);
      },
    }),
    {
      name: "notion-clone-pages",
      partialize: (state) => ({
        pages: state.pages,
        activePageId: state.activePageId,
        expandedIds: state.expandedIds,
        recentPageIds: state.recentPageIds,
      }),
    }
  )
);
