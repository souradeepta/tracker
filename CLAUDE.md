# CLAUDE.md — Notion Clone (tracker)

This file is loaded automatically by Claude Code when working in this directory.

---

## Project Overview

A Notion-clone single-page application built with React 19, TypeScript, and BlockNote. All data is stored client-side in `localStorage` via Zustand's `persist` middleware — there is no backend. The UI follows Notion's layout: a resizable sidebar for page navigation and an editor panel for rich-text content.

**Tech stack:**
- React 19 + TypeScript (strict)
- Vite 8 (bundler / dev server)
- BlockNote 0.50.x (`@blocknote/core`, `@blocknote/react`, `@blocknote/mantine`) — rich text editor
- Zustand 5 with `persist` middleware — state management
- Tailwind CSS 4 (class-based dark mode via `darkMode: "class"`)
- Mantine 9 (wraps BlockNote's UI primitives)
- Lucide React (icons)
- UUID v14 (page ID generation)
- Vitest (testing framework — add `vitest` to devDependencies before writing tests)

---

## Key Commands

```bash
npm run dev          # Start Vite dev server at http://localhost:5173
npm run build        # Type-check (tsc -b) then Vite production build
npm run lint         # ESLint
npx tsc --noEmit     # Type-check only, no output
npm test             # Run Vitest test suite (once configured)
```

---

## File Structure

```
tracker/
├── index.html
├── package.json
├── tailwind.config.js        # darkMode: "class", content: ./src/**
├── vite.config.ts
├── src/
│   ├── main.tsx              # React root mount
│   ├── App.tsx               # Root layout: Sidebar + Editor + SearchModal
│   ├── index.css
│   ├── types.ts              # Page interface
│   ├── store/
│   │   ├── pages.ts          # usePageStore (persisted to "notion-clone-pages")
│   │   └── settings.ts       # useSettingsStore (persisted to "notion-clone-settings")
│   ├── components/
│   │   ├── Sidebar.tsx       # Navigation, favorites, trash, resize handle
│   │   ├── Editor.tsx        # BlockNote editor, icon picker, word count, cover
│   │   ├── Breadcrumbs.tsx   # Ancestor path for active page
│   │   ├── Cover.tsx         # Gradient cover image + COVERS map
│   │   ├── SearchModal.tsx   # Full-text search across all pages
│   │   └── TableOfContents.tsx  # Heading outline panel
│   ├── lib/
│   │   └── exportMarkdown.ts # Converts a Page's BlockNote content to .md download
│   └── __tests__/            # All test files live here
│       └── *.test.ts(x)
```

---

## Design Principles

1. **SOLID** — each module has one reason to change; stores own data logic, components own rendering logic.
2. **Component isolation** — components receive data via props or direct store subscriptions; avoid prop-drilling beyond two levels.
3. **No premature abstraction** — do not extract a helper or hook until the pattern repeats at least twice.
4. **YAGNI** — do not add features, options, or configuration that are not currently required.

---

## TDD Requirement

**All new features must have tests written before the implementation.** This project uses Vitest.

Workflow:
1. Write a failing test in `src/__tests__/` that describes the expected behavior.
2. Run `npm test` to confirm it fails.
3. Write the minimum implementation to make the test pass.
4. Refactor while keeping tests green.

No exceptions. Do not write implementation code before a corresponding test exists.

---

## Data Model

### `Page` (src/types.ts)

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | UUID v4 |
| `title` | `string` | Editable in Editor header |
| `content` | `PartialBlock[]` | BlockNote document blocks |
| `parentId` | `string \| null` | Null = root-level page |
| `icon` | `string` | Emoji character |
| `cover` | `string \| null` | Gradient key from `COVERS` map, or null |
| `favorited` | `boolean` | Shown in sidebar Favorites section |
| `deleted` | `boolean` | Soft-delete; shown in Trash |
| `deletedAt` | `number \| null` | Timestamp of soft-delete |
| `createdAt` | `number` | Unix timestamp (ms) |
| `updatedAt` | `number` | Updated on every mutation |

### `usePageStore` actions (src/store/pages.ts)

- `createPage(parentId?)` — creates a new page, sets it active, auto-expands parent
- `trashPage(id)` — soft-deletes page and all descendants recursively
- `restorePage(id)` — un-deletes a single page (does not restore descendants)
- `permanentDelete(id)` — removes page and all descendants from store entirely
- `emptyTrash()` — permanently removes all soft-deleted pages
- `updateTitle(id, title)` — debounced from Editor (300 ms)
- `updateIcon(id, icon)` — from IconPicker in Editor
- `updateCover(id, cover)` — from Cover component
- `updateContent(id, content)` — debounced from BlockNote onChange (500 ms)
- `setActive(id)` — sets the active (visible) page
- `toggleExpand(id)` — collapses/expands a page's children in sidebar
- `toggleFavorite(id)` — toggles the `favorited` flag

### `useSettingsStore` (src/store/settings.ts)

- `dark: boolean` — dark mode state; toggled via `toggleDark()` which also updates `document.documentElement.classList`
- `sidebarWidth: number` — clamped to [160, 480] px by `setSidebarWidth(w)`

---

## Coding Standards

- **TypeScript strict mode** — no `any`, no implicit type casts.
- **Tailwind CSS only** for layout, spacing, color, and typography. Do not write custom CSS classes for component behavior.
- **Zustand** for all persistent and shared UI state. Do not use `useState` for data that needs to survive navigation or be shared between components.
- **No `useEffect` for derived data** — compute derived values inline during render.
- **Debounce writes to the store** — Editor already debounces title (300 ms) and content (500 ms); follow this pattern for any new frequent-write input.
- **Dark mode** — always provide both light and dark Tailwind variants (`text-gray-700 dark:text-neutral-300`).
- Export named functions for components (`export function Foo`), not default exports from component files.

---

## Testing Conventions

- Test files live in `src/__tests__/` with the `.test.ts` or `.test.tsx` extension.
- Use one `describe` block per module being tested.
- Test store logic by calling real Zustand store actions — do not mock the store.
- For component tests, render with any required providers (MantineProvider, etc.).
- Group assertions into logical `it` blocks; one behavior per `it`.

---

## What NOT to Do

- **No backend calls** — this is a fully client-side app. Do not add `fetch`, Axios, or any server communication.
- **No global CSS overwrites** — do not edit `index.css` to override Tailwind base styles or BlockNote styles globally.
- **No mocking Zustand stores in tests** — test real store behavior; mocking the store hides real bugs.
- **No installing UI libraries** beyond what is already present (Mantine, Lucide, BlockNote). Justify any new dependency.
- **No `console.log` left in committed code.**
- **Do not amend commits** — always create a new commit when fixing a hook failure or adding more changes.
