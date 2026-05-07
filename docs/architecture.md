# Architecture

Technical architecture reference for the Notion-clone web app.

---

## Table of Contents

1. [High-Level System Diagram](#high-level-system-diagram)
2. [Data Model](#data-model)
3. [Component Hierarchy](#component-hierarchy)
4. [State Flow](#state-flow)
5. [Key Design Decisions and Trade-offs](#key-design-decisions-and-trade-offs)
6. [Future Scalability Considerations](#future-scalability-considerations)

---

## High-Level System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser                                 │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                      React App                           │  │
│  │                                                          │  │
│  │  ┌─────────────┐  ┌──────────────────┐  ┌────────────┐  │  │
│  │  │   Sidebar   │  │     Editor       │  │  Search    │  │  │
│  │  │             │  │                  │  │  Modal     │  │  │
│  │  │ PageItem(s) │  │ Cover            │  │            │  │  │
│  │  │ TrashSection│  │ Breadcrumbs      │  └────────────┘  │  │
│  │  └──────┬──────┘  │ IconPicker       │                  │  │
│  │         │         │ BlockNoteView    │                  │  │
│  │         │         │ WordCount        │                  │  │
│  │         │         │ TableOfContents  │                  │  │
│  │         │         └────────┬─────────┘                  │  │
│  │         │                  │                             │  │
│  │  ┌──────▼──────────────────▼───────────────────────┐    │  │
│  │  │              Zustand Stores                      │    │  │
│  │  │                                                  │    │  │
│  │  │  usePageStore          useSettingsStore          │    │  │
│  │  │  ─────────────         ───────────────           │    │  │
│  │  │  pages: Record<id,Page>  dark: boolean           │    │  │
│  │  │  activePageId            sidebarWidth            │    │  │
│  │  │  expandedIds             toggleDark()            │    │  │
│  │  │  createPage()            setSidebarWidth()       │    │  │
│  │  │  trashPage()                                     │    │  │
│  │  │  updateContent()                                 │    │  │
│  │  │  … (12 actions total)                            │    │  │
│  │  └──────────────────────┬───────────────────────────┘    │  │
│  │                         │  Zustand persist middleware     │  │
│  └─────────────────────────┼────────────────────────────────┘  │
│                            │                                    │
│  ┌─────────────────────────▼────────────────────────────────┐  │
│  │                    localStorage                           │  │
│  │                                                          │  │
│  │  "notion-clone-pages"    "notion-clone-settings"         │  │
│  │  { pages, activePageId,  { dark, sidebarWidth }          │  │
│  │    expandedIds }                                         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

External library surface:
  BlockNote 0.50  ──►  block parsing / serialisation / editor UI
  Mantine 9       ──►  MantineProvider (CSS vars, theming for BlockNote)
  Tailwind CSS 4  ──►  utility class styling for all custom components
  Lucide React    ──►  SVG icon set
  uuid v14        ──►  RFC 4122 UUID generation for page ids
```

---

## Data Model

### `Page` — `src/types.ts`

```ts
interface Page {
  id: string;           // UUID v4, generated at creation time
  title: string;        // editable page title; defaults to "Untitled"
  content: PartialBlock[]; // BlockNote document; serialised as JSON
  parentId: string | null; // null = root-level page
  icon: string;         // single emoji character
  cover: string | null; // key into COVERS map in Cover.tsx, or null
  favorited: boolean;   // whether starred in sidebar
  deleted: boolean;     // soft-delete flag
  deletedAt: number | null; // Unix ms timestamp of deletion, or null
  createdAt: number;    // Unix ms timestamp of creation
  updatedAt: number;    // Unix ms timestamp of last content/title/icon/cover change
}
```

`PartialBlock` is BlockNote's own type representing one block node (paragraph, heading, list item, etc.) with optional children. It is an opaque JSON-serialisable tree that BlockNote can both produce and consume.

### Page tree structure

Pages form an **n-ary tree** stored as a **flat adjacency list** (`Record<string, Page>`). The tree is reconstructed at render time by filtering on `parentId`. There is no separate tree node or edge record.

- Root pages: `parentId === null`.
- Child pages: `parentId === <some uuid>`.
- Deleted pages: `deleted === true`; they remain in the map and are filtered out of live views.

This flat map approach means:
- O(1) lookup by id (common in all update actions).
- O(n) scan to find children (acceptable for typical workspace sizes).
- No referential integrity enforcement — a page may reference a `parentId` that belongs to a deleted page.

### Store shapes

**`usePageStore`** (`src/store/pages.ts`):

```ts
{
  pages: Record<string, Page>;
  activePageId: string | null;
  expandedIds: string[];         // ids of sidebar nodes that are open
}
```

**`useSettingsStore`** (`src/store/settings.ts`):

```ts
{
  dark: boolean;
  sidebarWidth: number;  // pixels, clamped [160, 480]
}
```

### localStorage serialisation

Both stores use the Zustand `persist` middleware. On every `set` call, the middleware calls `JSON.stringify` on the (partialised) state and writes it to `localStorage`. On app load, it calls `JSON.parse` and merges the result with the initial state using a shallow merge (Zustand default).

Key names:
- `notion-clone-pages` — pages store
- `notion-clone-settings` — settings store

The `partialize` function in `usePageStore` explicitly whitelists `pages`, `activePageId`, and `expandedIds`, ensuring action callbacks (functions) are never serialised.

---

## Component Hierarchy

```
App
├── MantineProvider          ← Mantine CSS-variable context (required by BlockNoteView)
│   ├── Sidebar
│   │   ├── [workspace header]
│   │   │   ├── [dark mode toggle]
│   │   │   └── [search button → opens SearchModal]
│   │   ├── [Favorites section]
│   │   │   └── PageItem (depth=0) × n
│   │   ├── [Pages section]
│   │   │   └── PageItem (depth=0) × n
│   │   │       └── PageItem (depth=1) × n   ← recursive
│   │   ├── TrashSection
│   │   └── [resize handle]
│   │
│   ├── Editor
│   │   ├── Cover
│   │   │   └── CoverPicker (conditional)
│   │   ├── [scrollable body]
│   │   │   ├── Breadcrumbs
│   │   │   ├── IconPicker
│   │   │   ├── [title <textarea>]
│   │   │   └── BlockNoteView   ← BlockNote editor instance
│   │   ├── [footer: WordCount + export button]
│   │   └── TableOfContents
│   │
│   └── SearchModal (conditional, portal-like fixed overlay)
```

All components are function components. Sub-components (`PageItem`, `TrashSection`, `IconPicker`, `WordCount`, `CoverPicker`) are not exported and live in the same file as their nearest consumer.

---

## State Flow

### Reading state

Components subscribe to Zustand stores using the hook:

```ts
const { pages, activePageId } = usePageStore();
```

Zustand's default selector is identity-equal — the component re-renders whenever any part of the store object reference changes. For high-frequency updates (content changes) this is acceptable because the `Editor` component is the only subscriber to `content` and re-renders are cheap.

### Writing state

User interactions → event handlers → store action calls → Zustand `set` → React re-render + localStorage write.

```
User clicks "+ sub-page"
  → PageItem onClick handler
  → createPage(page.id)        ← store action
  → set({ pages: {...}, activePageId: newId, expandedIds: [...] })
  → Zustand notifies all subscribers
  → Sidebar re-renders (new page appears in tree)
  → Editor re-renders (new blank page loads)
  → localStorage["notion-clone-pages"] updated
```

### Debounced writes

Title and content changes are debounced before calling store actions to avoid writing to localStorage on every keystroke:

| Field | Debounce delay | Reason |
|---|---|---|
| `title` | 300 ms | Title changes are short bursts; 300 ms catches end-of-word pauses |
| `content` | 500 ms | Block-level changes can be expensive to serialise; 500 ms balances durability vs. overhead |

The debounce is implemented with `useRef<ReturnType<typeof setTimeout>>` and `clearTimeout`/`setTimeout` in the event handlers `handleTitleChange` and `handleEditorChange` in `src/components/Editor.tsx`.

### Dark mode side effect

`useSettingsStore.toggleDark` directly mutates `document.documentElement.classList` as part of the Zustand action. This is an intentional side effect inside the store to keep the class in sync without needing a separate `useEffect`. `App.tsx` also runs a `useEffect` on `dark` to re-apply the class on initial mount (since the DOM mutation in the store only fires when `toggleDark` is called, not on hydration from localStorage).

### BlockNote editor lifecycle

`useCreateBlockNote` is called with `[activePageId]` as the dependency array. Each time the active page changes, a new editor instance is created with the stored `content` of the incoming page as `initialContent`. The previous editor instance is discarded. This means:
- Unsaved (within the 500 ms debounce window) edits from the previous page are lost if you switch pages before the debounce fires.
- Each editor instance is completely isolated — there is no shared editor singleton.

---

## Key Design Decisions and Trade-offs

### 1. Flat adjacency list vs. nested tree

**Decision:** Pages are stored as `Record<string, Page>` with a `parentId` foreign key rather than as a nested tree.

**Trade-offs:**
- Pros: O(1) page lookup by id in all update actions; easy JSON serialisation; simpler Zustand state shape.
- Cons: Finding children requires O(n) scan of all pages; no built-in ordering (currently sorted by `createdAt` at render time); deleted pages accumulate in the map until explicitly purged.

### 2. Soft delete with manual purge

**Decision:** `trashPage` sets `deleted: true` rather than removing the page from the map. Pages are only removed by `permanentDelete` or `emptyTrash`.

**Trade-offs:**
- Pros: Recoverable trash with one-click restore; familiar Notion-like UX.
- Cons: Deleted pages consume localStorage space indefinitely until purged; no automatic expiry (the `deletedAt` timestamp is stored but never acted upon).

### 3. No backend — localStorage only

**Decision:** All persistence is via the browser's `localStorage` through Zustand's `persist` middleware.

**Trade-offs:**
- Pros: Zero infrastructure; works offline; no auth required; instant reads/writes.
- Cons: ~5–10 MB storage limit; no cross-device sync; data is lost on browser storage clear; no conflict resolution or versioning; not suitable for collaborative use.

### 4. New editor instance per page switch

**Decision:** `useCreateBlockNote` is called with `[activePageId]` as a dependency, creating a fresh instance each time the active page changes.

**Trade-offs:**
- Pros: Clean state isolation between pages; no risk of stale content showing from the previous page.
- Cons: Any edits within the 500 ms debounce window when switching pages are discarded; switching pages has a small instantiation cost.

### 5. Gradient-only covers (no image URL)

**Decision:** Covers are chosen from a fixed set of 12 CSS linear-gradient strings keyed by name.

**Trade-offs:**
- Pros: No external network requests; no image upload infrastructure; deterministic rendering.
- Cons: Limited visual variety; users cannot use custom images or colours.

### 6. Markdown export only (no import)

**Decision:** `src/lib/exportMarkdown.ts` exports but there is no import path.

**Trade-offs:**
- Pros: Simple implementation; no parsing ambiguity.
- Cons: No data portability in; backing up and restoring requires manual recreation.

### 7. MantineProvider wrapping

**Decision:** The entire app is wrapped in `<MantineProvider>` even though no Mantine components are used directly in custom code.

**Reason:** `BlockNoteView` from `@blocknote/mantine` requires Mantine's CSS variable context to render its toolbar and slash-menu correctly. Without `MantineProvider`, the editor's built-in UI would be unstyled.

---

## Future Scalability Considerations

### Adding a backend and real-time sync

The current architecture is entirely synchronous and client-local. Moving to a backend would require:

1. **API layer:** replace localStorage writes in the Zustand `persist` middleware with HTTP or WebSocket calls. The simplest migration is to add a `storage` option to `persist` that writes to a custom adapter:

   ```ts
   persist(factory, {
     name: "pages",
     storage: createJSONStorage(() => customApiStorage),
   })
   ```

2. **Conflict resolution:** real-time collaboration requires an operational transformation (OT) or CRDT layer. BlockNote's data format (`PartialBlock[]`) is not CRDT-aware out of the box, but BlockNote does expose a Y.js integration path (`@blocknote/yjs`) for this use case.

3. **Authentication:** a backend would introduce per-user namespacing. `activePageId` would need to be scoped per user session rather than stored globally.

### Image uploads

The current cover system uses CSS gradients. To support custom images:
- Add an `uploadImage` action that POSTs a `File` to a storage service and stores the returned URL in `page.cover`.
- The `COVERS` map lookup in `Cover.tsx` would need to fall back gracefully: `COVERS[cover] ?? cover` already handles this — any string that is not a known key is used as the raw CSS `background` value, so image URLs would work without other changes to the render path.

### Search improvements

The current search in `SearchModal.tsx` is a client-side title substring match. Improvements:
- **Full-text search:** index `page.content` blocks into a structure like Fuse.js or a Web Worker-based inverted index to search body text.
- **Search ranking:** weight title matches above body matches; weight recently-updated pages higher.
- **Backend search:** move to a server with a proper full-text search engine (e.g., PostgreSQL `tsvector`, Meilisearch, Typesense) as workspace size grows beyond localStorage limits.

### Automatic trash expiry

`Page.deletedAt` is stored but never read. A future enhancement could run a cleanup pass on app load:

```ts
// In usePageStore initialiser or a startup effect
const EXPIRY_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
Object.values(pages)
  .filter((p) => p.deleted && p.deletedAt && Date.now() - p.deletedAt > EXPIRY_MS)
  .forEach((p) => permanentDelete(p.id));
```

### Performance at scale

At hundreds of pages, O(n) child scans in `Sidebar.tsx` and `trashPage` will become noticeable. Mitigations:
- Pre-compute a `childrenMap: Record<string, string[]>` derived value in the store.
- Use Zustand's `subscribeWithSelector` middleware to avoid unnecessary re-renders in components that only care about a subset of `pages`.
- Virtualise the sidebar page list (e.g., `@tanstack/react-virtual`) if the tree grows large enough to cause scroll jank.

### Routing

Currently there is no client-side routing — the active page is determined entirely by `usePageStore.activePageId`. Adding `react-router-dom` (already installed as a dependency but unused) would enable:
- Shareable deep links to specific pages (`/page/:id`).
- Browser history navigation (back/forward buttons work correctly).
- The URL would serve as the source of truth for `activePageId` instead of the Zustand store.

### Import / data portability

A JSON import feature (reading the `notion-clone-pages` localStorage format from a file) would provide basic backup/restore without a backend. The store shape is already JSON-serialisable. An import action would need to merge or replace the existing `pages` map and handle id conflicts.
