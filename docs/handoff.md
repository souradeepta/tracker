# Handoff

Updated 2026-09-14.

## Current state

Tracker stores page records and navigation state in IndexedDB through Dexie (`tracker-db`). UI preferences remain in localStorage. Startup supports legacy `notion-clone-pages` migration, malformed-data preservation, missing-field normalization, concurrent initialization, and an in-memory fallback when IndexedDB is unavailable.

The handoff was last refreshed in `daed2ed` (`Refresh handoff commit reference`). The worktree is clean. The preceding `40d60d6` commit added the UUID hardening and initial handoff/memory documentation.

## Verification

- 87 tests pass.
- ESLint passes.
- The production build passes; Vite still reports the existing large-chunk warning.
- `git diff --check` should be run before committing.

## Recommended next steps

1. Keep the IndexedDB migration tests in `src/__tests__/stores/` aligned with any schema changes.
2. Consider adding a real-browser or fake-IndexedDB integration test suite when the test environment supports it.

## Useful commands

```bash
npm test
npm run lint
npm run build
git diff --check
```
