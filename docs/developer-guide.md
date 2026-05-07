# Developer Guide

Comprehensive onboarding and reference for contributors to the Notion-clone web app.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Project Structure](#project-structure)
4. [TypeScript Type Reference](#typescript-type-reference)
5. [Store API Reference](#store-api-reference)
6. [Templates System](#templates-system)
7. [BlockNote Integration](#blocknote-integration)
8. [Dark Mode — End to End](#dark-mode--end-to-end)
9. [localStorage Persistence](#localstorage-persistence)
10. [Testing Reference](#testing-reference)
11. [TDD Workflow — Worked Example](#tdd-workflow--worked-example)
12. [Adding a New Feature — End to End](#adding-a-new-feature--end-to-end)
13. [Build and Deploy](#build-and-deploy)
14. [Code Style Rules](#code-style-rules)
15. [Contributing Guidelines](#contributing-guidelines)

---

## Prerequisites

| Tool | Minimum version | Recommended | Notes |
|---|---|---|---|
| Node.js | 18 LTS | 20 LTS or later | Vite 8 requires Node 18+. Use `nvm` or `fnm` to manage versions. |
| npm | 9 | Bundled with Node 20 | No `yarn` or `pnpm` equivalents tested. |
| Chrome | 115 | Latest | Primary development browser; DevTools used for localStorage inspection. |
| Firefox | 117 | Latest | Secondary supported browser. |
| Safari | 17 | Latest | Supported; test dark mode and focus behaviour. |
| Git | 2.x | Latest | Standard Git workflow. |

No backend, database, or environment variables are required. The app is entirely client-side. There are no `.env` files and no secrets to manage.

---

## Initial Setup

```bash
# Clone the repository
git clone <repo-url>
cd tracker

# Install all dependencies (including dev dependencies)
npm install

# Start the development server with Hot Module Replacement
# Opens at http://localhost:5173 by default
npm run dev

# Type-check only — does not emit files, useful in CI
npx tsc --noEmit

# Lint all TypeScript/TSX files
npm run lint

# Run the full test suite (one-shot, no watch mode)
npm test

# Run tests in watch mode (re-runs on file save)
npx vitest

# Run tests with coverage report (output in coverage/)
npx vitest run --coverage

# Build for production (type-checks then bundles)
npm run build

# Serve the production build locally on port 4173
npm run preview
```

### Dev server notes

`npm run dev` starts Vite with HMR (Hot Module Replacement). Saving any `.ts`, `.tsx`, or `.css` file triggers an instant browser update without losing the current editor state. Full page reloads are only triggered for config changes (e.g., `vite.config.ts`, `tailwind.config.js`).

### Verifying the setup

After `npm run dev`, open `http://localhost:5173`. You should see the sidebar with a "Pages" section and a "New page" button. Open the browser console — there should be no errors.

If you see `ReferenceError: localStorage is not defined` in tests, check that `vitest.config.ts` has `environment: "jsdom"` set.

---

## Project Structure

```
tracker/
├── index.html                    # Vite HTML entry point; mounts <div id="root">
├── vite.config.ts                # Vite config: React plugin + Vitest settings
├── vitest.config.ts              # Vitest-specific config (environment, globals, coverage)
├── tailwind.config.js            # Tailwind CSS v4 config; darkMode: "class"
├── postcss.config.js             # PostCSS with Tailwind and autoprefixer
├── tsconfig.json                 # Root TypeScript config (project references)
├── tsconfig.app.json             # App source TS config (strict, ESNext target)
├── tsconfig.node.json            # Build-tool TS config (CommonJS, for vite.config.ts)
├── eslint.config.js              # ESLint flat config (TS + React hooks + react-refresh)
├── package.json                  # Dependencies, scripts, project metadata
├── CLAUDE.md                     # Claude Code agent instructions (read by AI assistants)
│
└── src/
    ├── main.tsx                  # React root — calls createRoot, mounts <App />
    ├── index.css                 # Tailwind directives (@tailwind base/components/utilities)
    ├── App.tsx                   # Root layout shell; global keyboard shortcuts; export handler
    ├── types.ts                  # Shared TypeScript types: Page, Template, PageStatus, PagePriority
    │
    ├── store/
    │   ├── pages.ts              # usePageStore: all page CRUD, navigation, favorites, properties
    │   └── settings.ts           # useSettingsStore: dark mode, sidebar width, sidebar collapsed
    │
    ├── components/
    │   ├── Sidebar.tsx           # Left navigation panel (PageItem, TrashSection, RecentSection)
    │   ├── Editor.tsx            # Main editing surface (IconPicker, WordCount, BlockNoteView)
    │   ├── PropertyPanel.tsx     # Status/priority/tags bar above the editor body
    │   ├── Cover.tsx             # Gradient cover banner + CoverPicker; exports COVERS map
    │   ├── Breadcrumbs.tsx       # Ancestor chain navigation bar above the icon
    │   ├── ContextMenu.tsx       # Right-click context menu for sidebar page items
    │   ├── SearchModal.tsx       # Full-screen search overlay with keyboard navigation
    │   ├── TemplatesModal.tsx    # Template picker modal; calls createFromTemplate
    │   └── TableOfContents.tsx   # Auto-generated heading index (xl screens only)
    │
    ├── lib/
    │   ├── exportMarkdown.ts     # Pure functions: blocksToMarkdown, pageToMarkdown, exportPageAsMarkdown
    │   └── templates.ts          # TEMPLATES array (6 templates) + getTemplate() lookup function
    │
    └── __tests__/
        ├── setup.ts              # Vitest global setup: imports jest-dom, suppresses Zustand console noise
        ├── stores/
        │   ├── pages.test.ts               # createPage, updateTitle, trashPage, restore, favorites, expand
        │   ├── pageProperties.test.ts      # addTag, removeTag, setStatus, setPriority
        │   ├── duplicate.test.ts           # duplicatePage behavior
        │   ├── recentPagesLockCollapse.test.ts  # recentPageIds, toggleLocked, toggleSidebarCollapsed
        │   └── templates.test.ts           # TEMPLATES registry, getTemplate, createFromTemplate
        └── lib/
            └── exportMarkdown.test.ts      # pageToMarkdown (pure), exportPageAsMarkdown (DOM side effects)
```

### Key files in depth

**`src/types.ts`**
The single source of truth for the data shape. Every store action, component prop, and test fixture must conform to the `Page` and `Template` interfaces defined here. Any data model change must start in this file.

**`src/store/pages.ts`**
The largest and most important file. Contains the `usePageStore` Zustand store with all page-related state and every action. The `newPage()` helper function ensures every created page receives the full set of default field values. The `persist` middleware is configured with `partialize` to serialize only the data fields (not the action functions) to localStorage.

**`src/store/settings.ts`**
Holds the two display-layer preferences: dark mode and sidebar dimensions. The `toggleDark` action mutates `document.documentElement.classList` as a synchronous side effect inside the Zustand `set` call.

**`src/App.tsx`**
The application shell. Does not render any content of its own — its job is layout, modal state, global keyboard shortcuts, and the `handleExport` callback that bridges the export button in multiple locations (sidebar hover bar, editor footer, context menu) to a single implementation.

**`src/components/Sidebar.tsx`**
Contains three internal components: `PageItem` (recursive sidebar tree node), `TrashSection` (collapsible deleted pages list), and `RecentSection` (last-visited pages list). The resize handle is implemented with imperative `mousemove`/`mouseup` listeners attached to `window` on drag start and cleaned up on drag end.

**`src/components/Editor.tsx`**
Contains two internal components: `IconPicker` (40-emoji grid that closes on outside click) and `WordCount` (subscribes to `editor.onChange` to recount tokens). The main `Editor` component is the integration point for BlockNote — it calls `useCreateBlockNote`, renders `BlockNoteView`, and owns the debounce timers for both title and content saves.

**`src/lib/exportMarkdown.ts`**
Intentionally free of React and Zustand imports. The `blocksToMarkdown` and `pageToMarkdown` functions are pure (input → output, no side effects) and are therefore testable without any mocking. Only `exportPageAsMarkdown` touches the DOM (creating a temporary `<a>` element).

**`src/lib/templates.ts`**
The `TEMPLATES` array is the only authoritative list of templates. Each entry is a complete `Template` object with pre-built `PartialBlock[]` content arrays. The `getTemplate(key)` function is the sole access point used by the store action `createFromTemplate`.

---

## TypeScript Type Reference

### `PageStatus`

```ts
export type PageStatus = "none" | "todo" | "in-progress" | "done";
```

| Value | Display label | Colour (light) | Colour (dark) |
|---|---|---|---|
| `"none"` | No status | Grey | Neutral dark |
| `"todo"` | Todo | Blue-100 text-blue-700 | Blue-900/40 text-blue-300 |
| `"in-progress"` | In Progress | Yellow-100 text-yellow-700 | Yellow-900/40 text-yellow-300 |
| `"done"` | Done | Green-100 text-green-700 | Green-900/40 text-green-300 |

### `PagePriority`

```ts
export type PagePriority = "none" | "low" | "medium" | "high";
```

| Value | Display label | Colour (light) | Colour (dark) |
|---|---|---|---|
| `"none"` | No priority | Grey | Neutral dark |
| `"low"` | Low | Blue-50 text-blue-600 | Blue-900/30 text-blue-400 |
| `"medium"` | Medium | Orange-100 text-orange-600 | Orange-900/30 text-orange-400 |
| `"high"` | High | Red-100 text-red-600 | Red-900/30 text-red-400 |

### `Page`

```ts
export interface Page {
  id: string;             // UUID v4, generated by uuid.v4() at creation time
  title: string;          // Editable page name; defaults to "Untitled"
  content: PartialBlock[]; // BlockNote block array; [] for a new page
  parentId: string | null; // UUID of the parent page, or null for root-level
  icon: string;           // Single emoji character; random at creation
  cover: string | null;   // Key into COVERS map (e.g. "aurora") or null
  favorited: boolean;     // True when pinned to the Favorites sidebar section
  deleted: boolean;       // True when soft-deleted (in trash)
  deletedAt: number | null; // Unix milliseconds timestamp when trashed, or null
  locked: boolean;        // True when page is read-only
  tags: string[];         // Free-form lowercase label strings
  status: PageStatus;     // Workflow state; defaults to "none"
  priority: PagePriority; // Urgency level; defaults to "none"
  createdAt: number;      // Unix milliseconds timestamp; set once at creation
  updatedAt: number;      // Unix milliseconds timestamp; updated on every mutation
}
```

**Field invariants:**
- `id` is immutable after creation.
- `createdAt` is immutable after creation.
- `updatedAt` is updated by every store action that mutates the page: `updateTitle`, `updateIcon`, `updateCover`, `updateContent`, `toggleLocked`, `addTag`, `removeTag`, `setStatus`, `setPriority`.
- `tags` never contains duplicates. The `addTag` action silently returns early if the tag already exists.
- `cover` is either a key that exists in the `COVERS` map in `src/components/Cover.tsx`, or `null`. No validation enforces this — an unknown key would cause `Cover.tsx` to fall back to using the value as a raw CSS `background` string.

### `Template`

```ts
export interface Template {
  key: string;            // Unique identifier; used by createFromTemplate and getTemplate
  name: string;           // Display name shown in TemplatesModal
  icon: string;           // Emoji assigned as the page icon when template is applied
  description: string;    // Short description shown under the name in TemplatesModal
  content: PartialBlock[]; // Pre-built block array — the template body
}
```

Templates are defined in `src/lib/templates.ts` in the `TEMPLATES` constant array. They are never persisted to localStorage — they are source-code constants.

---

## Store API Reference

### `usePageStore` — `src/store/pages.ts`

**State shape:**

```ts
interface PageStore {
  pages: Record<string, Page>;  // Flat map keyed by UUID
  activePageId: string | null;  // Currently displayed page
  expandedIds: string[];        // Sidebar tree nodes that are expanded
  recentPageIds: string[];      // Ordered most-recent-first; max 10 entries

  // ... all action functions
}
```

**localStorage key:** `notion-clone-pages`  
**Partialised fields:** `pages`, `activePageId`, `expandedIds`, `recentPageIds`

---

#### `createPage`

```ts
createPage: (parentId?: string | null, overrides?: Partial<Page>) => string
```

Creates a new page with all fields populated from `newPage()` defaults, then applies any provided `overrides`. Returns the new page's UUID.

**Side effects:**
- Adds the new page to `pages`.
- Sets `activePageId` to the new page's id.
- Prepends the new id to `recentPageIds` (deduplicated, capped at 10).
- If `parentId` is provided and not yet in `expandedIds`, adds it so the parent expands automatically in the sidebar.

**Example:**
```ts
const id = usePageStore.getState().createPage(); // root-level
const childId = usePageStore.getState().createPage(id); // child of id
const templatedId = usePageStore.getState().createPage(null, { title: "Custom", icon: "🚀" });
```

---

#### `duplicatePage`

```ts
duplicatePage: (id: string) => string
```

Creates a copy of the page with the given id. Returns the new page's UUID. If `id` is not found in `pages`, returns `id` unchanged (no-op guard).

**Copied fields:** All fields from the source page, except:
- `id` is a fresh UUID.
- `title` has " (copy)" appended.
- `createdAt` and `updatedAt` are set to `Date.now()`.
- `favorited` is always `false` on the clone.

**Side effects:** Sets `activePageId` to the clone's id. Prepends to `recentPageIds`.

---

#### `createFromTemplate`

```ts
createFromTemplate: (templateKey: string, parentId?: string | null) => string
```

Looks up the template by key via `getTemplate(templateKey)`. Creates a new page using the template's `name`, `icon`, and `content`. If the key is not found, creates a blank "Untitled" page with an empty content array (graceful fallback).

**Side effects:** Sets `activePageId` to the new page's id. Prepends to `recentPageIds`.

---

#### `trashPage`

```ts
trashPage: (id: string) => void
```

Recursively marks the page and all of its descendants as deleted.

**Algorithm:** Uses an inner recursive function `trashRecursive(pages, pageId)` that:
1. Sets `pages[pageId].deleted = true` and `pages[pageId].deletedAt = Date.now()`.
2. Finds all pages with `parentId === pageId` that are not yet deleted, and calls itself on each.

**Side effects:** If `activePageId` is now deleted, sets `activePageId` to the first live page id or `null`.

---

#### `restorePage`

```ts
restorePage: (id: string) => void
```

Restores a single page by setting `deleted = false` and `deletedAt = null`. Does **not** restore child pages — each must be restored individually.

---

#### `permanentDelete`

```ts
permanentDelete: (id: string) => void
```

Recursively removes the page and all of its descendants from the `pages` map. Uses `delete newPages[pageId]` on each affected entry. Cannot be undone.

**Side effects:** If `activePageId` is the deleted page, sets `activePageId` to `Object.keys(newPages)[0] ?? null`.

---

#### `emptyTrash`

```ts
emptyTrash: () => void
```

Replaces `pages` with a new object containing only entries where `deleted === false`. Equivalent to bulk permanent-delete of all trashed pages.

---

#### `updateTitle`

```ts
updateTitle: (id: string, title: string) => void
```

Updates `pages[id].title` and `pages[id].updatedAt`. Called by `Editor.tsx` via a 300 ms debounce timer.

---

#### `updateIcon`

```ts
updateIcon: (id: string, icon: string) => void
```

Updates `pages[id].icon` and `pages[id].updatedAt`. Called by `IconPicker` on emoji selection.

---

#### `updateCover`

```ts
updateCover: (id: string, cover: string | null) => void
```

Updates `pages[id].cover` and `pages[id].updatedAt`. Pass `null` to remove the cover.

---

#### `updateContent`

```ts
updateContent: (id: string, content: PartialBlock[]) => void
```

Updates `pages[id].content` and `pages[id].updatedAt`. Called by `Editor.tsx` via a 500 ms debounce timer on `BlockNoteView`'s `onChange` callback. Does nothing if the page is locked (`activePage.locked` is checked in the Editor's `handleEditorChange` before calling this action).

---

#### `toggleLocked`

```ts
toggleLocked: (id: string) => void
```

Flips `pages[id].locked` between `true` and `false`. Also updates `updatedAt`.

---

#### `addTag`

```ts
addTag: (id: string, tag: string) => void
```

Appends `tag` to `pages[id].tags` and updates `updatedAt`. If the tag already exists in the array, returns the previous state unchanged (no duplicate enforcement via early return).

---

#### `removeTag`

```ts
removeTag: (id: string, tag: string) => void
```

Filters `tag` out of `pages[id].tags` and updates `updatedAt`.

---

#### `setStatus`

```ts
setStatus: (id: string, status: PageStatus) => void
```

Sets `pages[id].status` and updates `updatedAt`.

---

#### `setPriority`

```ts
setPriority: (id: string, priority: PagePriority) => void
```

Sets `pages[id].priority` and updates `updatedAt`.

---

#### `setActive`

```ts
setActive: (id: string | null) => void
```

Sets `activePageId`. If `id` is non-null, also prepends `id` to `recentPageIds` (deduplicating if already present, slicing to 10).

---

#### `toggleExpand`

```ts
toggleExpand: (id: string) => void
```

Adds `id` to `expandedIds` if not present, removes it if present.

---

#### `toggleFavorite`

```ts
toggleFavorite: (id: string) => void
```

Flips `pages[id].favorited`. Does not update `updatedAt` (favoriting is not considered a content change).

---

### `useSettingsStore` — `src/store/settings.ts`

**State shape:**

```ts
interface SettingsStore {
  dark: boolean;               // True = dark theme active
  sidebarWidth: number;        // Pixels, clamped to [160, 480]
  sidebarCollapsed: boolean;   // True = sidebar shown as 40px mini-rail
  toggleDark: () => void;
  setSidebarWidth: (w: number) => void;
  toggleSidebarCollapsed: () => void;
}
```

**localStorage key:** `notion-clone-settings`  
**Partialised fields:** entire store (no `partialize` option — all fields are persisted including state values; action functions are automatically excluded by Zustand's serialiser)

---

#### `toggleDark`

```ts
toggleDark: () => void
```

Computes `next = !state.dark`, then:
1. Calls `document.documentElement.classList.toggle("dark", next)` — the DOM side effect.
2. Returns `{ dark: next }` to Zustand's `set`.

This means dark mode takes effect on the `<html>` element immediately and synchronously when the action fires. `App.tsx` also runs a `useEffect` on mount to re-apply the class from the persisted value (since the store action only fires on toggle, not on hydration).

---

#### `setSidebarWidth`

```ts
setSidebarWidth: (w: number) => void
```

Sets `sidebarWidth` to `Math.min(480, Math.max(160, w))`. The clamp ensures the sidebar never collapses below 160 px (unreadable) or expands beyond 480 px (takes up too much screen space).

---

#### `toggleSidebarCollapsed`

```ts
toggleSidebarCollapsed: () => void
```

Flips `sidebarCollapsed`. When `true`, the `Sidebar` component renders a 40 px mini-rail instead of the full panel.

---

## Templates System

### How the TEMPLATES array works

`src/lib/templates.ts` exports a `TEMPLATES: Template[]` constant array. Each element is a complete `Template` object with hardcoded `PartialBlock[]` content. These blocks are the exact format BlockNote uses for its document — you can paste any `editor.document` snapshot here as a template.

The array is imported directly by:
- `TemplatesModal.tsx` — to render the 6 template cards.
- `src/store/pages.ts` — which imports `getTemplate(key)` and uses the result in `createFromTemplate`.

### Adding a new template — step by step

**Step 1 — Write a failing test**

Add to `src/__tests__/stores/templates.test.ts`:

```ts
it("includes a standup template", () => {
  const t = getTemplate("standup");
  expect(t).toBeDefined();
  expect(t?.name).toBe("Daily Standup");
});
```

Run `npm test` and confirm the test fails with "expected undefined to be defined".

**Step 2 — Add the template to the TEMPLATES array**

Open `src/lib/templates.ts` and add a new entry to the `TEMPLATES` array:

```ts
{
  key: "standup",
  name: "Daily Standup",
  icon: "🧍",
  description: "Quick daily standup notes: yesterday, today, blockers",
  content: [
    {
      type: "heading",
      props: { level: 1 },
      content: [{ type: "text", text: "Daily Standup", styles: {} }],
    },
    {
      type: "heading",
      props: { level: 2 },
      content: [{ type: "text", text: "Yesterday", styles: {} }],
    },
    {
      type: "bulletListItem",
      content: [{ type: "text", text: "", styles: {} }],
    },
    {
      type: "heading",
      props: { level: 2 },
      content: [{ type: "text", text: "Today", styles: {} }],
    },
    {
      type: "bulletListItem",
      content: [{ type: "text", text: "", styles: {} }],
    },
    {
      type: "heading",
      props: { level: 2 },
      content: [{ type: "text", text: "Blockers", styles: {} }],
    },
    {
      type: "bulletListItem",
      content: [{ type: "text", text: "", styles: {} }],
    },
  ] as PartialBlock[],
},
```

**Step 3 — Run the tests again**

```bash
npm test
```

All tests should pass. The new template automatically appears in `TemplatesModal` because the component iterates `TEMPLATES` directly.

**Step 4 — Verify in the browser**

Start the dev server and open the Templates modal. The "Daily Standup" card should appear with the standup icon and description. Clicking it should create a page with the standup structure.

### Template content format

Each block in the `content` array is a `PartialBlock` from `@blocknote/core`. The minimal shape is:

```ts
{
  type: "paragraph" | "heading" | "bulletListItem" | "numberedListItem" |
        "checkListItem" | "codeBlock" | "quote" | "image" | "table",
  props?: { level?: 1 | 2 | 3; checked?: boolean; /* ... */ },
  content?: Array<{ type: "text"; text: string; styles?: InlineStyles }>,
}
```

For headings, `props.level` is required (1, 2, or 3). For check list items, `props.checked` defaults to `false`. For paragraphs, `props` can be omitted entirely.

---

## BlockNote Integration

BlockNote is the rich text editing library. The integration happens entirely in `src/components/Editor.tsx`.

### Editor creation

```ts
const editor = useCreateBlockNote(
  {
    initialContent: activePage?.content?.length
      ? (activePage.content as PartialBlock[])
      : undefined,
  },
  [activePageId]  // ← dependency array
);
```

`useCreateBlockNote` is a React hook that returns a `BlockNoteEditor` instance. The second argument is a dependency array — analogous to `useMemo`. A new editor instance is created whenever `activePageId` changes.

**Why re-create on page switch:** BlockNote's editor instance is initialized with `initialContent` once and is then internally stateful. To show a different page's content, you need a fresh instance initialized with that page's content. There is no `setContent` imperative API for bulk document replacement. The trade-off is a small instantiation cost on every page switch and the risk of losing edits within the 500 ms debounce window.

### Rendering the editor

```tsx
<BlockNoteView
  editor={editor}
  theme={dark ? "dark" : "light"}
  onChange={handleEditorChange}
  editable={!activePage.locked}
/>
```

- `theme` — BlockNote's own dark/light theme for the toolbar, slash menu, and table UI. Tied to the `dark` value from `useSettingsStore`.
- `onChange` — fires every time the document changes. The callback is debounced 500 ms before calling `updateContent`.
- `editable` — when `false`, the editor body is read-only. Set from `activePage.locked`.

### Debouncing pattern

Both title and content changes use the same debounce pattern with a `useRef<ReturnType<typeof setTimeout>>`:

```ts
const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

const handleEditorChange = useCallback(() => {
  if (!activePageId || activePage?.locked) return;
  if (saveTimer.current) clearTimeout(saveTimer.current);
  saveTimer.current = setTimeout(() => {
    updateContent(activePageId, editor.document as PartialBlock[]);
  }, 500);
}, [activePageId, activePage?.locked, editor, updateContent]);
```

Using `useRef` for the timer (rather than `useState`) ensures that clearing and re-setting the timeout does not cause a re-render cycle. The timer is shared between title and content changes — if both fire rapidly, the last one wins.

### Word count subscription

The `WordCount` sub-component subscribes to `editor.onChange` independently:

```ts
useEffect(() => {
  const calc = () => {
    const text = editor.document
      .map((b) =>
        Array.isArray(b.content)
          ? (b.content as { text: string }[]).map((c) => c.text).join(" ")
          : ""
      )
      .join(" ");
    setCount(text.trim() ? text.trim().split(/\s+/).length : 0);
  };
  calc();            // count on mount
  return editor.onChange(calc);  // count on every change; returns cleanup
}, [editor]);
```

`editor.onChange(callback)` returns an unsubscribe function, which is returned from the `useEffect` cleanup. This ensures there is no memory leak when the editor instance is replaced on page switch.

### Table of Contents subscription

`TableOfContents` uses the same `editor.onChange` pattern to re-extract headings whenever the document changes:

```ts
useEffect(() => {
  setHeadings(extractHeadings(editor));
  return editor.onChange(() => setHeadings(extractHeadings(editor)));
}, [editor]);
```

`extractHeadings` iterates `editor.document`, filtering blocks of `type === "heading"` with non-empty text content. It reads `block.props.level` for the heading level (1, 2, or 3). The heading's `block.id` is used to scroll to it via `document.querySelector(`[data-id="${h.id}"]`)`.

### MantineProvider requirement

`BlockNoteView` is imported from `@blocknote/mantine`. This package requires Mantine's CSS variable context. Without `<MantineProvider>` wrapping the tree, the editor toolbar, slash-command menu, and table controls render unstyled. In `App.tsx`, `<MantineProvider>` wraps the entire component tree for this reason, even though no Mantine components are used directly in custom code.

---

## Dark Mode — End to End

Dark mode flows from a single boolean in the settings store to the visible CSS of every component.

### Step 1 — Store value

`useSettingsStore` holds `dark: boolean`. Initial value is `false`. Persisted to localStorage under `notion-clone-settings`.

### Step 2 — DOM class mutation on toggle

When `toggleDark` fires:

```ts
toggleDark: () =>
  set((state) => {
    const next = !state.dark;
    document.documentElement.classList.toggle("dark", next);
    return { dark: next };
  }),
```

`document.documentElement` is the `<html>` element. The `classList.toggle("dark", next)` call adds the `dark` class when `next` is `true` and removes it when `false`. This happens synchronously during the Zustand action, so the CSS change takes effect before the next paint.

### Step 3 — Re-application on mount

Because the DOM mutation only fires when `toggleDark` is called, not during store hydration from localStorage, `App.tsx` re-applies the class on mount:

```ts
useEffect(() => {
  document.documentElement.classList.toggle("dark", dark);
}, [dark]);
```

This runs once after the first render. The `dark` value is already set from localStorage hydration by the time this effect runs.

### Step 4 — Tailwind dark: utilities

Tailwind is configured with `darkMode: "class"` in `tailwind.config.js`. This means Tailwind generates `dark:` variant classes that only apply when an ancestor element has the `dark` class. Since the class is on `<html>`, every element in the tree is affected.

Every custom component provides both light and dark styles:

```tsx
// Example from Sidebar.tsx
className="bg-[#f7f7f5] dark:bg-neutral-900 border-gray-200 dark:border-neutral-800"
```

### Step 5 — BlockNote editor theme

`BlockNoteView` accepts a `theme` prop (`"light"` or `"dark"`). This is wired to the Zustand store:

```tsx
<BlockNoteView theme={dark ? "dark" : "light"} ... />
```

`dark` is destructured from `useSettingsStore()` inside the `Editor` component. Whenever `dark` changes, the component re-renders and passes the new theme to BlockNote's view.

---

## localStorage Persistence

### How Zustand persist works

Both stores are wrapped with `persist(factory, options)`:

```ts
export const usePageStore = create<PageStore>()(
  persist(
    (set) => ({ /* state + actions */ }),
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
```

**On app load:**
1. Zustand reads `localStorage.getItem("notion-clone-pages")`.
2. If the value exists, `JSON.parse` is called on it.
3. The parsed object is shallow-merged with the initial state (`pages: {}`, `activePageId: null`, etc.).
4. A single `set` call applies the merged state.

**On every store update:**
1. The `set` call fires.
2. Zustand's persist middleware intercepts the update.
3. The `partialize` function extracts the fields to persist (stripping action functions).
4. `JSON.stringify` is called on the extracted object.
5. `localStorage.setItem("notion-clone-pages", serialised)` is called synchronously.

### What is partialised

For `usePageStore`, the `partialize` option explicitly whitelists four fields: `pages`, `activePageId`, `expandedIds`, and `recentPageIds`. This is important because the store also contains action functions (`createPage`, `trashPage`, etc.) which cannot be JSON-serialised. Zustand would throw a `TypeError` (or silently produce `{}`) if those were included.

For `useSettingsStore`, no `partialize` is specified, but Zustand's default serialiser skips function values automatically, so `toggleDark`, `setSidebarWidth`, and `toggleSidebarCollapsed` are excluded from the serialised output.

### Key names

| Store | localStorage key |
|---|---|
| `usePageStore` | `notion-clone-pages` |
| `useSettingsStore` | `notion-clone-settings` |

### Schema changes and migration

If the `Page` interface gains a new field (e.g., `locked: boolean` was added after the initial release), existing localStorage data will not have that field. Zustand's shallow merge will simply leave it `undefined` for any old page objects.

To handle this safely:
1. Add the new field with a default value in the `newPage()` function so new pages always have it.
2. For existing pages loaded from localStorage, add a migration step or defensive access (`page.locked ?? false`) at the call site.
3. For breaking schema changes, use Zustand persist's `version` and `migrate` options:

```ts
persist(factory, {
  name: "notion-clone-pages",
  version: 2,
  migrate: (persistedState, version) => {
    if (version === 1) {
      // Migrate from version 1 to version 2
      Object.values(persistedState.pages).forEach(page => {
        if (page.locked === undefined) page.locked = false;
      });
    }
    return persistedState;
  },
})
```

### What happens when localStorage is full

localStorage has a per-origin quota of approximately 5–10 MB depending on the browser. When a write would exceed the quota, `localStorage.setItem` throws a `DOMException` with the name `QuotaExceededError`. Zustand's persist middleware does not catch this exception — it will propagate as an uncaught error.

**Practical implication:** Very large workspaces with many pages could eventually hit this limit. Mitigations:
- Regularly empty the trash (trashed pages occupy space until permanently deleted).
- Export and delete pages you no longer need.
- A future improvement could catch `QuotaExceededError` and show a warning banner.

---

## Testing Reference

### Configuration

`vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",   // Simulates browser DOM (required for localStorage, document)
    globals: true,          // No need to import describe/it/expect in each file
    setupFiles: ["./src/__tests__/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/__tests__/**", "src/main.tsx"],
    },
  },
});
```

### Setup file

`src/__tests__/setup.ts`:

```ts
import "@testing-library/jest-dom";

const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (typeof args[0] === "string" && args[0].includes("zustand")) return;
    originalError(...args);
  };
});
afterAll(() => { console.error = originalError; });
```

The `@testing-library/jest-dom` import adds custom matchers like `toBeInTheDocument()`. The `console.error` suppression prevents Zustand from spamming the test output with hydration warnings (since localStorage is empty in jsdom).

### Resetting store state between tests

**Never** rely on test execution order. Always reset to a known state in `beforeEach`:

```ts
function resetStore() {
  usePageStore.setState({
    pages: {},
    activePageId: null,
    expandedIds: [],
    recentPageIds: [],
  });
}

beforeEach(resetStore);
```

For `useSettingsStore`:

```ts
function resetSettings() {
  useSettingsStore.setState({
    dark: false,
    sidebarWidth: 240,
    sidebarCollapsed: false,
  });
}
```

`setState` on a Zustand store is the imperative override — it merges the provided object into the current state, making it perfect for test setup.

### The pure function pattern for testable utilities

`src/lib/exportMarkdown.ts` deliberately avoids importing React or Zustand. The `pageToMarkdown` function is purely functional:

```ts
export function pageToMarkdown(page: Page): string {
  return `# ${page.title}\n\n` + blocksToMarkdown(page.content ?? []);
}
```

This makes it directly testable with no mocking:

```ts
it("renders a heading block at the correct level", () => {
  const content = [
    { type: "heading", props: { level: 2 }, content: [{ type: "text", text: "Overview", styles: {} }] },
  ] as PartialBlock[];
  const md = pageToMarkdown(makePage({ content }));
  expect(md).toContain("## Overview");
});
```

When writing new utility functions, follow this pattern: keep them in `src/lib/`, accept plain data types as arguments, return plain values, and avoid side effects. This makes them trivially testable.

### All test files and what they cover

| File | What it tests |
|---|---|
| `src/__tests__/stores/pages.test.ts` | `createPage` (defaults, parentId, expand), `updateTitle`, `trashPage` (recursive), `restorePage`, `permanentDelete` (recursive), `emptyTrash`, `toggleFavorite`, `toggleExpand`, `updateCover`, `updateIcon` |
| `src/__tests__/stores/pageProperties.test.ts` | `addTag` (new tag, no duplicate), `removeTag`, `setStatus` (all values), `setPriority` |
| `src/__tests__/stores/duplicate.test.ts` | `duplicatePage` (new id, title suffix, same parentId, favorited=false, sets active) |
| `src/__tests__/stores/recentPagesLockCollapse.test.ts` | `recentPageIds` (add on create, prepend on navigate, no duplicates, capped at 10), `toggleSidebarCollapsed`, `toggleLocked` |
| `src/__tests__/stores/templates.test.ts` | `TEMPLATES` array (min 5, unique keys, required fields), `getTemplate` (found, not found), `createFromTemplate` (title+icon from template, non-empty content, sets active, fallback for unknown key) |
| `src/__tests__/lib/exportMarkdown.test.ts` | `pageToMarkdown` (title as H1, heading levels, bullet, checked/unchecked checkbox, bold, numbered list, code block), `exportPageAsMarkdown` (triggers anchor click, filename from title, untitled fallback) |

### Running specific tests

```bash
# Run only the store tests
npx vitest run src/__tests__/stores/

# Run a single test file
npx vitest run src/__tests__/stores/pages.test.ts

# Run tests matching a name pattern
npx vitest run -t "createPage"

# Watch mode for a single file
npx vitest src/__tests__/stores/pages.test.ts
```

---

## TDD Workflow — Worked Example

This section walks through adding a new feature — "pin a page to the top of the sidebar" — using the full TDD cycle.

### Phase 1 — Write the failing test

Create `src/__tests__/stores/pinned.test.ts`:

```ts
import { describe, it, expect, beforeEach } from "vitest";
import { usePageStore } from "../../store/pages";

function resetStore() {
  usePageStore.setState({ pages: {}, activePageId: null, expandedIds: [], recentPageIds: [] });
}

describe("page pinning", () => {
  beforeEach(resetStore);

  it("new page starts unpinned", () => {
    const id = usePageStore.getState().createPage();
    expect(usePageStore.getState().pages[id].pinned).toBe(false);
  });

  it("togglePinned pins an unpinned page", () => {
    const id = usePageStore.getState().createPage();
    usePageStore.getState().togglePinned(id);
    expect(usePageStore.getState().pages[id].pinned).toBe(true);
  });

  it("togglePinned unpins a pinned page", () => {
    const id = usePageStore.getState().createPage();
    usePageStore.getState().togglePinned(id);
    usePageStore.getState().togglePinned(id);
    expect(usePageStore.getState().pages[id].pinned).toBe(false);
  });
});
```

**Run the tests:**

```bash
npm test
```

Expected output: 3 tests fail. The first fails with `TypeError: usePageStore.getState().togglePinned is not a function` or similar.

### Phase 2 — Update the data model

In `src/types.ts`, add the `pinned` field to the `Page` interface:

```ts
export interface Page {
  // ... existing fields ...
  pinned: boolean;  // NEW — true when pinned to the top of the sidebar
}
```

### Phase 3 — Implement the store action

In `src/store/pages.ts`:

1. Add `pinned: false` to the `newPage()` return object.
2. Add `togglePinned: (id: string) => void` to the `PageStore` interface.
3. Implement the action inside `create()`:

```ts
togglePinned: (id) =>
  set((state) => ({
    pages: {
      ...state.pages,
      [id]: {
        ...state.pages[id],
        pinned: !state.pages[id].pinned,
      },
    },
  })),
```

**Run the tests again:**

```bash
npm test
```

All 3 tests should now pass. Also run the full suite to confirm nothing else broke.

### Phase 4 — Wire up the UI

In `src/components/Sidebar.tsx`, destructure `togglePinned` from the store and add it to the `PageItem` hover bar:

```tsx
const { ..., togglePinned } = usePageStore();

// In the hover bar JSX:
<button
  onClick={(e) => { e.stopPropagation(); togglePinned(page.id); }}
  title={page.pinned ? "Unpin" : "Pin to top"}
>
  📌
</button>
```

Add a "Pinned" section above Favorites in `Sidebar`:

```tsx
const pinned = Object.values(pages)
  .filter((p) => p.pinned && !p.deleted)
  .sort((a, b) => a.createdAt - b.createdAt);

// In JSX, above Favorites:
{pinned.length > 0 && (
  <div className="mt-1 mb-1">
    <div className="px-2 text-xs font-medium text-gray-400 uppercase tracking-wide">Pinned</div>
    {pinned.map((page) => (
      <PageItem key={page.id} page={page} depth={0} onExport={onExport} />
    ))}
  </div>
)}
```

### Phase 5 — Refactor

Review whether the implementation is clean, has no duplication, and follows conventions. The `togglePinned` implementation mirrors `toggleFavorite` exactly — consider whether the pattern should be extracted. In this case, since both toggles are one-liners, no extraction is warranted (YAGNI).

---

## Adding a New Feature — End to End

Follow this five-step pattern for any new capability.

### Step 1 — Update the data model (if needed)

Edit `src/types.ts`. Add the new field(s) to `Page` or `Template`. Use the narrowest type possible (`boolean` over `string`, union literals over `string`).

### Step 2 — Write tests (before implementation)

Create a new test file in `src/__tests__/stores/` or `src/__tests__/lib/`. Write tests that call real Zustand store actions or pure utility functions. Run `npm test` to confirm they fail.

### Step 3 — Add store action(s)

Open `src/store/pages.ts`. Add the new field to `newPage()` defaults, add the action signature to the `PageStore` interface, and implement it inside `create()`. Keep every action as a single `set` call with a pure state transformation.

### Step 4 — Wire up the component

Import and call the new action from the relevant component. For sidebar actions: edit `src/components/Sidebar.tsx` inside `PageItem`. For editor actions: edit `src/components/Editor.tsx`. For page-level metadata: edit `src/components/PropertyPanel.tsx`.

Derive filtered lists at the component level, not in the store:

```ts
// In the component body, not in the store:
const pinned = Object.values(pages).filter((p) => p.pinned && !p.deleted);
```

### Step 5 — Add a keyboard shortcut (if needed)

Global shortcuts live in `src/App.tsx` inside the `useEffect` with `window.addEventListener("keydown", handler)`. Add a new `else if` branch:

```ts
if (mod && e.shiftKey && e.key.toLowerCase() === "p") {
  e.preventDefault();
  // trigger the new feature
}
```

---

## Build and Deploy

### Production build

```bash
npm run build
```

The build command runs `tsc -b` (full TypeScript type check across all project references) and then Vite's production bundler. Output goes to `dist/`. A successful build produces:

```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js    # Main bundle (React, BlockNote, Zustand, etc.)
│   └── index-[hash].css   # Tailwind output (only used classes)
```

Typical output sizes (approximate):
- JS bundle: ~800 KB–1.2 MB (BlockNote is large)
- CSS bundle: ~20–40 KB

### Preview the build locally

```bash
npm run preview
```

Starts a local static file server on port 4173 serving the `dist/` directory. Use this to verify the production build behaves correctly before deploying.

### Deploy to Vercel

1. Push the repository to GitHub, GitLab, or Bitbucket.
2. Create a new project on vercel.com and import the repository.
3. Vercel auto-detects Vite. The build command (`npm run build`) and output directory (`dist`) are set automatically.
4. Click Deploy. No environment variables needed.

### Deploy to Netlify

1. Connect your repository on netlify.com.
2. Set build command: `npm run build`.
3. Set publish directory: `dist`.
4. Click Deploy. No environment variables needed.
5. If you add `react-router-dom` routing in the future, add a `_redirects` file to `public/` with the content `/* /index.html 200` to support client-side routing.

### Deploy to GitHub Pages

Add a GitHub Actions workflow (`.github/workflows/deploy.yml`):

```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### Serve from any CDN

Upload the contents of `dist/` to any object storage bucket (S3, GCS, Cloudflare R2) configured for static website hosting. Set the error/404 document to `index.html` — required if client-side routing is added in the future.

---

## Code Style Rules

### TypeScript

- **Strict mode is on.** `tsconfig.app.json` enables `strict: true`. Do not use `any` without a comment explaining the exception.
- Type component props with a local `interface Props { ... }` declared directly above the component function. Do not use `React.FC<>`.
- Use `type` for union/intersection aliases (`PageStatus`, `PagePriority`). Use `interface` for object shapes that represent a record or store (`Page`, `PageStore`, `Template`).
- Use `import type { ... }` for type-only imports to enable TypeScript's type-only erasure optimisation.

### React

- Use function components exclusively. No class components.
- Use named exports for all components: `export function Sidebar() { ... }`. The root `App` uses a default export to satisfy Vite's expected entry point convention.
- Internal sub-components (`PageItem`, `TrashSection`, `RecentSection`, `IconPicker`, `WordCount`, `CoverPicker`) live in the same file as their parent. Move to a separate file only when the file grows unmanageably large (guideline: over ~300 lines).
- Use `useCallback` for event handlers passed as props or referenced in `useEffect` dependency arrays.
- Use `useMemo` sparingly — only when a derivation is demonstrably expensive and profiling confirms the issue.
- Debounce all store writes that occur on every keystroke: 300 ms for title fields, 500 ms for body content.
- Derive filtered lists inline during render; do not store derived data in `useState` or the Zustand store.

### Zustand

- One store per concern. Never merge `pages` and `settings` into a single store.
- Actions stay co-located with their store definition.
- Never call store actions from inside another store action directly — use `set` with a pure state transformation. If one action needs to read the current state, use the `set((state) => ...)` functional form.
- Do not mock Zustand stores in tests — test real store behavior.

### Tailwind CSS

- All styling uses Tailwind utility classes. Do not write custom CSS classes for component behavior.
- Always provide both light and dark Tailwind variants: `text-gray-700 dark:text-neutral-300`.
- Use responsive prefixes (`xl:hidden`, `hidden xl:flex`) for breakpoint-based layout rather than JavaScript-driven conditional rendering.
- Dark mode is driven by the `dark` class on `<html>` — never override this with inline styles.

### File naming

| Kind | Convention | Example |
|---|---|---|
| Component files | PascalCase.tsx | `SearchModal.tsx` |
| Store files | camelCase.ts | `pages.ts` |
| Utility/lib files | camelCase.ts | `exportMarkdown.ts` |
| Test files | `*.test.ts` or `*.test.tsx` | `pages.test.ts` |

### Import grouping

Organise imports in three groups separated by blank lines:

```ts
// 1. External libraries
import React, { useCallback, useRef, useState } from "react";
import { Lock, Unlock } from "lucide-react";

// 2. Internal absolute paths (store, lib, types)
import { usePageStore } from "../store/pages";
import { useSettingsStore } from "../store/settings";
import type { Page } from "../types";

// 3. Relative paths (sibling components)
import { Breadcrumbs } from "./Breadcrumbs";
import { Cover } from "./Cover";
```

---

## Contributing Guidelines

### Before starting work

1. Check open issues and pull requests to avoid duplicating effort.
2. For non-trivial changes, open an issue first to discuss the approach.
3. Pull the latest `main` before branching.

### Branch naming

Use descriptive branch names:
- Feature: `feat/page-pinning`
- Fix: `fix/word-count-zero`
- Docs: `docs/expand-developer-guide`
- Refactor: `refactor/extract-use-debounce`

### Commit messages

Write clear, present-tense commit messages. One sentence is usually enough:
- "Add togglePinned action and Pinned sidebar section"
- "Fix word count not initialising on page load"
- "Refactor duplicate template logic into shared helper"

Do not amend commits that have already been pushed. Create a new commit for fixes.

### Pull request checklist

Before opening a PR, confirm:
- [ ] All existing tests pass: `npm test`
- [ ] No TypeScript errors: `npx tsc --noEmit`
- [ ] No lint errors: `npm run lint`
- [ ] New behaviour has tests written before the implementation
- [ ] Both light and dark mode variants tested visually
- [ ] No `console.log` statements left in the code
- [ ] No new dependencies added without justification in the PR description

### What not to do

- Do not add `fetch`, Axios, or any server communication — this is a fully client-side app.
- Do not edit `index.css` to override Tailwind base styles or BlockNote styles globally.
- Do not install additional UI libraries beyond Mantine, Lucide, and BlockNote without prior discussion.
- Do not mock Zustand stores in tests.
- Do not amend commits after pushing.
- Do not leave `any` types without an explanatory comment.
