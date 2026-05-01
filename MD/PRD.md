# Product Requirements: Betsie Lite

## 1. Goal
Position Betsie Lite as a chat-first control surface for creating and settling 1-on-1 social bets with low friction, while using a database-backed Cloudflare Worker architecture for reliable state, synchronization, and settlement integrity.

## 2. Product Positioning
- **What Betsie Lite is:** A share-first, no-heavy-onboarding betting experience with durable backend state.
- **What chat apps do:** Handle delivery, thread context, and natural re-engagement.
- **What Betsie Lite does:** Handle composition, role-track progression, action synchronization, and settlement logic.
- **What this means for UX:** Every screen should optimize for "take action now, return from chat later, and always recover exact state."

## 3. Core User Flows
### Flow A: Creator Track
1. User opens the PWA and starts a new bet.
2. User enters Creator Name, Claim, End Date, and optional Trash Talk.
3. App persists a new bet record and creates a shareable invite link referencing backend state.
4. Creator follows staged labels: **Create -> Confirm -> Invite**.
5. App presents channel-aware share copy for iMessage, SMS, or WhatsApp.
6. Primary creator CTAs move from **Next** to **Invite challenger** (or **Send a reminder** after first invite).
7. Creator sends invite into chat.

### Flow B: Challenger Track
1. Challenger opens invite link from chat.
2. App loads the existing bet state and routes user to challenger-specific flow.
3. Challenger follows staged labels: **Accept -> Confirm -> Game On**.
4. Challenger chooses either **Agree with {Creator}** or **Make a different call**.
5. Challenger enters name and optional trash talk, then confirms.
6. App persists challenger participation and updates bet readiness state.
7. Challenger can re-share the active link to continue the social thread.

### Flow C: Opponent Action Notification (Push-to-Modal)
1. When one player performs a meaningful action (accept, confirm, vote, etc.), backend state changes and emits a track-relevant notification.
2. The other player receives an in-app modal on next app focus/open (or live when available) indicating the opponent's action.
3. Modal copy clarifies what changed and what action is now expected from the current user.
4. Dismissal and CTA behavior should move users directly to the correct next step in their own track.

### Flow D: Active Bet and Reminder
1. Once both players have completed required onboarding actions, bet state moves to active.
2. App shows countdown to End Date and optional reminder/calendar controls.
3. Both players can re-open at any time and see role-aware state in their own track.

### Flow E: Settlement, Voting, and Result Reveal
1. At End Date (or if called early), voting opens for required players.
2. A submitted vote is persisted immediately, but the final result is not computed or shown until all required votes are received.
3. While waiting, users see a clear "waiting for opponent vote" state.
4. When all votes are present, server-side logic computes final outcome and writes settlement record.
5. App reveals synchronized outcome and receipt:
   - **{Creator} Won!** / **Both Right!**
   - **{Challenger} Won!** / **Both Wrong!**
   - **No contest**
6. Receipt stage uses **Share result** as the primary outbound CTA.

## 4. Key Features
- **Database-Backed Bet State:** Canonical source of truth for bets, players, actions, votes, and outcomes.
- **Role-Split Tracks:** Creator and Challenger progression are intentionally separate and role-aware.
- **Track Synchronization:** Backend transitions and guards prevent impossible states and cross-track drift.
- **Push-to-Modal Notifications:** Opponent actions trigger modal notifications so each player knows when to act.
- **Vote Synchronization Gate:** Result calculation is blocked until all required votes are submitted.
- **Deterministic Settlement:** Final outcome is calculated server-side and persisted once.
- **Channel-Aware Share Copy:** Outbound messages remain concise and chat-native.
- **Countdown + Calendar:** Active bets support timing awareness and reminders.
- **Online Receipt:** Settlement produces a shareable receipt state for chat and social reposting.

## 5. Technical and Product Requirements
- **Runtime:** Cloudflare Workers host APIs and state orchestration.
- **Data Integrity:** Critical transitions (acceptance, activation, vote completion, settlement) must be validated server-side.
- **Idempotency:** Repeated submissions from refresh/retry should not duplicate key actions.
- **Consistency:** Role track state and modal notifications must be generated from persisted backend events, not inferred client-only assumptions.
- **Resilience:** Re-opening the app from shared links should restore canonical state accurately.

## 6. UI/UX Requirements
- **Mobile-First:** Feels native on iOS/Android form factors.
- **Stage-First UX:** Preserve labels exactly as implemented per role track.
- **Action Clarity:** Modals must state "what opponent did" and "what you do next."
- **Waiting UX:** Vote pending state should reduce ambiguity and prevent premature result reveal.
- **Fast-to-Share:** Primary CTA on pre-settlement screens remains sharing back to chat.

## 7. Content Guidelines
- Keep microcopy concise and socially readable in chat threads.
- Preserve implemented CTA language where possible.
- Avoid exposing internal architecture terms in user-facing copy.
- Reinforce loop language: "Create, Bet, Repeat."

## 8. Messaging Constraints (Chat-First)
- **Creator invite format:** `claim` + optional `trash talk hook` + link.
- **Default hook:** "Prove me wrong."
- **Do not expose "YES/NO" language in outbound creator invite text.**
- **Character limits (hard):**
  - Creator name: 20
  - Challenger name: 20
  - Claim/position text: 70
  - Trash talk (creator/challenger): 45
  - Challenger custom position text: 70
- **Share copy target:** Keep pre-link text generally <=160 chars for readability.