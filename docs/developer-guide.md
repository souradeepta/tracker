# Developer Guide

Onboarding reference for contributors to the Notion-clone web app.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Project Structure](#project-structure)
4. [State Management](#state-management)
5. [Adding a New Feature](#adding-a-new-feature)
6. [Testing Approach](#testing-approach)
7. [Build and Deploy](#build-and-deploy)
8. [Code Style Guidelines](#code-style-guidelines)

---

## Prerequisites

| Tool | Minimum version | Notes |
|---|---|---|
| Node.js | 18 LTS | 20+ recommended |
| npm | 9 | Comes with Node |
| A modern browser | Chrome 115 / Firefox 117 / Safari 17 | localStorage must be enabled |

No backend, database, or environment variables are required. The app is entirely client-side.

---

## Initial Setup

```bash
# Clone the repository
git clone <repo-url>
cd tracker

# Install dependencies
npm install

# Start the dev server (Vite HMR on http://localhost:5173)
npm run dev

# Type-check without emitting (useful in CI)
npx tsc --noEmit

# Lint
npm run lint

# Production build
npm run build

# Preview the production build locally
npm run preview
```

The `npm run dev` command starts Vite's dev server with Hot Module Replacement. Any file save triggers an instant in-browser update without losing editor state.

---

## Project Structure

```
tracker/
├── index.html                  # Vite entry HTML; mounts #root
├── vite.config.ts              # Vite config (React plugin only)
├── tailwind.config.js          # Tailwind CSS v4 config
├── postcss.config.js           # PostCSS (autoprefixer)
├── tsconfig.json               # Root TS config (references app + node)
├── tsconfig.app.json           # App source TS config
├── tsconfig.node.json          # Build-tool TS config
├── eslint.config.js            # ESLint flat config (TS + React hooks)
├── package.json
└── src/
    ├── main.tsx                # React root — mounts <App /> into #root
    ├── index.css               # Tailwind directives + base reset
    ├── App.tsx                 # Root component; keyboard shortcuts; export handler
    ├── types.ts                # Shared TypeScript types (Page interface)
    ├── store/
    │   ├── pages.ts            # Zustand page store (CRUD, navigation, favorites)
    │   └── settings.ts         # Zustand settings store (dark mode, sidebar width)
    ├── components/
    │   ├── Sidebar.tsx         # Left nav: page tree, favorites, trash, search button
    │   ├── Editor.tsx          # Main editing surface (BlockNote + icon picker + word count)
    │   ├── Cover.tsx           # Gradient cover banner + picker
    │   ├── Breadcrumbs.tsx     # Ancestor path navigation
    │   ├── SearchModal.tsx     # Keyboard-navigable search overlay
    │   └── TableOfContents.tsx # Auto-generated heading index (xl screens only)
    └── lib/
        └── exportMarkdown.ts   # Converts PartialBlock[] → Markdown string → file download
```

### Key files explained

**`src/types.ts`**  
Defines the single `Page` interface used everywhere. Any change to the data shape must start here and ripple outward.

**`src/store/pages.ts`**  
The `usePageStore` Zustand store holds all page data in a flat `Record<string, Page>` map. The `persist` middleware serialises `pages`, `activePageId`, and `expandedIds` to localStorage under the key `notion-clone-pages`.

**`src/store/settings.ts`**  
The `useSettingsStore` Zustand store holds `dark: boolean` and `sidebarWidth: number`. Persisted under `notion-clone-settings`. The `toggleDark` action mutates `document.documentElement.classList` directly as a side effect.

**`src/App.tsx`**  
The application shell. Renders `<Sidebar>`, `<Editor>`, and `<SearchModal>` side-by-side inside a full-screen flex container. Attaches the three global keyboard shortcuts (Ctrl/Cmd+K, Ctrl/Cmd+N, Ctrl/Cmd+Shift+D). Owns the `handleExport` callback that reads `pages[id]` from the store and calls `exportPageAsMarkdown`.

**`src/components/Sidebar.tsx`**  
Contains two internal components:
- `PageItem` — recursive tree node. Renders icon, title, expand chevron, and a hover action bar (favorite, export, trash, add sub-page).
- `TrashSection` — collapsible panel listing soft-deleted pages with restore and permanent-delete buttons.

The sidebar resize handle is implemented with raw `mousemove`/`mouseup` listeners attached to `window` on drag start, cleaned up on drag end.

**`src/components/Editor.tsx`**  
Contains two internal components:
- `IconPicker` — 40-emoji grid rendered in a floating div; closes on outside click via a `mousedown` document listener.
- `WordCount` — subscribes to `editor.onChange` to recount words from `editor.document` on every change.

The main `Editor` component calls `useCreateBlockNote` with `[activePageId]` as a dependency array so a fresh editor instance is created whenever the active page changes. Title changes are debounced 300 ms; content changes are debounced 500 ms.

**`src/lib/exportMarkdown.ts`**  
Pure function — no React, no store imports. `blocksToMarkdown(blocks, depth)` recurses over `PartialBlock[]`. `exportPageAsMarkdown(page)` builds the full Markdown string, creates a `Blob`, and triggers a browser download via a temporary `<a>` element.

---

## State Management

The app uses **Zustand 5** with the `persist` middleware. There are exactly two stores.

### `usePageStore` — `src/store/pages.ts`

**Shape:**
```ts
interface PageStore {
  pages: Record<string, Page>;   // flat map, keyed by UUID
  activePageId: string | null;   // which page the editor shows
  expandedIds: string[];         // sidebar tree nodes that are open
  // ... actions
}
```

**Persisted keys:** `pages`, `activePageId`, `expandedIds`  
**localStorage key:** `notion-clone-pages`

**Actions and their behaviour:**

| Action | Signature | Notes |
|---|---|---|
| `createPage` | `(parentId?: string \| null) => string` | Generates UUID v4; picks a random icon from the 10-item `ICONS` array; auto-expands the parent; sets the new page as active; returns the new id |
| `trashPage` | `(id: string) => void` | Recursively marks the target and all descendants as `deleted: true`, sets `deletedAt: Date.now()`; re-targets `activePageId` to the first live page if necessary |
| `restorePage` | `(id: string) => void` | Sets `deleted: false, deletedAt: null` for the single page only (not its children) |
| `permanentDelete` | `(id: string) => void` | Recursively removes the page and all descendants from the `pages` map |
| `emptyTrash` | `() => void` | Filters `pages` to only non-deleted entries |
| `updateTitle` | `(id, title) => void` | Updates `title` and `updatedAt` |
| `updateIcon` | `(id, icon) => void` | Updates `icon` and `updatedAt` |
| `updateCover` | `(id, cover) => void` | Updates `cover` (gradient key or `null`) and `updatedAt` |
| `updateContent` | `(id, content) => void` | Updates `content: PartialBlock[]` and `updatedAt` |
| `setActive` | `(id: string \| null) => void` | Sets `activePageId` |
| `toggleExpand` | `(id: string) => void` | Adds/removes `id` from `expandedIds` |
| `toggleFavorite` | `(id: string) => void` | Flips `page.favorited` boolean |

### `useSettingsStore` — `src/store/settings.ts`

**Shape:**
```ts
interface SettingsStore {
  dark: boolean;           // theme preference
  sidebarWidth: number;    // pixel width, clamped [160, 480]
  toggleDark: () => void;
  setSidebarWidth: (w: number) => void;
}
```

**Persisted keys:** entire store  
**localStorage key:** `notion-clone-settings`

`setSidebarWidth` clamps its argument: `Math.min(480, Math.max(160, w))`.

### How persistence works

Both stores wrap their factory in `persist(factory, { name: "key", partialize? })`. On app load Zustand reads the matching localStorage key, merges the stored value into the initial state, and calls `set` once. From that point forward every `set` call triggers a JSON serialisation of the partialised state back to localStorage.

For `usePageStore`, the `partialize` option is used to exclude transient state that does not need to survive a page refresh (none in this case — all three persisted fields are meaningful across sessions).

---

## Adding a New Feature

Follow this pattern for any new capability.

### Step 1 — Update the data model (if needed)

Edit `src/types.ts`. Example: adding a `pinned` flag.

```ts
// src/types.ts
export interface Page {
  // ... existing fields
  pinned: boolean;   // NEW
}
```

### Step 2 — Add store action(s)

Open `src/store/pages.ts`. Add the new field to the initial page object in `createPage`, add a new action to the `PageStore` interface, and implement it inside the `create` call.

```ts
// Inside the PageStore interface
togglePinned: (id: string) => void;

// Inside create()(...)
// In createPage, add pinned: false to the initial Page object

togglePinned: (id) =>
  set((state) => ({
    pages: {
      ...state.pages,
      [id]: { ...state.pages[id], pinned: !state.pages[id].pinned },
    },
  })),
```

Because `partialize` currently passes all three top-level fields (`pages`, `activePageId`, `expandedIds`), and `pages` includes the full `Page` objects, the new `pinned` field will be persisted automatically.

### Step 3 — Wire up the component

Import and call the new action from the relevant component. For a sidebar action button, edit `src/components/Sidebar.tsx` and destructure `togglePinned` from `usePageStore()` inside `PageItem`.

```tsx
// src/components/Sidebar.tsx — inside PageItem
const { ..., togglePinned } = usePageStore();

// In the hover action bar JSX
<button onClick={(e) => { e.stopPropagation(); togglePinned(page.id); }}>
  📌
</button>
```

### Step 4 — Reflect new state in the UI

If the feature changes what the sidebar or editor renders (e.g., a "Pinned" section at the top), add the filtered list derivation at the component level:

```tsx
// src/components/Sidebar.tsx — inside Sidebar()
const pinned = Object.values(pages).filter((p) => p.pinned && !p.deleted);
```

Then render it as a new section above or below Favorites, mirroring the existing Favorites section pattern.

### Step 5 — Add a keyboard shortcut (optional)

Global shortcuts live in `src/App.tsx` inside the `useEffect` that calls `window.addEventListener("keydown", handler)`. Add a new `else if` branch following the existing pattern.

---

## Testing Approach

The project ships with **no test files** at the time of writing, but the toolchain supports **Vitest** as the natural testing choice given the Vite build pipeline.

### Recommended setup

```bash
npm install -D vitest @testing-library/react @testing-library/user-event jsdom
```

Add to `vite.config.ts`:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
  },
});
```

### What to test

**Store actions (pure unit tests)** — Zustand stores are plain functions. Test them by importing `usePageStore`, calling actions, and asserting on `getState()`.

```ts
// Example: src/store/pages.test.ts
import { usePageStore } from "./pages";

beforeEach(() => usePageStore.setState({ pages: {}, activePageId: null, expandedIds: [] }));

test("createPage assigns a random icon and sets activePageId", () => {
  const id = usePageStore.getState().createPage(null);
  const page = usePageStore.getState().pages[id];
  expect(page.icon).toBeTruthy();
  expect(usePageStore.getState().activePageId).toBe(id);
});

test("trashPage marks page and children as deleted", () => {
  const parentId = usePageStore.getState().createPage(null);
  const childId = usePageStore.getState().createPage(parentId);
  usePageStore.getState().trashPage(parentId);
  expect(usePageStore.getState().pages[parentId].deleted).toBe(true);
  expect(usePageStore.getState().pages[childId].deleted).toBe(true);
});
```

**Export logic (pure unit test)** — `blocksToMarkdown` in `src/lib/exportMarkdown.ts` is a pure function. It can be exported and tested without any browser or React context.

**Component tests** — use `@testing-library/react` with `render` + `userEvent`. Mock `usePageStore` with `vi.mock("../store/pages")` to control state.

### TDD workflow

1. Write a failing test that describes the desired behaviour.
2. Implement the store action or component change.
3. Run `npx vitest run` (or `npx vitest` for watch mode) until the test passes.
4. Refactor with confidence.

---

## Build and Deploy

### Production build

```bash
npm run build
```

Outputs to `dist/`. The build runs `tsc -b` (full type-check) then Vite's bundler. The result is a set of static HTML/JS/CSS files with no server-side component.

### Preview locally

```bash
npm run preview
```

Serves the `dist/` folder on a local HTTP server (default port 4173).

### Deploy

Because the app is entirely static, it can be deployed to any static host:

- **Vercel** — push to a connected Git repo; Vercel detects Vite automatically.
- **Netlify** — set build command `npm run build` and publish directory `dist`.
- **GitHub Pages** — use the `gh-pages` package or a GitHub Actions workflow.
- **Any CDN / object storage** — upload `dist/` contents, configure the bucket for static website hosting, and set the error document to `index.html` (required for client-side routing if added in the future).

No environment variables are needed.

---

## Code Style Guidelines

### TypeScript

- **Strict mode is on** (`tsconfig.app.json` inherits strict settings). Do not use `any` without an explicit comment explaining why.
- Always type component props with a local `interface Props { ... }` or inline the type — do not use `React.FC<>`.
- Prefer `type` for union/intersection aliases and `interface` for object shapes that describe a data record (like `Page`) or a store (`PageStore`).

### React

- Use function components exclusively. No class components.
- Prefer named exports for components (`export function Sidebar`). The root `App` uses a default export to satisfy Vite conventions.
- Internal sub-components (e.g., `PageItem`, `TrashSection`, `IconPicker`, `WordCount`) live in the same file as their parent and are not exported. Move them to their own file only if they grow large enough to warrant it.
- Use `useCallback` for event handlers passed as props or used in `useEffect` dependency arrays. Use `useMemo` only when a derivation is demonstrably expensive.
- Debounce store writes that happen on every keystroke (title: 300 ms, content: 500 ms) to avoid excessive localStorage writes.

### Zustand

- One store per concern. Do not merge `pages` and `settings` into a single store.
- Keep actions co-located with the store definition (not in separate files).
- Derive filtered lists (e.g., `rootPages`, `favorites`, `trashed`) at the call site inside the component, not inside the store — this avoids stale closure bugs and keeps the store shape minimal.

### Tailwind CSS

- Use Tailwind utility classes for all styling. Do not write custom CSS unless there is no Tailwind equivalent.
- Dark mode is driven by the `dark` class on `<html>` (toggled by `useSettingsStore.toggleDark`). Use `dark:` prefixed utilities for dark-mode variants.
- Prefer responsive prefixes (`xl:`, `hidden xl:flex`) over JavaScript-driven conditional rendering for layout breakpoints.

### File naming

- Component files: `PascalCase.tsx` (e.g., `Sidebar.tsx`).
- Store files: `camelCase.ts` (e.g., `pages.ts`).
- Utility files: `camelCase.ts` (e.g., `exportMarkdown.ts`).

### Imports

- Group imports: external libraries first, then internal absolute paths, then relative paths. Keep each group separated by a blank line.
- Import types with `import type { ... }` to help the TypeScript compiler with type-only erasure.
