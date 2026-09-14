# Handoff

Updated 2026-09-14.

## Current state

Tracker stores page records and navigation state in IndexedDB through Dexie (`tracker-db`). UI preferences remain in localStorage. Startup supports legacy `notion-clone-pages` migration, malformed-data preservation, missing-field normalization, concurrent initialization, and an in-memory fallback when IndexedDB is unavailable.

The latest pushed commit is `2ccc595` (`Ignore stale navigation page ids`). The worktree also contains an uncommitted follow-up that forces `createPage()` to generate its own UUID even when callers provide an `id` override, with a regression test.

## Verification

- 87 tests pass.
- ESLint passes.
- The production build was running when this handoff was written; rerun `npm run build` before release.
- `git diff --check` should be run before committing.

## Recommended next steps

1. Finish verifying and commit the pending `createPage()` ID-hardening change.
2. Push the commit after the full test, lint, and build checks pass.
3. Keep the IndexedDB migration tests in `src/__tests__/stores/` aligned with any schema changes.

## Useful commands

```bash
npm test
npm run lint
npm run build
git diff --check
```
