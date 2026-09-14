# Project Memory

## Persistence decisions

- Page content is persisted in Dexie/IndexedDB, not Zustand persist middleware.
- Database name: `tracker-db`.
- Tables: `pages` keyed by page ID and `nav` keyed by `state`.
- Settings remain in localStorage because they are small UI preferences.
- Valid legacy `notion-clone-pages` data is migrated once into IndexedDB.
- Malformed legacy data is preserved rather than deleted.
- Missing fields on old page records are filled with current defaults.
- IndexedDB failures fall back to an in-memory onboarding page so the app does not remain on the loading screen.

## Store invariants

- `createPage`, `duplicatePage`, and `createFromTemplate` generate IDs internally.
- Child creation expands the parent in the sidebar.
- Unknown page IDs are ignored by mutation and navigation actions.
- Initialization calls share one promise to prevent duplicate onboarding pages.
- Page writes and navigation writes are best-effort and must not block the editor.

## Recent pushed commits

- `40d60d6` — document handoff/memory state and harden page IDs.
- `2ccc595` — ignore stale navigation page IDs.
- `6dfcaa7` — normalize legacy page records.
- `8fca8d7` — ignore updates for missing pages.
- `c0c2590` — expand parents for duplicated child pages.
- `5b48016` — expand parents for templated child pages.

## Testing notes

Migration and failure-path tests mock the Dexie database because the default JSDOM environment does not provide a real IndexedDB implementation. Keep those tests isolated from the singleton store state and reset `loaded` between cases.
