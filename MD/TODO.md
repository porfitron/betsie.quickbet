# Implementation Roadmap: Betsie Lite

## Phase 1: Core Architecture 🏗️
- [ ] Finalize Cloudflare Worker environment configuration (local, preview, production).
- [ ] Define and apply initial database migrations for bets, players, actions, votes, settlements, and notifications.
- [ ] Add API contracts for role-track progression endpoints (Creator and Challenger).
- [ ] Define canonical state machine for `draft -> invited -> active -> voting -> settled`.

## Phase 2: The Bet Experience ⏱️
- [ ] Enforce split gameplay tracks with role-specific navigation and guards.
- [ ] Implement push-to-modal opponent-action notifications.
- [ ] Ensure modal CTA and dismissal paths route users to correct next action.
- [ ] Build active bet countdown and reminder/calendar paths.
- [ ] Preserve channel-aware sharing variants for iMessage, SMS, and WhatsApp.
- [ ] Enforce chat-first limits (name 20, claim 70, trash talk 45) and character counters.

## Phase 3: Results & Fanfare 🎊
- [ ] Implement vote persistence endpoint with idempotent write behavior.
- [ ] Add vote synchronization gate that waits for all required player votes.
- [ ] Implement server-side settlement computation and one-time outcome write.
- [ ] Add "waiting for opponent vote" UI state and final result reveal transition.
- [ ] Ensure settlement copy is concise and easy to repost into existing threads.

## Phase 4: PWA & Polish ✨
- [ ] Add `manifest.json` for "Add to Home Screen" support.
- [ ] Register a simple Service Worker for offline caching of assets.
- [ ] Style the "Upsell" components for the iOS app.
- [ ] Final CSS pass for responsive mobile layouts and "app-like" feel.
- [ ] Run UX/content audit against role-track clarity, modal readability, and voting wait-state comprehension.

## Phase 5: Observability and Analytics 📈
- [ ] Emit events with canonical identifiers (`bet_id`, `role_track`, `outcome`).
- [ ] Instrument modal notification lifecycle (`shown`, `cta_click`, `dismissed`).
- [ ] Instrument vote lifecycle (`submitted`, `waiting`, `all_submitted`, `result_revealed`).
- [ ] Add smoke tests for Creator and Challenger full lifecycle in staging.