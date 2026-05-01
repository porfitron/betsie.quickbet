# Local Development Workflow (Cursor + GitHub Desktop)

## 1. Best Method for Your Workflow
Use a local Cloudflare Worker runtime with:
- Editing in Cursor
- Previewing the local URL in Cursor's browser preview
- Committing only accepted changes in GitHub Desktop

This keeps feedback fast and avoids deploying for every test.

## 2. One-Time Setup
1. Install Node.js (LTS recommended).
2. Install project dependencies:
   - `npm install`
2. Authenticate Wrangler:
   - `npx wrangler login`
3. Confirm `wrangler.jsonc` exists and points to:
   - `main: src/worker.js`
   - `assets.directory: "."`
   - D1 binding `DB`

Optional local vars:
- Create `.dev.vars` if you add non-D1 secrets or feature flags.

## 3. Daily Development Loop
1. From repo root, run:
   - `npm run dev`
2. Open the local URL shown by Wrangler (usually `http://127.0.0.1:8787`) in Cursor browser preview.
3. Edit code in Cursor and refresh preview.
4. Validate critical gameplay paths:
   - Creator track (`Create -> Confirm -> Invite`)
   - Challenger track (`Accept -> Confirm -> Game On`)
   - Opponent-action modal behavior
   - Vote wait-state until all required votes exist
5. If satisfied, commit in GitHub Desktop.

## 4. Recommended Test Sequence Before Commit
- Create bet as Creator.
- Open invite as Challenger and accept.
- Verify Creator sees expected synchronization/modal state.
- Submit one vote and confirm waiting state.
- Submit remaining vote and confirm final result reveal.
- Verify share/receipt links still work.

## 5. Optional Remote Confidence Check
When needed for edge-runtime parity:
- `npm run dev:remote`

Use this before major merges, not for every tiny edit.

## 6. Do You Need Extra Files or Dependencies?
Current repo already has key runtime files:
- `wrangler.jsonc`
- `src/worker.js`
- `migrations/*.sql`

Usually required:
- Node.js installed locally
- Dependencies installed via `npm install` (Wrangler is included as a dev dependency)

Only add files when needed:
- `.dev.vars` for local-only secrets/config
- `.dev.vars.example` if you want team-shared env key templates

No additional dependency mapping is required unless you introduce a build tool/framework or new external services.
