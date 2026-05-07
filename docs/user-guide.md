# User Guide

A Notion-inspired note-taking app that runs entirely in your browser. All data is stored locally in your browser's `localStorage` — no account, no server, no sync required.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Pages and Sub-pages](#pages-and-sub-pages)
3. [The Editor](#the-editor)
4. [Icons](#icons)
5. [Cover Images](#cover-images)
6. [Favorites](#favorites)
7. [Trash](#trash)
8. [Search](#search)
9. [Table of Contents](#table-of-contents)
10. [Export to Markdown](#export-to-markdown)
11. [Dark Mode](#dark-mode)
12. [Resizing the Sidebar](#resizing-the-sidebar)
13. [Keyboard Shortcuts](#keyboard-shortcuts)
14. [Tips and Tricks](#tips-and-tricks)
15. [FAQ](#faq)

---

## Getting Started

Open the app URL in any modern browser. On the first launch you will see an empty workspace with the message "No pages yet — click + to create one."

**Create your first page:**

1. Click the **+** button next to the "Pages" heading in the sidebar, or click **New page** at the very bottom of the sidebar.
2. The editor opens immediately with an "Untitled" page.
3. Click the large title area at the top and type a name for your page.
4. Press **Enter** or click into the body area and start writing.

Your work is saved automatically as you type — no Save button needed.

---

## Pages and Sub-pages

Pages are the core organizational unit. They nest arbitrarily deep, forming a tree you can browse in the sidebar.

### Creating a page

- Click **+** next to "Pages" in the sidebar to create a root-level page.
- Hover over any existing page in the sidebar to reveal four action buttons. Click the **+** (rightmost) to create a sub-page directly under that page.
- Use the keyboard shortcut **Ctrl/Cmd + N** to create a new root-level page at any time.

### Navigating pages

- Click any page in the sidebar to open it in the editor.
- Pages with sub-pages show a **▶** chevron. Click it to expand or collapse the branch.
- A highlighted row indicates the currently active page.

### Sub-pages and nesting

- Sub-pages are indented under their parent in the sidebar (16 px per level).
- When you open a sub-page, the editor shows a **breadcrumb trail** above the icon that shows the full ancestor path (e.g., `📄 Project › 📝 Meeting Notes › ✅ Action Items`). Click any ancestor in the breadcrumb to navigate to it.
- Sub-pages are sorted by creation time within each parent.

### Renaming a page

Click the large title field at the top of the editor and edit it inline. The sidebar updates automatically after a 300 ms debounce.

---

## The Editor

The editor is powered by **BlockNote 0.50**, a block-based rich text editor similar to Notion.

### Block types

Type `/` anywhere in the body to open the BlockNote slash-command menu and insert:

| Block | Description |
|---|---|
| Paragraph | Default block for prose text |
| Heading 1 / 2 / 3 | Section headings (also power the Table of Contents) |
| Bullet list | Unordered list item |
| Numbered list | Ordered list item |
| Check list | To-do item with a checkbox |
| Code block | Monospaced code with no inline formatting |
| Quote | Block quotation |
| Image | Embed an image by URL |
| Table | Grid layout |

### Inline formatting

Select text to reveal the inline toolbar:

- **Bold** — Ctrl/Cmd + B
- _Italic_ — Ctrl/Cmd + I
- `Code` — Ctrl/Cmd + E
- ~~Strikethrough~~
- Hyperlinks

### Auto-save

Content is saved to localStorage automatically after **500 ms** of inactivity. The footer bar shows the last-updated date and a live word count.

### Word count

The footer at the bottom of the editor shows a real-time word count. It recounts every time the document changes.

---

## Icons

Every page has an emoji icon displayed at the top of the editor and next to the title in the sidebar.

- A random icon is assigned from a pool of 10 options when a page is created.
- **To change the icon:** click the large emoji displayed above the page title. A picker grid of 40 emoji options appears. Click any emoji to apply it immediately.
- The picker closes when you click outside of it.

---

## Cover Images

A decorative gradient banner can be displayed at the top of each page.

### Adding a cover

Hover near the top of the editor area (just below the sidebar edge). An **"Add cover"** button appears. Click it to open the gradient picker and choose from 12 built-in gradients:

| Key | Visual style |
|---|---|
| aurora | Purple-to-indigo |
| sunset | Pink-to-red |
| ocean | Blue-to-cyan |
| forest | Green-to-teal |
| fire | Pink-to-yellow |
| night | Deep dark purple |
| peach | Warm cream-to-salmon |
| mint | Aqua-to-blush |
| slate | Gray-to-white |
| rose | Pink-to-lavender |
| lemon | Yellow-to-peach |
| berry | Lavender-to-pink |

### Changing or removing a cover

Hover over the existing cover banner to reveal two buttons in the bottom-right corner:

- **Change** — opens the gradient picker again.
- **Remove** — removes the cover entirely (reverts to the bare top strip).

---

## Favorites

Star any page to pin it in a dedicated "Favorites" section at the top of the sidebar.

- **To favorite a page:** hover over it in the sidebar and click the **star** (☆) icon. The star fills in to indicate the page is favorited.
- **To unfavorite:** hover over the page and click the filled star again.
- The Favorites section only appears in the sidebar when at least one page is favorited.
- Favorited pages still appear in the regular Pages tree — the Favorites section is an additional shortcut, not a separate location.
- Trashing a page keeps the favorite flag, but the page no longer appears in the Favorites section while deleted.

---

## Trash

Deleted pages are soft-deleted and held in a recoverable Trash area.

### Moving a page to trash

Hover over a page in the sidebar and click the **trash** (🗑) icon.

- The page and **all of its sub-pages** are marked as deleted recursively.
- If the trashed page was the active page, the editor switches to the next available live page automatically.

### Viewing trash

A collapsible **Trash (n)** section appears at the bottom of the sidebar whenever at least one page is in the trash. Click it to expand and see all deleted pages.

### Restoring a page

Hover over any trashed page and click the **↩** (restore) icon. The page is revived and reappears in the sidebar. Note that restoring a page does **not** automatically restore its parent if the parent is also trashed — restore the parent first.

### Permanent deletion

Hover over a trashed page and click the **✕** icon to permanently delete it and all of its sub-pages. This cannot be undone.

### Empty trash

Click **Empty trash** at the bottom of the expanded trash list to permanently delete every trashed page at once.

---

## Search

The search modal lets you find any live page by title.

### Opening search

- Click **Search** in the top section of the sidebar.
- Press **Ctrl/Cmd + K** anywhere in the app.

### Using search

- When opened with no query, the modal shows the first 8 pages.
- Type to filter by page title (case-insensitive substring match).
- Navigate the list with the **↑ / ↓** arrow keys.
- Press **Enter** to open the highlighted page.
- Press **Esc** or click outside the modal to close it without navigating.

---

## Table of Contents

When a page contains heading blocks (H1, H2, or H3), an "On this page" panel appears automatically on the **right side** of the editor.

- Only visible on extra-large screens (xl breakpoint, ≥ 1280 px wide).
- The panel lists all headings in document order; H2 headings are indented 10 px, H3 headings 20 px.
- Click any heading entry to **smooth-scroll** the editor to that heading.
- Click the **"On this page"** label to collapse the panel while keeping it visible.
- The panel refreshes live as you add, edit, or remove headings.

---

## Export to Markdown

Any page can be exported as a `.md` file.

### How to export

- **From the sidebar:** hover over a page and click the **download** (⬇) icon.
- **From the editor footer:** click the **"Export .md"** link in the bottom-right corner of the editor.

### What is exported

The export includes:

- A top-level `# Title` heading derived from the page title.
- All block content converted to Markdown:
  - Headings → `#`, `##`, `###`
  - Bullet list items → `- item`
  - Numbered list items → `1. item`
  - Check list items → `- [x] done` or `- [ ] todo`
  - Code blocks → triple-backtick fences
  - Quotes → `> text`
  - Paragraphs → plain text
- Inline styles: **bold**, _italic_, `code`, ~~strikethrough~~.

Sub-pages are **not** recursively included in a single export — export each page individually.

The file is downloaded immediately as `<page-title>.md` (or `untitled.md` if the title is empty).

---

## Dark Mode

Toggle between light and dark themes:

- Click the **moon** (🌙) / **sun** (☀) icon in the workspace header (top of the sidebar).
- Press **Ctrl/Cmd + Shift + D**.

The preference is persisted in localStorage and restored on every visit.

---

## Resizing the Sidebar

Drag the thin vertical handle at the right edge of the sidebar to resize it. The sidebar width is constrained between **160 px** and **480 px**. The chosen width is saved automatically.

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| Ctrl/Cmd + K | Open / close search |
| Ctrl/Cmd + N | Create a new root-level page |
| Ctrl/Cmd + Shift + D | Toggle dark mode |
| Enter (in title field) | Move focus from the title to the editor body |
| ↑ / ↓ (in search) | Navigate search results |
| Enter (in search) | Open the selected page |
| Esc (in search) | Close search |
| Ctrl/Cmd + B | Bold selected text |
| Ctrl/Cmd + I | Italic selected text |
| Ctrl/Cmd + E | Inline code selected text |
| / (in editor body) | Open BlockNote slash command menu |

---

## Tips and Tricks

- **Instant navigation with search:** it is often faster to press Ctrl/Cmd + K and type a few characters than to expand the sidebar tree. Use it as your primary navigation method for large workspaces.

- **Build a hub page:** create a root-level index page that links to your main sections. Use Heading blocks to structure it — you'll get a free Table of Contents on the right.

- **Use breadcrumbs to climb the tree quickly:** when editing a deeply nested sub-page, click any ancestor in the breadcrumb bar to jump up without scrolling the sidebar.

- **Cover images for visual differentiation:** assign a distinct cover gradient to each major project. The gradient shows in the editor immediately and makes it easy to recognize a page at a glance.

- **Favorite your most-used pages:** the Favorites section stays at the top of the sidebar regardless of how deep those pages are in the tree.

- **Export before clearing storage:** all data lives in localStorage. If you clear browser storage, your data is gone. Periodically export important pages as Markdown files.

- **Check list blocks for tasks:** use `/checklist` in the editor to turn any block into a trackable to-do item. The export preserves the checked/unchecked state.

---

## FAQ

**Q: Is my data backed up anywhere?**
No. The app is fully client-side. Data lives only in your browser's localStorage for the key `notion-clone-pages`. If you clear browser data, or use a different browser or device, your pages will not be there. Export regularly as Markdown for backup.

**Q: Can I access my pages on another device?**
Not currently. There is no backend, sync, or export/import JSON feature. Your workspace is local to the browser where you created it.

**Q: What happens if I trash a page that has sub-pages?**
All sub-pages are trashed recursively at the same time. They all appear individually in the Trash list and can each be restored independently.

**Q: Can I restore a page whose parent was also trashed?**
Yes, but the parent must also be restored separately. Restoring a child page while its parent remains in trash will make the child appear as a root-level page in the sidebar (since the parent link is no longer live).

**Q: The Table of Contents is not showing. Why?**
The panel only renders when the page has at least one heading block (H1/H2/H3) with non-empty text, and only on screens that are at least 1280 px wide (`xl` Tailwind breakpoint).

**Q: I accidentally emptied the trash. Can I recover my pages?**
No. "Empty trash" performs an immediate permanent delete with no undo. Always restore pages you might still need before clicking Empty trash.

**Q: Why does the word count sometimes show 0 for a page with text?**
The word count only counts text content inside block inline content arrays. Certain block types (e.g., images, tables without text cells) may contribute 0 words even when they contain information.

**Q: How large can my workspace get?**
localStorage has a per-origin limit of roughly 5–10 MB depending on the browser. Rich content (many images embedded by URL reference, large amounts of text) will consume this space. There is currently no built-in storage usage indicator.
