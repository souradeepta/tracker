# Architecture

Technical architecture reference for the Notion-clone web app.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Data Model](#data-model)
3. [Component Hierarchy](#component-hierarchy)
4. [State Management Deep-Dive](#state-management-deep-dive)
5. [BlockNote Integration Deep-Dive](#blocknote-integration-deep-dive)
6. [Rendering Strategy](#rendering-strategy)
7. [Key Design Decisions](#key-design-decisions)
8. [Performance Characteristics](#performance-characteristics)
9. [Security Considerations](#security-considerations)
10. [Future Roadmap](#future-roadmap)

---

## System Overview

The app is a **single-page application (SPA)** with no backend. All data flows between three layers: the React component tree, the Zustand state stores, and the browser's localStorage.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                               Browser Tab                                   │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                           React App                                   │  │
│  │  ┌────────────────┐  ┌──────────────────────────┐  ┌─────────────┐  │  │
│  │  │    Sidebar     │  │         Editor            │  │  SearchModal│  │  │
│  │  │                │  │                           │  │             │  │  │
│  │  │ RecentSection  │  │ PropertyPanel             │  │ (overlay)   │  │  │
│  │  │ Favorites list │  │ Cover                     │  └─────────────┘  │  │
│  │  │ PageItem tree  │  │ Breadcrumbs               │  ┌─────────────┐  │  │
│  │  │  └ recursive   │  │ IconPicker                │  │ Templates   │  │  │
│  │  │ TrashSection   │  │ title <textarea>          │  │ Modal       │  │  │
│  │  │ resize handle  │  │ BlockNoteView ──────────► │  │ (overlay)   │  │  │
│  │  └───────┬────────┘  │ WordCount     (onChange)  │  └─────────────┘  │  │
│  │          │           │ TableOfContents            │        │          │  │
│  │          │           └──────────┬────────────────┘        │          │  │
│  │          │                      │     ▲                    │          │  │
│  │          │    read / dispatch   │     │ re-render          │          │  │
│  │          ▼                      ▼     │                    ▼          │  │
│  │  ┌───────────────────────────────────────────────────────────────┐   │  │
│  │  │                       Zustand Stores                          │   │  │
│  │  │                                                               │   │  │
│  │  │   usePageStore                   useSettingsStore             │   │  │
│  │  │   ─────────────────────          ──────────────────           │   │  │
│  │  │   pages: Record<id, Page>        dark: boolean               │   │  │
│  │  │   activePageId: string|null      sidebarWidth: number        │   │  │
│  │  │   expandedIds: string[]          sidebarCollapsed: boolean   │   │  │
│  │  │   recentPageIds: string[]        toggleDark() ──► <html>     │   │  │
│  │  │   createPage()                   setSidebarWidth()           │   │  │
│  │  │   trashPage()                    toggleSidebarCollapsed()    │   │  │
│  │  │   duplicatePage()                                            │   │  │
│  │  │   createFromTemplate()                                       │   │  │
│  │  │   updateTitle()                                              │   │  │
│  │  │   updateContent()  ◄─── debounced (500ms)                   │   │  │
│  │  │   toggleLocked()                                             │   │  │
│  │  │   addTag() / removeTag()                                     │   │  │
│  │  │   setStatus() / setPriority()                               │   │  │
│  │  │   setActive()                                                │   │  │
│  │  │   toggleExpand()                                             │   │  │
│  │  │   toggleFavorite()                                           │   │  │
│  │  └────────────────────────────┬──────────────────────────────── ┘   │  │
│  │                               │  persist middleware                   │  │
│  │                               │  JSON.stringify on every set()        │  │
│  └───────────────────────────────┼───────────────────────────────────── ┘  │
│                                  ▼                                          │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                          localStorage                                  │  │
│  │                                                                        │  │
│  │   "notion-clone-pages"              "notion-clone-settings"            │  │
│  │   {                                 {                                  │  │
│  │     pages: { [uuid]: Page, ... },     dark: false,                    │  │
│  │     activePageId: "uuid"|null,        sidebarWidth: 240,              │  │
│  │     expandedIds: ["uuid", ...],       sidebarCollapsed: false         │  │
│  │     recentPageIds: ["uuid", ...]    }                                  │  │
│  │   }                                                                    │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  External library surface:                                                  │
│    BlockNote 0.50  ──► block parsing / serialisation / editor UI            │
│    Mantine 9       ──► MantineProvider (CSS vars for BlockNote UI)          │
│    Tailwind CSS 4  ──► utility class styling for all custom components      │
│    Lucide React    ──► SVG icon set (consistent 24×24 stroked icons)        │
│    uuid v14        ──► RFC 4122 UUID v4 generation for page ids             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Data flow direction

1. **User interaction** (click, keystroke) triggers an event handler in a component.
2. The handler calls a **Zustand store action**.
3. The action calls Zustand's `set(state => newState)`.
4. Zustand's **persist middleware** serialises the new state to localStorage.
5. Zustand **notifies all subscribers** (components that called `usePageStore()` or `useSettingsStore()`).
6. React **re-renders** the subscribing components.
7. The updated UI is painted.

The flow is strictly one-directional: interaction → store → localStorage → UI. There is no two-way binding and no derived state stored in the Zustand stores (derivations happen inline during render).

---

## Data Model

### `Page` — `src/types.ts`

```ts
interface Page {
  id: string;              // UUID v4; immutable after creation
  title: string;           // Editable page name; defaults to "Untitled"
  content: PartialBlock[]; // BlockNote document; serialised as JSON
  parentId: string | null; // null = root-level page; UUID = child of that page
  icon: string;            // Single emoji character
  cover: string | null;    // Key into COVERS map in Cover.tsx, or null
  favorited: boolean;      // Whether starred in sidebar Favorites section
  deleted: boolean;        // Soft-delete flag; true = page is in Trash
  deletedAt: number | null;// Unix ms timestamp of soft-deletion, or null
  locked: boolean;         // True = read-only (title + body editing disabled)
  tags: string[];          // Free-form lowercase label strings; no duplicates
  status: PageStatus;      // "none" | "todo" | "in-progress" | "done"
  priority: PagePriority;  // "none" | "low" | "medium" | "high"
  createdAt: number;       // Unix ms timestamp; set once at creation
  updatedAt: number;       // Unix ms timestamp; updated on every field mutation
}
```

`PartialBlock` is BlockNote's own type (`@blocknote/core`). It represents a single block node — paragraph, heading, list item, etc. — including its inline content (styled text runs) and optional nested blocks. It is fully JSON-serialisable, which is what allows it to be persisted in localStorage via Zustand.

### Template — `src/types.ts`

```ts
interface Template {
  key: string;             // Unique identifier; used by getTemplate() and createFromTemplate
  name: string;            // Display name shown in TemplatesModal
  icon: string;            // Emoji assigned as page icon when template is applied
  description: string;     // One-line description shown in TemplatesModal
  content: PartialBlock[]; // Pre-built block array that becomes the page body
}
```

Templates are source-code constants in `src/lib/templates.ts`. They are never persisted to localStorage.

### Why a flat map instead of a nested tree

The `pages` field in `usePageStore` is `Record<string, Page>` — a flat object keyed by UUID. The tree structure is encoded via the `parentId` foreign key on each `Page`. There is no explicit edge collection or nested children array.

**Benefits of the flat map:**
- O(1) page lookup by id in every store action (reading `pages[id]` is a single property access).
- Clean JSON serialisation — no circular references, no deeply nested structures that could strain `JSON.stringify`.
- Simple Zustand state shape — every action is a shallow spread of `pages` at the top level.
- Easy to add a page anywhere in the tree by setting its `parentId`, without restructuring any parent node.

**Trade-offs:**
- Finding children requires an O(n) scan: `Object.values(pages).filter(p => p.parentId === id)`. For the typical workspace (tens to low hundreds of pages), this is fast enough to be imperceptible.
- No built-in ordering. Children within the same parent are sorted by `createdAt` at render time.
- No referential integrity. If a parent page is deleted and a child is restored, the child's `parentId` points to a deleted page. The UI handles this gracefully by treating such children as root-level.

### Why soft delete instead of hard delete

`trashPage` sets `deleted: true` rather than removing the page from the `pages` map. Pages are only removed by `permanentDelete` or `emptyTrash`.

**Benefits:**
- Familiar Notion-like UX with a recoverable trash area.
- A single `restorePage` action brings the page back without any complex re-insertion logic.
- `deletedAt` is stored (Unix ms timestamp), enabling future features like automatic 30-day expiry.

**Trade-offs:**
- Deleted pages occupy localStorage space indefinitely until explicitly purged.
- The `Object.values(pages)` scans inside components include deleted pages and must filter them out.
- No automatic expiry currently — the `deletedAt` timestamp is stored but not acted upon.

### Why an adjacency list for hierarchy

The tree is stored as an adjacency list (each node stores a reference to its parent) rather than alternative representations:

| Representation | Pro | Con |
|---|---|---|
| Adjacency list (parentId) | O(1) lookup, simple mutations, used here | O(n) child scan |
| Nested children array | O(1) child lookup | Deep nesting in JSON, complex update logic for moves |
| Closure table (explicit ancestor rows) | O(1) ancestor queries | Complex schema, overkill without a database |
| Materialised path (/a/b/c) | Easy prefix queries | Path must be updated on every move |

For a client-side app with hundreds (not millions) of pages, the adjacency list with O(n) child scans is the right trade-off. The implementation is the simplest possible and easily understood.

---

## Component Hierarchy

Every node in this tree is a React function component. Internal sub-components are not exported from their file.

```
App (src/App.tsx)
│   Manages: modal open/close state (searchOpen, templatesOpen)
│   Attaches: global keydown listener (Cmd+K, Cmd+N, Cmd+Shift+D, Cmd+Shift+T)
│   Provides: handleExport callback (reads page from store, calls exportPageAsMarkdown)
│
└── MantineProvider (Mantine 9)
        Required for BlockNoteView's toolbar and slash-menu CSS variables
        │
        ├── Sidebar (src/components/Sidebar.tsx)
        │       Props: onSearch, onExport, onTemplates
        │       State reads: pages, createPage (usePageStore)
        │                    dark, toggleDark, sidebarWidth, setSidebarWidth,
        │                    sidebarCollapsed, toggleSidebarCollapsed (useSettingsStore)
        │       Derives: favorites = pages filtered by .favorited && !.deleted
        │                rootPages = pages filtered by .parentId===null && !.deleted
        │       Renders (collapsed): mini-rail with 4 icon buttons
        │       Renders (expanded):
        │           ├── [workspace header]
        │           │       ├── "N" logo mark
        │           │       ├── "My Workspace" label
        │           │       ├── dark mode toggle button
        │           │       └── collapse sidebar button
        │           ├── [search button] → calls onSearch
        │           ├── [templates button] → calls onTemplates
        │           ├── RecentSection (internal, not exported)
        │           │       Reads: recentPageIds, pages (usePageStore)
        │           │       Shows up to 5 recent non-deleted pages
        │           ├── [Favorites section, conditional]
        │           │       └── PageItem × n (one per favorited root page)
        │           ├── [Pages section header + + button]
        │           ├── PageItem × n (one per root page) [recursive]
        │           │       Props: page, depth, onExport
        │           │       Reads: pages, activePageId, expandedIds (usePageStore)
        │           │       State: hovered (bool), ctxMenu ({x,y}|null)
        │           │       Derives: children, isExpanded, isActive
        │           │       Renders:
        │           │           ├── expand/collapse chevron button
        │           │           ├── page.icon (emoji span)
        │           │           ├── page.title (truncated span)
        │           │           ├── lock icon (if locked)
        │           │           ├── [hover action bar: Download, Plus]
        │           │           ├── [children: PageItem × n at depth+1]
        │           │           └── ContextMenu (conditional, at ctxMenu position)
        │           ├── TrashSection (internal, not exported)
        │           │       Reads: pages (usePageStore)
        │           │       State: open (bool)
        │           │       Derives: trashed = pages filtered by .deleted
        │           │       Renders: collapsible list with restore and delete buttons
        │           └── [footer: New page button]
        │
        ├── Editor (src/components/Editor.tsx)
        │       Props: onExport
        │       Reads: pages, activePageId, updateTitle, updateContent, toggleLocked (usePageStore)
        │              dark (useSettingsStore)
        │       Derives: activePage = pages[activePageId] | null
        │       Creates: editor = useCreateBlockNote({initialContent}, [activePageId])
        │       State: localTitle (string)
        │       Refs: titleRef (textarea), saveTimer (timeout handle)
        │       Renders (no activePage): empty state placeholder
        │       Renders (activePage):
        │           ├── Cover (src/components/Cover.tsx)
        │           │       Props: pageId, cover
        │           │       Reads: updateCover (usePageStore)
        │           │       State: pickerOpen (bool)
        │           │       Renders: gradient banner OR "Add cover" hover button
        │           │           └── CoverPicker (internal) — 4×3 gradient swatch grid
        │           ├── PropertyPanel (src/components/PropertyPanel.tsx)
        │           │       Props: pageId
        │           │       Reads: pages, addTag, removeTag, setStatus, setPriority (usePageStore)
        │           │       State: tagInput (string)
        │           │       Renders: status dropdown, priority dropdown, tags bar
        │           │           └── Dropdown<T> (internal generic) — status or priority picker
        │           ├── [scrollable body div]
        │           │   ├── Breadcrumbs (src/components/Breadcrumbs.tsx)
        │           │   │       Props: pageId
        │           │   │       Reads: pages, setActive (usePageStore)
        │           │   │       Derives: chain = ancestor walk from pageId to root
        │           │   │       Renders: null if chain.length ≤ 1; else ancestor chain
        │           │   ├── IconPicker (internal)
        │           │   │       Props: icon, pageId, locked
        │           │   │       Reads: updateIcon (usePageStore)
        │           │   │       State: open (bool)
        │           │   │       Renders: large emoji button; 8×5 emoji grid when open
        │           │   ├── [locked badge — conditional]
        │           │   ├── [title textarea — readOnly if locked]
        │           │   └── BlockNoteView (BlockNote / Mantine)
        │           │           Props: editor, theme, onChange, editable
        │           │           Fires onChange → handleEditorChange → debounced updateContent
        │           ├── [footer bar]
        │           │   ├── WordCount (internal)
        │           │   │       Subscribes to editor.onChange; counts whitespace tokens
        │           │   ├── [updated date span]
        │           │   ├── [lock/unlock button]
        │           │   └── [Export .md button]
        │           └── TableOfContents (src/components/TableOfContents.tsx)
        │                   Props: editor
        │                   State: headings (Heading[]), open (bool)
        │                   Subscribes to editor.onChange; extracts heading blocks
        │                   Hidden below xl (1280px) breakpoint
        │
        ├── SearchModal (src/components/SearchModal.tsx)
        │       Props: open, onClose
        │       Reads: pages, setActive (usePageStore)
        │       State: query (string), cursor (number)
        │       Derives: results (filtered/sliced pages array)
        │       Renders (open=false): null (early return)
        │       Renders (open=true): fixed overlay with search input and result list
        │
        └── TemplatesModal (src/components/TemplatesModal.tsx)
                Props: open, onClose
                Reads: createFromTemplate (usePageStore)
                Renders (open=false): null (early return)
                Renders (open=true): fixed overlay with 2-column template card grid
```

---

## State Management Deep-Dive

### How Zustand stores are created

Both stores use the pattern:

```ts
export const usePageStore = create<PageStore>()(
  persist(
    (set) => ({
      // initial state
      pages: {},
      activePageId: null,
      // ...

      // actions
      createPage: (parentId = null) => {
        const page = newPage({ parentId });
        set((state) => ({
          pages: { ...state.pages, [page.id]: page },
          activePageId: page.id,
        }));
        return page.id;
      },
    }),
    { name: "notion-clone-pages", partialize: ... }
  )
);
```

`create<PageStore>()` returns a factory that builds the store hook. The double-call `create<T>()()` is Zustand's TypeScript-safe curried API. `persist` is middleware that wraps the factory.

### The persist middleware

```ts
persist(factory, {
  name: "notion-clone-pages",    // localStorage key
  partialize: (state) => ({      // which fields to serialise
    pages: state.pages,
    activePageId: state.activePageId,
    expandedIds: state.expandedIds,
    recentPageIds: state.recentPageIds,
  }),
})
```

**On app startup (hydration):**
1. `persist` reads `localStorage.getItem("notion-clone-pages")`.
2. If present, parses the JSON with `JSON.parse`.
3. Calls Zustand's `set` with the parsed object, merging it into the initial state via a shallow merge.
4. The merge preserves any action functions in the initial state (which were not serialised and therefore not in the parsed object).

**On every `set` call:**
1. The new state is computed.
2. `persist` intercepts the update.
3. `partialize` extracts the data fields (excluding action functions).
4. `JSON.stringify` serialises the extracted object.
5. `localStorage.setItem(name, serialised)` writes synchronously.

The entire localStorage write happens synchronously within the same event loop tick as the state update. This means there is zero latency between state change and persistence.

### Why partialize is necessary

Zustand action functions are JavaScript closures. `JSON.stringify` either silently drops them (object values that are functions are `undefined` in JSON) or — in strict mode — could throw. Using `partialize` explicitly lists only the data fields to serialize, providing a clear contract about what is persisted and what is ephemeral.

### Subscribing to store state

Components subscribe to store slices using the store hook:

```ts
const { pages, activePageId } = usePageStore();
```

Zustand's default behaviour is to trigger a re-render whenever any value in the returned object changes by reference equality. This is equivalent to subscribing to the entire store. For a component that only cares about `activePageId`, Zustand's `useStore(store, selector)` pattern or the `subscribeWithSelector` middleware can be used to limit re-renders, but neither is currently used — components re-render on any store change.

**Why this is acceptable:** The components that subscribe to `usePageStore` — `Sidebar`, `Editor`, `SearchModal`, `TemplatesModal`, and several sub-components — all have a legitimate reason to re-render when the page list or active page changes. The component tree is not large enough for this to cause performance issues.

### What happens when localStorage is full

When `localStorage.setItem` would exceed the origin quota (~5–10 MB), it throws a `DOMException` (`QuotaExceededError`). Zustand's `persist` middleware does not wrap this call in a try/catch. The exception propagates as an uncaught error. In practice, this is unlikely for a text-only workspace but becomes a risk for large workspaces.

**Current mitigation:** Users are advised to empty the trash and export/delete old pages. A future improvement could wrap the localStorage write in a try/catch and display a warning.

---

## BlockNote Integration Deep-Dive

### Editor lifecycle per page

The editor is not a singleton. A new `BlockNoteEditor` instance is created every time the active page changes:

```ts
const editor = useCreateBlockNote(
  {
    initialContent: activePage?.content?.length
      ? (activePage.content as PartialBlock[])
      : undefined,
  },
  [activePageId]   // ← dependency array triggers re-creation
);
```

`useCreateBlockNote` is a React hook built on top of `useMemo` internally. When `activePageId` changes, the previous memo is invalidated and a new `BlockNoteEditor` is instantiated. The `initialContent` option loads the page's stored `content` array into the new editor.

If `content` is an empty array (new page), `initialContent` is passed as `undefined` — BlockNote's default initial state — rather than `[]`, because BlockNote treats an empty array differently from `undefined`.

### Why the editor is re-created on page switch

**Alternative considered:** Maintain one editor instance and call an imperative `setContent` method to replace the document when switching pages.

**Problem with the alternative:** BlockNote's `BlockNoteEditor` does not expose a synchronous bulk-replace API. The editor maintains internal Prosemirror state, undo history, selection state, and cursor position. Replacing the entire document imperatively would require clearing undo history, resetting selection, and potentially causing visual glitches.

**Chosen approach:** Re-creating the editor on page switch is the clean solution. Each page gets a fresh, isolated editor instance with no shared state. The cost is a small instantiation overhead per page switch. The risk is losing edits within the 500 ms debounce window if a user switches pages within half a second of typing — but this is an acceptable edge case.

### onChange firing and content serialization

```ts
const handleEditorChange = useCallback(() => {
  if (!activePageId || activePage?.locked) return;
  if (saveTimer.current) clearTimeout(saveTimer.current);
  saveTimer.current = setTimeout(() => {
    updateContent(activePageId, editor.document as PartialBlock[]);
  }, 500);
}, [activePageId, activePage?.locked, editor, updateContent]);
```

`editor.onChange(callback)` registers a callback that fires whenever the editor's internal Prosemirror state changes — including cursor moves, selections, and formatting changes, not just text content changes. The 500 ms debounce ensures that `updateContent` (which triggers a localStorage write) is not called on every keystroke.

`editor.document` is BlockNote's current document snapshot, typed as `Block[]`. The cast to `PartialBlock[]` is safe because `Block` extends `PartialBlock` — the `PartialBlock` type is the generic, write-anywhere form while `Block` is the fully resolved form with guaranteed fields.

### Content serialization format

BlockNote's `PartialBlock` is a JSON-serialisable tree. A heading block looks like this in storage:

```json
{
  "id": "abc123",
  "type": "heading",
  "props": { "level": 2, "textColor": "default", "backgroundColor": "default", "textAlignment": "left" },
  "content": [
    { "type": "text", "text": "Overview", "styles": {} }
  ],
  "children": []
}
```

This JSON is stored inside `pages[id].content` in the Zustand store, which is itself serialised to localStorage. The entire content array is stored verbatim — no compression, no diff-based storage.

### MantineProvider requirement

`BlockNoteView` is imported from `@blocknote/mantine`, which renders BlockNote's toolbar, slash-command menu, and table controls using Mantine components. Mantine components require `MantineProvider` to be present in the React tree above them in order to access CSS variable contexts (colours, spacing, font sizes).

`App.tsx` wraps the entire component tree in `<MantineProvider>`. No Mantine components are used directly in custom code — it is purely a hosting requirement for BlockNote's UI.

---

## Rendering Strategy

### How the sidebar renders the recursive tree

The sidebar renders the page tree using a recursive `PageItem` component. Each `PageItem` knows about its direct children (computed by filtering `pages` on `parentId`):

```ts
function PageItem({ page, depth, onExport }: { page: Page; depth: number; onExport: ... }) {
  const { pages, expandedIds } = usePageStore();

  const children = Object.values(pages).filter((p) => p.parentId === page.id && !p.deleted);
  const isExpanded = expandedIds.includes(page.id);

  return (
    <div>
      <div style={{ paddingLeft: `${8 + depth * 16}px` }}>
        {/* chevron, icon, title, hover bar */}
      </div>
      {isExpanded && children.map((child) => (
        <PageItem key={child.id} page={child} depth={depth + 1} onExport={onExport} />
      ))}
    </div>
  );
}
```

**Children computation on each render:** `Object.values(pages).filter(...)` runs on every render of every `PageItem`. For a tree with 10 root pages and each having 5 children, this is 10 + (10 × 5) = 60 `PageItem` renders, each scanning the full `pages` object. For typical workspace sizes, this is imperceptible.

**Sorting children:** `children.sort((a, b) => a.createdAt - b.createdAt)` is applied after filtering. Sorting is O(k log k) where k is the number of children — small.

**Expand state:** `expandedIds.includes(page.id)` is O(m) where m is the number of expanded nodes. For the typical case (< 50 expanded nodes), this is negligible.

### How the Trash section renders

`TrashSection` performs a single O(n) scan: `Object.values(pages).filter(p => p.deleted)`. The component only mounts when at least one page is deleted (`if (trashed.length === 0) return null`). The trash list is not sorted — pages appear in insertion order of `Object.values(pages)`.

### How the Recent section renders

`RecentSection` maps `recentPageIds` (an ordered array of up to 10 UUIDs) to page objects, filters out deleted pages, and takes the first 5 entries. This is O(10) — effectively constant.

### How the Favorites section renders

`Sidebar` derives `favorites = Object.values(pages).filter(p => p.favorited && !p.deleted)` during each render. The favorites are rendered as `PageItem` components at `depth=0` (no indentation), regardless of their actual depth in the tree.

### Editor empty state vs. content state

The `Editor` component has a simple branch: if `activePage` is null, render the empty state placeholder. Otherwise, render the full editor layout. The full layout includes `Cover`, `PropertyPanel`, scrollable body (with `Breadcrumbs`, `IconPicker`, title textarea, `BlockNoteView`), the footer bar, and `TableOfContents`. All of these are always mounted when a page is active — there is no lazy rendering.

### Title textarea auto-resize

The title textarea uses a `useEffect` to auto-resize:

```ts
useEffect(() => {
  if (titleRef.current) {
    titleRef.current.style.height = "auto";
    titleRef.current.style.height = `${titleRef.current.scrollHeight}px`;
  }
}, [localTitle]);
```

This runs on every `localTitle` change (i.e., every keystroke). It resets the height to `"auto"` first, which allows `scrollHeight` to contract back to the minimum height if text is deleted.

### ContextMenu positioning

The context menu is positioned using `position: fixed` with coordinates computed from the mouse event:

```ts
const menuStyle: React.CSSProperties = {
  position: "fixed",
  top: Math.min(y, window.innerHeight - 220),
  left: Math.min(x, window.innerWidth - 200),
};
```

The `Math.min` clamps ensure the menu stays within the viewport even when right-clicking near the bottom or right edge of the screen. 220 px and 200 px are approximate menu height and width estimates.

---

## Key Design Decisions

### Decision 1: Flat adjacency list for the page tree

**Decision made:** Pages are stored as `Record<string, Page>` with a `parentId` foreign key.

**Alternatives considered:**
- Nested children arrays (e.g., `page.children: Page[]`).
- A separate edge collection (`Record<parentId, string[]>` for child id lists).

**Reason chosen:** O(1) page lookups by id are far more common than child-list lookups. Every update action (`updateTitle`, `updateContent`, `toggleLocked`, etc.) reads a page by id. Child-list derivation (finding all children of a page) happens only during sidebar rendering and recursive trash operations — both acceptable at O(n). The flat map also makes JSON serialisation trivial with no circular reference risk.

---

### Decision 2: Soft delete with manual purge

**Decision made:** `trashPage` sets `deleted: true` rather than removing the entry.

**Alternatives considered:**
- Hard delete: immediately remove from the map.
- A separate `trash: Record<string, Page>` store alongside `pages`.

**Reason chosen:** Recoverable trash is a core UX requirement. Keeping deleted pages in the same map avoids the complexity of moving records between two maps and keeping the maps consistent. The downside (space usage) is acceptable given the localStorage limits and the expectation that users periodically empty the trash.

---

### Decision 3: No backend — localStorage only

**Decision made:** All persistence is via Zustand's `persist` middleware writing to `localStorage`.

**Alternatives considered:**
- IndexedDB (more storage capacity, async API).
- A lightweight backend (Node + SQLite).
- Sync to a cloud service (Supabase, Firebase).

**Reason chosen:** The goal is a zero-infrastructure, zero-auth note-taking app. localStorage provides synchronous reads/writes (no async complexity), is universally supported, and is sufficient for the target workspace size. IndexedDB was considered but its async API would require significant architectural changes (async store actions, loading states). A backend was ruled out as out of scope for a client-only tool.

---

### Decision 4: New editor instance per page switch

**Decision made:** `useCreateBlockNote` is called with `[activePageId]` as a dependency, creating a fresh instance each time the active page changes.

**Alternatives considered:**
- A singleton editor with a `setContent` call to replace the document.
- Multiple editor instances pre-created for all pages.

**Reason chosen:** A singleton approach would require BlockNote to expose a reliable bulk-replace API, which it does not. Pre-creating instances for all pages would consume significant memory. The re-creation approach is the simplest, cleanest solution — each page gets a fresh, isolated editor.

---

### Decision 5: Gradient-only covers (no image URL)

**Decision made:** Covers are chosen from 12 named CSS `linear-gradient` strings stored in the `COVERS` map in `Cover.tsx`.

**Alternatives considered:**
- User-supplied image URLs (stored as `cover` string, rendered via `background-image`).
- File uploads to a CDN.

**Reason chosen:** CSS gradients need no network requests, no storage infrastructure, no content security policy adjustments, and no loading states. The `COVERS[cover] ?? cover` fallback in `Cover.tsx` already handles unknown string values by treating them as raw CSS — so adding URL support in the future requires only changing how the cover value is set, not how it is rendered.

---

### Decision 6: Markdown export only (no import)

**Decision made:** `src/lib/exportMarkdown.ts` implements export; there is no import path.

**Alternatives considered:**
- JSON export/import (the full `Page` object serialised directly).
- Markdown import via a parser library.

**Reason chosen:** Export is the primary backup mechanism. Import was deferred to keep scope manageable. A JSON export/import would be the natural future addition since the data is already JSON-serialisable and the store shape is stable.

---

### Decision 7: MantineProvider wrapping

**Decision made:** The entire app is wrapped in `<MantineProvider>` even though no Mantine components are used in custom code.

**Alternatives considered:**
- Wrap only `BlockNoteView` in a `MantineProvider`.
- Use `@blocknote/react` + plain CSS instead of `@blocknote/mantine`.

**Reason chosen:** `@blocknote/mantine` is the official, well-maintained BlockNote adapter and provides the best out-of-the-box UI for the toolbar, slash-command menu, and table controls. Wrapping only `BlockNoteView` would require a second React tree root (a portal), adding complexity. Wrapping the whole app at `App.tsx` is the simplest approach and has no performance cost.

---

### Decision 8: Store-derived lists computed at render, not in the store

**Decision made:** `rootPages`, `favorites`, `trashed`, `recents`, and `children` (inside `PageItem`) are all derived from the store state inside component render functions, not stored as separate fields in Zustand.

**Alternatives considered:**
- Computed fields in the store (e.g., `usePageStore.favorites`).
- Selectors with memoisation at the store level.

**Reason chosen:** Keeping derivations in component render functions avoids stale closure bugs that can occur when a derived value in a store action references a stale version of another store field. Derivations during render are always fresh. The performance cost is minimal — these derivations are simple `filter` and `sort` calls on small arrays.

---

### Decision 9: Debounce in the component, not in the store

**Decision made:** The 300 ms title debounce and 500 ms content debounce are implemented using `useRef<ReturnType<typeof setTimeout>>` inside `Editor.tsx`, not inside the Zustand store.

**Alternatives considered:**
- Debounce inside the `updateTitle` and `updateContent` store actions.
- A custom `useDebounce` hook.

**Reason chosen:** Debouncing inside the component allows the component to maintain a `localTitle` state for immediate UI feedback (the textarea shows what you type instantly) while the debounced store write happens asynchronously. If debouncing happened in the store, there would be no way to show the typed characters immediately before the debounce fires. A shared `useDebounce` hook was not extracted because the pattern only appears in one place (YAGNI).

---

## Performance Characteristics

### Re-renders

Every component that calls `usePageStore()` or `useSettingsStore()` re-renders whenever any field in the respective store changes. The components that subscribe include:

- `Sidebar` — re-renders on any page or settings change.
- `PageItem` (each instance) — re-renders on any page change.
- `Editor` — re-renders on any page or dark-mode change.
- `SearchModal` — re-renders on any page change (even when closed, but early-returns immediately).
- `TemplatesModal` — re-renders on any page change (early-returns when closed).

For the typical workspace, these re-renders are inexpensive and not a bottleneck. A workspace with 200 pages would have ~200 `PageItem` instances re-rendering on every keystroke (because `updateContent` triggers a store update). This is the first performance bottleneck to address if it becomes noticeable.

### Debouncing strategy

| Write | Debounce | Rationale |
|---|---|---|
| Title (`updateTitle`) | 300 ms | Short burst inputs; 300 ms catches natural pauses between words |
| Content (`updateContent`) | 500 ms | Block-level changes are more expensive to serialise; 500 ms balances durability vs. write frequency |

With 500 ms debouncing, `localStorage.setItem` is called at most twice per second during active typing. Each call serialises the entire `pages` object via `JSON.stringify`.

### When the editor re-mounts

The `BlockNoteView` component (and its underlying Prosemirror instance) is re-mounted every time `activePageId` changes, because `useCreateBlockNote` creates a new editor instance. This takes an unmeasurable fraction of a second for text-only documents but may be slightly perceptible for documents with many large blocks (dozens of paragraphs). No optimization is currently applied.

### O(n) scans in Sidebar

Each `PageItem` instance performs an O(n) scan of `Object.values(pages)` to find its children. For a tree with 100 pages and 10 `PageItem` instances visible, this is 10 × 100 = 1,000 object property accesses per render. This is extremely fast in modern JavaScript engines.

If the workspace grew to 1,000 pages with 100 visible `PageItem` instances, this would be 100,000 accesses per render, still typically sub-millisecond. Virtualisation (e.g., `@tanstack/react-virtual`) would only be needed at significantly larger scales.

---

## Security Considerations

### XSS via page content

BlockNote renders content using Prosemirror, which uses the browser DOM. All text content is inserted as text nodes (not `innerHTML`), so user-typed content cannot execute as HTML or JavaScript. Image blocks embed URLs via `<img src>` attributes, not `innerHTML`.

The Markdown export function (`blocksToMarkdown`) produces a string that is placed into a `Blob` and downloaded — it never appears in the DOM, so there is no XSS risk there.

**Residual risk:** Image blocks allow embedding arbitrary URLs. If an attacker tricks a user into inserting an image URL that points to a tracking pixel or a URL that causes side-channel information disclosure, that could be a concern. However, since the app is single-user and local-only, the attack surface is extremely limited.

### localStorage data exposure

All workspace data is stored in `localStorage["notion-clone-pages"]`. Any JavaScript running on the same origin (same protocol + domain + port) can read this data via `localStorage.getItem("notion-clone-pages")`. Since the app is typically served from `localhost:5173` or a dedicated static domain, other tabs on different origins cannot access it.

**Residual risk:** If the app is embedded in a page that also loads malicious scripts on the same origin, those scripts could exfiltrate all page content from localStorage. This is a theoretical risk for a self-hosted deployment on a shared domain.

### Data loss scenarios

The following scenarios result in permanent, unrecoverable data loss:
- Clearing browser data / site data for the origin.
- Using the "Empty trash" button without reviewing trashed pages.
- Using "Permanent delete" on any page.
- The `QuotaExceededError` scenario: if a write fails due to storage full, the state update may not persist, but the in-memory state has already changed. On next page refresh, the pre-write state is reloaded from localStorage, losing the in-memory changes.

**Mitigation guidance:** Regular Markdown exports are the only reliable backup mechanism in the current architecture.

### No authentication or authorization

The app has no concept of users, sessions, or access control. Anyone with access to the browser (or the localStorage data) can read and modify all pages. This is appropriate for a single-user local tool but would need to be addressed before any multi-user deployment.

---

## Future Roadmap

### Adding a backend

The current architecture's persistence layer is entirely in `usePageStore`'s `persist` middleware. Replacing localStorage with an API requires only one change: provide a custom `storage` adapter to `persist`:

```ts
import { createJSONStorage } from "zustand/middleware";

const apiStorage = {
  getItem: async (name: string) => {
    const resp = await fetch(`/api/store/${name}`);
    return resp.text();
  },
  setItem: async (name: string, value: string) => {
    await fetch(`/api/store/${name}`, { method: "PUT", body: value });
  },
  removeItem: async (name: string) => {
    await fetch(`/api/store/${name}`, { method: "DELETE" });
  },
};

persist(factory, {
  name: "notion-clone-pages",
  storage: createJSONStorage(() => apiStorage),
})
```

This would move all writes to an API endpoint while keeping the entire React/Zustand component tree unchanged. The main challenge is handling async loading states (the store would be empty for a moment while the API call resolves) and error handling.

### Real-time collaboration with Y.js

BlockNote has first-class Y.js support via `@blocknote/yjs`. Adding real-time collaboration would require:

1. Replace `useCreateBlockNote({ initialContent })` with `useCreateBlockNote({ collaboration: { provider, fragment } })`.
2. Add a Y.js provider (e.g., `y-websocket`, `y-webrtc`, or `Liveblocks`) that connects to a WebSocket server.
3. Replace the Zustand `updateContent` approach with Y.js document updates — the Y.js document becomes the source of truth for content, not localStorage.
4. Zustand would still manage metadata (`title`, `icon`, `cover`, `status`, `priority`, `tags`) which are less performance-critical and can use the existing debounce approach.

The data model would need to distinguish between CRDT-managed content (Y.js) and metadata (still Zustand). The `content: PartialBlock[]` field in `Page` would become a Y.js document reference rather than a serialised array.

### Image uploads

The cover system's `COVERS[cover] ?? cover` fallback already handles unknown string values as raw CSS — any string that is not a known key is passed directly as a CSS `background` value. This means adding URL-based covers requires only changing how the value is set:

1. Add an `uploadImage` action (or image URL input) that sets `cover` to a URL string (e.g., `https://example.com/photo.jpg`).
2. The `Cover` component already renders it correctly via `background: COVERS[cover] ?? cover`.

For actual file uploads, a storage service (S3, Cloudflare R2, Supabase Storage) would be needed. The store would need to handle the async upload and set the resulting URL.

### Full-text search index

Current search is a client-side title substring match. Improvements in order of complexity:

1. **Client-side body search with Fuse.js:** Install `fuse.js`, build an index from all `page.content` block text values, and search it in `SearchModal`. Adds full-text search without a backend. Index must be rebuilt on every content change.

2. **Web Worker index:** Move the Fuse.js index into a Web Worker to avoid blocking the main thread during index updates and searches. Communicate via `postMessage`.

3. **Backend full-text search:** If a backend is added, delegate search to PostgreSQL `tsvector`/`tsquery`, Meilisearch, or Typesense. These support ranking, fuzzy matching, and language-specific stemming at scales where client-side search breaks down.

### Automatic trash expiry

`Page.deletedAt` stores a Unix milliseconds timestamp but is never read by any action. A 30-day automatic expiry could be implemented as a startup effect in `App.tsx`:

```ts
useEffect(() => {
  const EXPIRY_MS = 30 * 24 * 60 * 60 * 1000;
  const { pages, permanentDelete } = usePageStore.getState();
  Object.values(pages)
    .filter((p) => p.deleted && p.deletedAt && Date.now() - p.deletedAt > EXPIRY_MS)
    .forEach((p) => permanentDelete(p.id));
}, []); // run once on mount
```

This would run at app startup and clean up pages older than 30 days without any user interaction.

### Multiple workspaces

Currently, the app has a single hardcoded workspace ("My Workspace"). Supporting multiple workspaces would require:

1. A new `workspaces: Record<string, { name: string; pages: Record<string, Page> }>` shape, or separate localStorage keys per workspace.
2. A workspace switcher UI in the sidebar header.
3. Scoping `activePageId`, `expandedIds`, and `recentPageIds` per workspace.

The simplest implementation would be separate localStorage keys per workspace (e.g., `notion-clone-pages-work`, `notion-clone-pages-personal`), with a top-level `notion-clone-active-workspace` key. Each workspace would have its own `usePageStore` instance or parameterized factory.

### Mobile support

The current layout assumes a minimum screen width around 640 px (the sidebar is at minimum 160 px, the editor has 64 px of horizontal padding on each side). On mobile screens (< 640 px), the layout breaks. Full mobile support would require:

1. A responsive layout: sidebar becomes a slide-over drawer (full screen) that hides the editor, or a bottom navigation sheet.
2. Touch-friendly targets: hover-dependent action buttons (the `PageItem` hover bar) need tap equivalents.
3. Touch-based sidebar resize: the drag-to-resize handle only works with a mouse.
4. Removing or reorganising the `xl:flex` Table of Contents (it already hides below 1280 px, but the editor layout should be validated at 375 px and 768 px).

### JSON import / data portability

A JSON import feature would allow users to restore a full workspace backup or transfer data between devices. Implementation:

1. Export: download `localStorage.getItem("notion-clone-pages")` as a `.json` file — trivial since the data is already serialised.
2. Import: a file input that reads the JSON, validates the shape, and calls a new `importWorkspace(data)` store action that either replaces or merges with the existing `pages` map. UUID conflicts (same id already exists) would need a policy: skip, overwrite, or generate new ids for the imported pages.

### URL-based routing

Currently, `activePageId` is managed entirely by Zustand store state. There is no URL that reflects the current page. Adding `react-router-dom` (already listed as a project dependency) would enable:

1. Each page accessible at `/page/:id` — URLs become shareable.
2. Browser back/forward buttons navigate the page history correctly.
3. Deep linking: opening a specific URL loads that page directly.
4. `activePageId` becomes derived from the URL (`useParams().id`) rather than stored in Zustand — this simplifies the store slightly.
