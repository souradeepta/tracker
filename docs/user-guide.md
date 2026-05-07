# User Guide

A Notion-inspired note-taking app that runs entirely in your browser. All data is stored locally in your browser's `localStorage` — no account, no server, no sync required.

> **Important — data storage:** Everything you create lives in your browser's localStorage under the key `notion-clone-pages`. This means your data is tied to the specific browser and device you use. Clearing browser storage, switching browsers, or using a different device will result in an empty workspace. Export important pages regularly as Markdown files to keep offline backups.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Pages and Sub-pages](#pages-and-sub-pages)
3. [The Editor](#the-editor)
4. [Block Types Reference](#block-types-reference)
5. [Inline Formatting](#inline-formatting)
6. [Page Properties](#page-properties)
7. [Icons](#icons)
8. [Cover Images](#cover-images)
9. [Favorites](#favorites)
10. [Trash](#trash)
11. [Duplicate a Page](#duplicate-a-page)
12. [Page Lock](#page-lock)
13. [Search](#search)
14. [Templates](#templates)
15. [Recent Pages](#recent-pages)
16. [Table of Contents](#table-of-contents)
17. [Export to Markdown](#export-to-markdown)
18. [Dark Mode](#dark-mode)
19. [Resizing and Collapsing the Sidebar](#resizing-and-collapsing-the-sidebar)
20. [Keyboard Shortcuts](#keyboard-shortcuts)
21. [Context Menu](#context-menu)
22. [Tips and Tricks](#tips-and-tricks)
23. [FAQ](#faq)

---

## Getting Started

### What you see on first launch

Open the app URL in any modern browser (Chrome 115+, Firefox 117+, or Safari 17+). The first time you visit, the workspace is empty. The sidebar on the left shows "No pages — click + to create one." The main area on the right shows a centred placeholder with a document icon and the message "Select or create a page."

### Full getting-started walkthrough

**Step 1 — Create your first page**

Click the **+** button next to the "Pages" heading in the sidebar, or click the **New page** button at the very bottom of the sidebar. Either action immediately creates a page called "Untitled" and opens it in the editor.

**Step 2 — Give the page a title**

Click the large title field at the top of the editor (it shows placeholder text "Untitled" in light grey). Type a name, for example "My First Page". The sidebar updates automatically within 300 milliseconds to show the new title.

**Step 3 — Start writing content**

Press **Enter** while in the title field to move the cursor into the editor body. Alternatively, click anywhere in the body area. Start typing. A default paragraph block appears and your text is recorded.

**Step 4 — Use rich blocks**

At the beginning of any line, type `/` to open the slash-command menu. Scroll or type to filter available block types. Press **Enter** or click a block type to insert it. For example, type `/heading` and press Enter to insert a Heading 1 block, then type a section name.

**Step 5 — Navigate away and come back**

Click the **+** button in the sidebar again to create a second page and name it. To return to your first page, click its name in the sidebar. Notice that the editor shows exactly what you left — all content is auto-saved continuously. The sidebar highlights the currently open page with a grey background.

**Step 6 — Create a sub-page**

Hover over your first page in the sidebar to reveal its action buttons. Click the **+** button (the rightmost icon in the hover bar) to create a sub-page nested under it. The parent page shows a **▶** expand chevron, and clicking it reveals the child.

**Auto-save behaviour**

There is no Save button. Title changes are saved after 300 ms of inactivity. Body content changes are saved after 500 ms of inactivity. A "Updated [date]" timestamp in the editor footer confirms when the last save happened.

---

## Pages and Sub-pages

Pages are the core organizational unit. They nest arbitrarily deep, forming a tree you can browse in the sidebar.

### Creating a page

- Click **+** next to "Pages" in the sidebar to create a root-level page.
- Click **New page** in the sidebar footer to create a root-level page.
- Hover over any existing page in the sidebar to reveal its hover action bar. Click the **+** icon to create a sub-page directly under that page.
- Press **Ctrl+N** (Windows/Linux) or **Cmd+N** (Mac) to create a new root-level page at any time.

### Navigating pages

- Click any page name in the sidebar to open it in the editor.
- Pages with at least one sub-page show a **▶** (ChevronRight) icon to their left. Click it to expand the branch and reveal children. Click **▼** (ChevronDown) to collapse.
- The currently active page has a grey background highlight in the sidebar.
- Clicking a page from the Favorites section also navigates to it.
- Clicking a page in the Recent section also navigates to it.

### Sub-pages and nesting

Sub-pages appear indented under their parent in the sidebar. Each level of nesting adds 16 px of left padding. There is no hard limit on nesting depth. Sub-pages within the same parent are sorted by creation time (oldest first).

When you open a deeply nested sub-page, a **breadcrumb trail** appears above the icon in the editor. For example: `📂 Projects › 📝 Q3 › ✅ Review`. Each ancestor in the breadcrumb is a clickable button that navigates to that page.

Breadcrumbs are hidden for root-level pages (when there is only one item in the chain).

### Renaming a page

Click the large title field at the top of the editor and edit it in place. The title field is a multi-line textarea that auto-expands as you type, so very long titles wrap gracefully. The sidebar reflects changes after the 300 ms debounce fires.

### Deleting a page

See the [Trash](#trash) section for soft-delete and permanent deletion.

---

## The Editor

The editor is powered by **BlockNote 0.50**, a block-based rich text editor. Every piece of content is a "block" — a discrete unit with a type, properties, and inline content. This structure enables precise export to Markdown and a clean editing experience.

### Editor layout

The editor occupies the right portion of the screen. From top to bottom:

1. **Cover banner** — optional gradient strip at the very top (see [Cover Images](#cover-images)).
2. **Property panel** — a slim bar showing status, priority, and tags (see [Page Properties](#page-properties)).
3. **Scrollable body** — contains breadcrumbs, icon, title, and block content.
4. **Footer** — shows word count on the left, and "Updated [date]", a lock toggle, and "Export .md" on the right.
5. **Table of Contents** — appears on the right side on extra-wide screens (see [Table of Contents](#table-of-contents)).

### Empty state

When no page is selected (for example, on first launch before creating any page), the editor shows a centred placeholder: a large document emoji, the text "Select or create a page", and a hint. Navigate to or create a page to dismiss it.

### Auto-save

Content is saved automatically:
- **Title** — debounced 300 ms after the last keystroke.
- **Body content** — debounced 500 ms after the last editor change.

If you switch pages within the 500 ms debounce window, the unsaved changes from the previous page are lost. In practice this is only a risk if you type and immediately switch pages within half a second.

### Word count

The footer bar shows a live word count. The count updates every time the document changes. Words are counted by splitting whitespace-separated tokens from the text content of all blocks. Image blocks and other non-text blocks contribute 0 to the count.

---

## Block Types Reference

Type `/` anywhere in the body to open the BlockNote slash-command menu. You can scroll the list or type additional characters to filter it. Press **Enter** or click to insert a block.

### Paragraph

The default block type. Plain text with no special formatting applied at the block level. Use paragraph blocks for prose, notes, and any content that doesn't fit a more specific type.

**How to insert:** Just start typing on an empty line. Alternatively, type `/paragraph` and press Enter.

**Example use:** Writing out meeting notes, personal reflections, or step-by-step instructions in prose form.

### Heading 1

A top-level section heading rendered in large bold text. Heading 1 blocks appear in the Table of Contents with no indentation.

**How to insert:** Type `/heading1` or `/h1` and press Enter. You can also type `# ` (hash + space) at the start of an empty paragraph.

**Example use:** Major section titles within a page, such as "Introduction", "Requirements", or "Conclusion".

### Heading 2

A second-level section heading rendered in medium bold text. Indented 10 px in the Table of Contents.

**How to insert:** Type `/heading2` or `/h2` and press Enter. You can also type `## ` (two hashes + space) at the start of an empty paragraph.

**Example use:** Sub-sections under a Heading 1, such as "Background" under "Introduction".

### Heading 3

A third-level section heading. Indented 20 px in the Table of Contents.

**How to insert:** Type `/heading3` or `/h3` and press Enter. You can also type `### ` (three hashes + space) at the start of an empty paragraph.

**Example use:** Sub-sub-sections or named paragraphs within a Heading 2 block group.

### Bullet List Item

An unordered list item rendered with a bullet point (`•`). Consecutive bullet items form a visual list. Each item can be nested by pressing Tab, creating a sub-list.

**How to insert:** Type `/bulletlist` or `/ul` and press Enter. You can also type `- ` (hyphen + space) at the start of an empty paragraph.

**Example use:** Feature lists, pros and cons, shopping lists, any enumeration without implied order.

### Numbered List Item

An ordered list item. BlockNote automatically numbers consecutive numbered items. Nested numbered items restart numbering at 1.

**How to insert:** Type `/numberedlist` or `/ol` and press Enter. You can also type `1. ` (digit, period, space) at the start of an empty paragraph.

**Example use:** Step-by-step instructions, ranked priorities, ordered procedures.

### Check List Item

A to-do item with a checkbox. Click the checkbox to toggle it between checked and unchecked state. The checked state is saved and persisted. Check list blocks export as `- [x] item` (checked) or `- [ ] item` (unchecked) in Markdown.

**How to insert:** Type `/checklist` or `/todo` and press Enter.

**Example use:** Action items from a meeting, personal task lists, feature checklists for a release.

### Code Block

A monospaced block for code snippets or technical content. Inline formatting (bold, italic, etc.) is not applied inside code blocks. The entire block is rendered in a monospace font with a light background.

**How to insert:** Type `/codeblock` or `/code` and press Enter. You can also type three backticks (` ``` `) at the start of a line.

**Example use:** Pasting in shell commands, code snippets, configuration values, or any text that should preserve exact whitespace.

### Quote

A block quotation rendered with a left border or visual indent, depending on theme. Used to call out cited text or highlight an important statement.

**How to insert:** Type `/quote` or `/blockquote` and press Enter. You can also type `> ` (right-angle bracket + space) at the start of a line.

**Example use:** Citing a source, highlighting a key insight, pulling a memorable statement out of body text.

### Image

Embeds an image by URL. A dialog prompts for the image URL. The image is rendered inline in the document at the URL you provide. No image is uploaded to a server — the URL is stored as-is and fetched at render time from the browser.

**How to insert:** Type `/image` and press Enter, then paste or type an image URL.

**Example use:** Including a diagram hosted on an image CDN, referencing a screenshot URL, embedding a chart.

### Table

A grid layout block. BlockNote's table block lets you add rows and columns and type into cells. Inline formatting works within table cells.

**How to insert:** Type `/table` and press Enter.

**Example use:** Comparison tables, data grids, schedules with rows and columns.

---

## Inline Formatting

Select any text within a block to reveal the inline formatting toolbar. The toolbar floats above the selection.

| Format | Shortcut (Mac) | Shortcut (Windows/Linux) | Markdown equivalent |
|---|---|---|---|
| **Bold** | Cmd+B | Ctrl+B | `**text**` |
| _Italic_ | Cmd+I | Ctrl+I | `_text_` |
| `Inline code` | Cmd+E | Ctrl+E | `` `text` `` |
| ~~Strikethrough~~ | (toolbar only) | (toolbar only) | `~~text~~` |
| Hyperlink | Cmd+K | Ctrl+K | `[text](url)` |

Inline formatting can be combined — for example, bold and italic text is possible by applying both formats to the same selection.

---

## Page Properties

The **Property panel** appears as a slim strip directly below the cover banner (or at the top of the scrollable area if no cover exists). It shows three types of metadata for the active page.

### Status

A page can have one of four statuses. Click the status badge to open a dropdown and select a new value.

| Status | Colour | Meaning |
|---|---|---|
| No status | Grey | Default — no workflow state assigned |
| Todo | Blue | Work is planned but not yet started |
| In Progress | Yellow | Work is actively underway |
| Done | Green | Work is complete |

### Priority

A page can have one of four priority levels. Click the priority badge to change it.

| Priority | Colour | Meaning |
|---|---|---|
| No priority | Grey | Default — no urgency assigned |
| Low | Blue | Nice-to-have, no time pressure |
| Medium | Orange | Moderately important |
| High | Red | Urgent or blocking |

### Tags

Tags are free-form labels. Each page can have multiple tags. Tags are displayed as pill badges and can be added or removed at any time.

**Adding a tag:**
- Click one of the dashed preset suggestions (up to three are shown at a time from: design, dev, research, important, idea, personal, work, urgent) to add it instantly.
- Or type in the small "add tag…" input field and press Enter.

**Removing a tag:** Click the **×** button inside any tag pill to remove it.

Tags are stored in lowercase. Adding a tag that already exists is a no-op (duplicates are silently ignored). Tags have no special behaviour beyond labelling — they do not filter the sidebar or search results in the current version.

---

## Icons

Every page has an emoji icon displayed at large size above the page title in the editor, and at small size next to the page title in the sidebar.

### Default icon

When a page is created, a random icon is picked from a pool of 10 options: 📄 📝 📌 🗒️ 📋 🔖 💡 🎯 📚 🗂️

### Changing the icon

Click the large emoji displayed above the title field. A floating picker grid appears with 40 emoji options arranged in 8 columns. Click any emoji to apply it immediately. The picker closes automatically.

If the page is locked, the icon button is disabled and the picker will not open.

**Closing the picker without changing the icon:** Click anywhere outside the picker grid.

### Available emoji options

The 40 options include a wide range of categories:

- Documents and text: 📄 📝 📌 🗒️ 📋 🔖
- Ideas and goals: 💡 🎯 📚 🗂️
- Home, stars, and status: 🏠 ⭐ 🔥 ✅ 💼
- Creative and projects: 🎨 🚀 🌟 📊 🔍
- Communication and media: 💬 🎵 🌈 🍀 🏆
- Gems and mind: 💎 🧠 ❤️ 🌍 🔧
- Tools and schedule: 🛠️ 📅 ⚡ 🎪 🧩
- Keys, education, activity: 🔑 🎓 🏋️ 🎭 🦋

---

## Cover Images

A decorative gradient banner can be displayed at the top of each page. Covers are purely visual — they have no effect on content or export.

### Adding a cover

Hover near the top of the editor area (the thin strip above the property panel). An **"Add cover"** button with an image icon appears. Click it to open the gradient picker. The picker shows a 4-column grid of 12 colour swatches — hover over a swatch to see its name in a tooltip, click to apply it.

### Cover gradients available

| Key | Visual description |
|---|---|
| aurora | Purple → indigo (diagonal) |
| sunset | Pink → red |
| ocean | Blue → cyan |
| forest | Green → teal |
| fire | Pink → yellow |
| night | Deep dark: near-black → deep purple → near-black |
| peach | Warm cream → salmon |
| mint | Aqua → blush pink |
| slate | Mid-grey → off-white |
| rose | Pink → lavender blue |
| lemon | Yellow → peach |
| berry | Lavender → pink |

The cover banner is 176 px (11 rem) tall and spans the full editor width.

### Changing a cover

Hover over the existing cover banner. Two buttons appear in the bottom-right corner: **Change** and **Remove**. Click **Change** to reopen the gradient picker and select a different gradient.

### Removing a cover

Hover over the cover and click **Remove** to delete the cover entirely. The page reverts to the thin 32 px hover zone.

---

## Favorites

Star any page to pin it to a dedicated "Favorites" section near the top of the sidebar, above the main Pages tree.

### Adding a page to favorites

Right-click any page in the sidebar to open the context menu and choose **Add to favorites**. Alternatively, hover over a page and click the **star** icon if it is exposed in the hover bar.

The star icon in the context menu fills in (⭐) when the page is already favorited.

### Removing from favorites

Right-click the page and choose **Unfavorite**, or click the filled star icon again. The Favorites section disappears from the sidebar when zero pages are favorited.

### Behavior notes

- The Favorites section is an additional shortcut, not a separate location. Favorited pages still appear in the regular Pages tree at their normal position.
- The Favorites section shows pages at depth 0 (no nested indentation within the Favorites list), regardless of where they sit in the hierarchy.
- Trashing a page removes it from the Favorites section display, but the `favorited` flag is preserved. If you later restore the page, it returns to Favorites.

---

## Trash

Deleted pages are soft-deleted and held in a recoverable Trash area at the bottom of the sidebar.

### Moving a page to trash

Right-click any page in the sidebar to open the context menu, then choose **Move to trash**. Alternatively, look for a trash icon in the sidebar hover bar (visible on hover).

**What happens when you trash a page:**
- The page and all of its sub-pages, at every level of nesting, are marked as deleted recursively.
- If the trashed page was the currently open page, the editor automatically switches to the first available live page. If no live pages remain, the editor shows the empty state.
- Trashed pages immediately disappear from the Pages tree and Favorites section.

### Viewing the Trash

A collapsible **Trash (n)** section appears at the bottom of the sidebar when at least one page is in the trash. The number in parentheses shows the total count of trashed pages. Click the section header to expand it.

Inside the expanded Trash list, each trashed page is shown with its icon and title. Hover over any trashed page to reveal two action buttons.

### Restoring a page

Hover over a trashed page in the Trash section and click the **↩** (RotateCcw) restore icon. The page is revived (`deleted` set back to `false`, `deletedAt` cleared) and reappears in the Pages tree at its original position.

**Important:** Restoring a child page does not automatically restore its parent if the parent is also trashed. You must restore the parent separately. If you restore a child while the parent remains trashed, the child appears as a root-level page in the sidebar because its `parentId` still points to a deleted page.

### Permanently deleting a page

Hover over a trashed page and click the **×** (X) icon. The page and all of its sub-pages are immediately and irreversibly removed from the store. There is no undo for permanent deletion.

### Empty Trash

Click **Empty trash** at the bottom of the expanded Trash list to permanently delete every trashed page at once. This is also irreversible — use with caution.

---

## Duplicate a Page

You can create an exact copy of any page.

**How to duplicate:** Right-click the page in the sidebar and choose **Duplicate** from the context menu.

A new page is created with:
- The same content as the original.
- The title appended with " (copy)" (e.g., "Meeting Notes (copy)").
- The same parentId — the duplicate is created in the same parent as the original.
- A fresh UUID, fresh `createdAt`, and fresh `updatedAt`.
- `favorited` set to `false` — the clone is not automatically starred.

The duplicated page immediately becomes the active page in the editor.

---

## Page Lock

Locking a page prevents any further edits to its title or body content. Locked pages are clearly indicated throughout the UI.

### Locking a page

- Click the **Lock** button in the editor footer (bottom bar, right side). The button shows a lock icon and the label "Lock".
- Alternatively, right-click the page in the sidebar and choose **Lock page** from the context menu.

### What locking does

- The title textarea becomes `readOnly` — clicking it does not allow editing.
- `BlockNoteView` is set to `editable={false}` — the editor body becomes read-only.
- The icon picker is disabled — clicking the icon does nothing.
- A small amber "Locked" badge with a lock icon appears next to the icon.
- A small lock icon (🔒) appears in the sidebar next to the page title.

### Unlocking a page

Click the **Unlock** button in the editor footer (the button label changes to "Unlock" when the page is locked), or right-click the page in the sidebar and choose **Unlock page**.

---

## Search

The search modal lets you find any live (non-trashed) page by title.

### Opening search

- Click **Search** in the top section of the sidebar (shows `⌘K` hint on the right).
- Press **Ctrl+K** (Windows/Linux) or **Cmd+K** (Mac) from anywhere in the app.
- Click the magnifying glass icon in the collapsed mini-rail (when the sidebar is collapsed).

### Using search

When the modal opens with no query typed, the first 8 live pages are shown as quick-access results. As you type, results are filtered by case-insensitive substring match against the page title. There is no body-text search in the current version — only titles are searched.

**Navigating results:**
- Use the **↑** and **↓** arrow keys to move the highlight up and down the list.
- Press **Enter** to open the highlighted page and close the modal.
- Click any result directly to open it.
- Press **Escape** or click outside the modal to close it without navigating.

A hint bar at the bottom of the modal shows `↑↓ navigate`, `↵ open`, and `esc close` as reminders.

---

## Templates

Templates let you create a new page with pre-filled structure and placeholder content. Six templates are built in.

### Opening the Templates modal

- Click **Templates** in the sidebar header (the icon looks like a layout grid).
- Press **Ctrl+Shift+T** (Windows/Linux) or **Cmd+Shift+T** (Mac).
- Click the layout icon in the collapsed mini-rail.

### Using a template

The modal shows a 2-column grid of template cards. Each card shows the template icon, name, and a brief description. Click any card to:
1. Create a new page with that template's title, icon, and pre-filled content.
2. Set the new page as the active page (it opens in the editor immediately).
3. Close the modal.

The new page is created as a root-level page (no parent). Close the modal without clicking to cancel.

### Available templates

#### Meeting Notes (🤝)
**Description:** Capture agenda, discussion points, and action items.

Pre-filled structure:
- H1 heading "Meeting Notes"
- Bold "Date:" field pre-populated with today's date
- H2 "Agenda" with two bullet placeholders (Topic 1, Topic 2)
- H2 "Discussion" with a placeholder paragraph
- H2 "Action Items" with two unchecked check list items (Assign owners, Set deadlines)

**Best for:** Team standups, 1:1s, project kick-offs, any recurring meeting.

#### Daily Journal (☀️)
**Description:** Reflect on your day — gratitude, goals, notes.

Pre-filled structure:
- H1 heading showing today's full date (e.g., "Wednesday, May 7, 2026")
- H2 "Grateful for" with a bullet list placeholder
- H2 "Today's focus" with a check list item
- H2 "Notes" with an empty paragraph
- H2 "End of day reflection" with an empty paragraph

**Best for:** Personal journaling, daily habit tracking, mindfulness practice.

#### Project Plan (🚀)
**Description:** Outline goals, milestones, and tasks for a project.

Pre-filled structure:
- H1 "Project Plan"
- H2 "Overview" with a guiding question paragraph
- H2 "Goals" with two bullet placeholders
- H2 "Milestones" with two numbered items (Phase 1, Phase 2)
- H2 "Tasks" with two check list items
- H2 "Risks" with a blockers paragraph placeholder

**Best for:** Software projects, product launches, personal projects, research initiatives.

#### Bug Report (🐛)
**Description:** Document a bug with steps to reproduce and expected behavior.

Pre-filled structure:
- H1 "Bug Report"
- H2 "Summary" with a brief description placeholder
- H2 "Steps to Reproduce" with numbered steps
- H2 "Expected Behavior" (empty paragraph)
- H2 "Actual Behavior" (empty paragraph)
- H2 "Environment" with bullet items for OS and Browser

**Best for:** Software bug tracking, QA notes, issue documentation, support escalations.

#### Reading List (📚)
**Description:** Track books, articles, and resources to read.

Pre-filled structure:
- H1 "Reading List"
- H2 "Currently Reading" with a bullet placeholder
- H2 "Up Next" with a bullet placeholder
- H2 "Finished" with a bullet placeholder
- H2 "Key Takeaways" with an empty paragraph

**Best for:** Book tracking, research paper queues, article backlogs, learning roadmaps.

#### Weekly Review (📅)
**Description:** Reflect on the week and plan ahead.

Pre-filled structure:
- H1 "Weekly Review"
- H2 "What went well" with a bullet placeholder
- H2 "What to improve" with a bullet placeholder
- H2 "Next week's goals" with a check list item

**Best for:** Weekly retrospectives, personal performance reviews, planning sessions.

---

## Recent Pages

The **Recent** section appears near the top of the sidebar, above the Favorites section. It shows up to 5 of your most recently visited pages (pages you created or explicitly navigated to).

- Click any recent entry to navigate to that page.
- The list is ordered most-recent first.
- A page appears only once even if you visited it multiple times.
- Trashed pages are automatically hidden from the Recents list.
- Click the **Recent** label to collapse or expand the section.
- The Recent list is capped at 10 entries internally; only the first 5 are shown.

The section disappears entirely if you have not yet visited any live pages.

---

## Table of Contents

When a page contains heading blocks (H1, H2, or H3) with non-empty text, an **"On this page"** panel appears automatically on the **right side** of the editor.

### Visibility requirements

- The panel only appears on screens that are at least **1280 px wide** (Tailwind `xl` breakpoint). On smaller screens, it is hidden.
- The panel only renders when there is at least one heading block with non-empty text. Pages with only paragraphs, lists, or empty headings show no TOC.

### Navigating with the TOC

Click any heading entry in the panel to smooth-scroll the editor to that heading block. The scroll uses `behavior: "smooth"` for a visual transition.

### Indentation

- H1 headings have no left padding (0 px indent).
- H2 headings are indented 10 px.
- H3 headings are indented 20 px.

### Collapsing the panel

Click the **"On this page"** label (which includes a list icon) to collapse the panel while keeping it in the layout. Click again to re-expand.

### Live updates

The panel re-renders every time the document changes. Add a new heading block and it appears immediately. Delete a heading and it disappears immediately.

---

## Export to Markdown

Any page can be exported as a `.md` file that you can open in any Markdown editor, static site generator, or note-taking tool.

### How to export

- **From the context menu:** Right-click any page in the sidebar and choose **Export as Markdown**.
- **From the sidebar hover bar:** Hover over a page in the sidebar and click the **download** (⬇) icon.
- **From the editor footer:** Click the **"Export .md"** link in the bottom-right corner of the editor.

### What is exported

The exported file includes:

1. A top-level `# Title` heading derived from the page title.
2. All block content converted to standard Markdown:

| Block type | Markdown output |
|---|---|
| Paragraph | Plain text |
| Heading 1 | `# text` |
| Heading 2 | `## text` |
| Heading 3 | `### text` |
| Bullet list item | `- text` |
| Numbered list item | `1. text` |
| Check list (unchecked) | `- [ ] text` |
| Check list (checked) | `- [x] text` |
| Code block | ` ```\ncode\n``` ` |
| Quote | `> text` |

3. Inline styles:
   - Bold text → `**text**`
   - Italic text → `_text_`
   - Inline code → `` `text` ``
   - Strikethrough → `~~text~~`

### What is not exported

- Sub-pages are not recursively included — only the current page's content is exported. Export each page individually.
- Cover images and icons are not included in the Markdown.
- Status, priority, and tags are not included in the Markdown.
- Images embedded by URL are not included — only text blocks are converted.

### File naming

The downloaded file is named `<page-title>.md`. If the title is empty, it falls back to `untitled.md`. Special characters in the title are used as-is since the browser sanitises the filename attribute.

---

## Dark Mode

Toggle between light and dark themes using any of these methods:

- Click the **moon** (🌙) icon in the sidebar header to switch to dark mode. Click the **sun** (☀) icon to switch back to light mode.
- Press **Ctrl+Shift+D** (Windows/Linux) or **Cmd+Shift+D** (Mac).

The preference is stored in localStorage under `notion-clone-settings` and restored automatically on every visit to the app. You do not need to re-set it each time.

### What dark mode affects

- The sidebar background shifts from off-white (`#f7f7f5`) to near-black (`neutral-900`).
- The editor background shifts from white to near-black (`neutral-950`).
- The BlockNote editor's built-in UI (toolbar, slash menu, table UI) switches to BlockNote's own dark theme.
- All custom components use `dark:` Tailwind utilities for consistent dark styling.

---

## Resizing and Collapsing the Sidebar

### Resizing the sidebar

Drag the thin vertical handle at the right edge of the sidebar to change its width. The width is constrained between **160 px** and **480 px**. Release the mouse button to finish. The chosen width is saved automatically in localStorage.

While dragging, the cursor changes to a column-resize cursor and text selection on the page is disabled to prevent accidental text selection during the drag.

### Collapsing the sidebar to a mini-rail

Click the **collapse** icon (PanelLeftClose) in the sidebar header, next to the dark mode toggle, to collapse the sidebar to a narrow 40 px mini-rail. In this state, the sidebar shows only icon buttons:

- Expand icon (PanelLeftOpen) — restores the full sidebar.
- Search icon — opens the Search modal.
- Plus icon — creates a new root-level page.
- Layout icon — opens the Templates modal.

Click the expand icon to restore the full sidebar. The collapsed state is persisted in localStorage.

---

## Keyboard Shortcuts

### Global shortcuts

| Action | Mac | Windows / Linux |
|---|---|---|
| Open / close search | Cmd+K | Ctrl+K |
| Create a new root-level page | Cmd+N | Ctrl+N |
| Toggle dark mode | Cmd+Shift+D | Ctrl+Shift+D |
| Open / close Templates modal | Cmd+Shift+T | Ctrl+Shift+T |

### Editor shortcuts

| Action | Mac | Windows / Linux |
|---|---|---|
| Move focus from title to body | Enter (in title) | Enter (in title) |
| Bold selected text | Cmd+B | Ctrl+B |
| Italic selected text | Cmd+I | Ctrl+I |
| Inline code selected text | Cmd+E | Ctrl+E |
| Open slash-command menu | / (in body) | / (in body) |
| Create heading 1 | Type `# ` at line start | Type `# ` at line start |
| Create heading 2 | Type `## ` at line start | Type `## ` at line start |
| Create heading 3 | Type `### ` at line start | Type `### ` at line start |
| Create bullet list | Type `- ` at line start | Type `- ` at line start |
| Create numbered list | Type `1. ` at line start | Type `1. ` at line start |
| Create code block | Type ` ``` ` at line start | Type ` ``` ` at line start |
| Create quote | Type `> ` at line start | Type `> ` at line start |

### Search modal shortcuts

| Action | Key |
|---|---|
| Move selection down | ↓ |
| Move selection up | ↑ |
| Open the selected page | Enter |
| Close without navigating | Escape |

---

## Context Menu

Right-clicking any page in the sidebar opens a floating context menu with the following options:

| Option | Description |
|---|---|
| Open | Navigate to the page (same as clicking it) |
| Duplicate | Create a copy of the page with " (copy)" suffix |
| Add to favorites / Unfavorite | Toggle the favorited flag |
| Lock page / Unlock page | Toggle the locked flag |
| Export as Markdown | Download the page as a `.md` file |
| Move to trash | Soft-delete the page and its sub-pages |

The menu closes automatically when you click any item or click outside the menu. The menu is positioned to stay within the browser window — if you right-click near the bottom or right edge of the screen, the menu shifts to fit.

---

## Tips and Tricks

**1. Use search as your primary navigation tool**
Pressing Cmd/Ctrl+K and typing a few characters is nearly always faster than expanding the sidebar tree, especially once you have more than 10 pages. Train yourself to reach for the keyboard shortcut first.

**2. Build a hub page with headings**
Create a root-level "Home" or "Index" page with Heading 2 blocks as section dividers. Because each heading appears in the Table of Contents panel, this index page becomes a one-click navigation dashboard visible on the right side of the editor.

**3. Use breadcrumbs to climb the tree**
When you are deep in a nested sub-page, click any ancestor name in the breadcrumb bar at the top of the editor to jump up the hierarchy. This avoids scrolling the sidebar to find the parent.

**4. Lock pages you use as reference**
If you have a style guide, glossary, or reference document you want to protect from accidental editing, lock it. The content is still fully readable and exportable.

**5. Assign distinct cover gradients to projects**
Using different cover gradients for different projects gives you instant visual recognition. "Ocean" for a web project, "Forest" for a gardening journal, "Fire" for an urgent task tracker — the colours make each page recognizable at a glance when you switch between them.

**6. Duplicate templates for recurring events**
After filling in the Meeting Notes template for your first meeting, duplicate it before the next meeting instead of starting from the template again. The duplicate keeps your section structure, and you just clear the content in each section.

**7. Export before clearing browser data**
All data lives in localStorage. Clearing your browser's cache or site data will delete your entire workspace with no recovery option. Before clearing storage, use "Export .md" on each important page to save local copies.

**8. Use check list blocks to track project progress**
The checked/unchecked state of check list items is persisted and exported. A page with ten check list items becomes a lightweight progress tracker — you can see at a glance how many items are done.

**9. Collapse the sidebar for focused writing**
Click the collapse icon to hide the sidebar to a mini-rail. This gives the editor more horizontal space and removes visual distraction when you need to focus on writing.

**10. Use the Weekly Review template every Monday**
Open Templates, click Weekly Review, and name the page with the current week (e.g., "Week 2026-W19"). Over time you accumulate a searchable archive of weekly reviews. Because search works on titles, typing "Week 2026" returns all your weekly reviews.

**11. Use tags to cross-label across the hierarchy**
Tags are not hierarchical — a page tagged "urgent" could be deep inside "Project A" and another tagged "urgent" inside "Project B". While the app does not yet filter by tag, you can use search to find all pages mentioning "urgent" in their title, and tags serve as a future-ready metadata layer.

**12. Use the Recent section to retrace your steps**
If you navigate to a page, realize you need to check something in the previous page, click the Recent section to jump back. This is particularly useful when comparing two related pages.

**13. Nest pages instead of one long document**
Instead of one page with 2000 words and many heading sections, consider creating a parent page with 6 sub-pages — one per section. Sub-pages can still be exported individually, and the sidebar tree gives you a visual outline. Large pages can also become sluggish in the editor.

---

## FAQ

**Q: Is my data backed up anywhere?**
No. The app is fully client-side. Data lives only in your browser's localStorage under the key `notion-clone-pages`. If you clear browser data, use a private/incognito window, switch to a different browser, or use a different device, your pages will not be there. Export regularly as Markdown files for personal backup.

**Q: Can I access my pages on another device or browser?**
Not currently. There is no backend, sync, or import/export JSON feature. Your workspace is local to the specific browser profile where you created it.

**Q: What happens if I trash a page that has sub-pages?**
All sub-pages are trashed recursively at the same time. Every sub-page (and their sub-pages, at all levels) is marked deleted. They all appear individually in the Trash list and can each be restored independently.

**Q: Can I restore a page whose parent was also trashed?**
Yes, but the parent must also be restored separately. Restoring a child page while its parent remains in trash will make the child appear as a root-level page in the sidebar. Restore the parent first, then the child will appear under it again.

**Q: The Table of Contents is not showing — why?**
Two conditions must both be met: (1) the page must have at least one heading block (H1/H2/H3) with non-empty text, and (2) your screen must be at least 1280 px wide (the Tailwind `xl` breakpoint). On a laptop at 1200 px or less, the TOC is hidden.

**Q: I accidentally emptied the trash. Can I recover my pages?**
No. "Empty trash" performs an immediate permanent delete with no undo. The pages are removed from localStorage and cannot be recovered. Always restore any pages you might want before clicking Empty trash.

**Q: Why does the word count show 0 for a page with text?**
The word counter only counts text tokens from the inline content arrays of blocks. Certain block types — images, dividers, and tables without text in cells — contribute 0 words even when they contain information. Also, if a page was just opened and no edits have been made yet, the counter initializes from the stored content, which may behave unexpectedly for certain block structures.

**Q: How much data can I store?**
Each browser gives localhost/origin roughly 5–10 MB of localStorage space. For text-only pages this is very generous — you can store thousands of pages. If you embed many image URLs (the URL string is stored, not the image itself) or write extremely long pages, you could theoretically approach the limit. There is no storage usage indicator in the current UI.

**Q: Can I use the app offline?**
Yes. After the initial page load, the app runs entirely in your browser with no network calls. You can disconnect from the internet and continue writing. The next time you connect and reload, nothing is lost — data is in localStorage, not the network.

**Q: What browser is required?**
Chrome 115 or later, Firefox 117 or later, or Safari 17 or later. Any Chromium-based browser (Edge, Brave, Arc, etc.) at an equivalent version also works. JavaScript and localStorage must be enabled — the app does not function with JavaScript disabled.

**Q: Does locking a page prevent it from being trashed?**
No. A locked page can still be trashed from the context menu. Locking only prevents editing the content and title within the editor UI.

**Q: Can I change the order of pages in the sidebar?**
Not currently. Pages within the same parent are sorted by creation time (oldest first). There is no drag-and-drop reordering.

**Q: How do I create a page inside a specific folder?**
Hover over the page you want to be the parent in the sidebar and click the **+** icon that appears on hover. This creates a sub-page directly under that parent. Alternatively, right-click the parent and choose any appropriate action.

**Q: What does "No status" mean — does it affect anything?**
"No status" is the default value. Status and priority fields are purely cosmetic metadata in the current version — they label the page but do not affect sorting, filtering, or any other behaviour.
