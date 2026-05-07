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
