# Measurement strategy (GA4)

This document describes how Betsie Lite is instrumented for [Google Analytics 4](https://support.google.com/analytics) and how to define **funnels, users, and key milestones** in the GA4 UI. Bets are now database-backed and served via Cloudflare Workers, so event parameters should reference persisted identifiers and role-track state instead of URL-only assumptions.

## Design constraints

- **Light-account model:** users may still be pseudonymous, but gameplay state is persisted server-side.
- **Role tracks are explicit:** Creator and Challenger are persisted roles; analytics should include `role_track` where available.
- **Milestone definitions are yours to pick:** the product emits **granular events**; a few milestones are **derived** from more than one event to avoid a mismatch with product language (“completed,” “share,” etc.).

## How events are sent

All custom events go through a single helper that wraps `gtag("event", name, params)`.

- If `gtag` is missing, events are no-ops (e.g. blocked scripts).

## Event inventory (milestone-relevant)

| Event | Purpose |
|--------|---------|
| `betsie_surface_view` | Fires on each load. Params include `surface` (`landing`, `create`, `accept`, `active`, `settle`, ...), `role_track`, `bet_id`, and lifecycle flags from backend state. Use for “which screen was seen” and high-level funnels. |
| `betsie_cta` | Primary CTAs, e.g. `cta_id`: `start_first_bet` (from landing), `start_new_bet` (from settle). `location` disambiguates. |
| `betsie_form_submit` | `form_id`: `create_bet` (creator finished create step), `accept_bet` (challenger submitted). Include `bet_id`, `player_id` (or anonymous surrogate), `role_track`, `has_trash_talk`, and `position_mode` where applicable. |
| `betsie_vote` | Vote submission and voting actions. Include `bet_id`, `player_id`, `role_track`, `phase`, and `choice` (`creator`, `challenger`, `no_contest`). |
| `betsie_vote_waiting` | Emitted after a player vote is accepted but result is blocked until all required votes are present. |
| `betsie_vote_all_submitted` | Emitted when the final required vote is received and result computation becomes eligible. |
| `betsie_result_revealed` | Emitted when computed outcome is presented to players. Include `bet_id` and `outcome`. |
| `betsie_modal_notification` | Opponent-action modal lifecycle (`shown`, `cta_click`, `dismissed`) with `bet_id`, `role_track`, and `source_action_type`. |
| `betsie_settle_pick` | Winner picked from the **settle** view when the outcome is chosen there (less common than voting from `active`). |
| `betsie_settle_celebration` | Settle outcome celebration modal (e.g. `action` `auto_open`). Supplementary, not a unique “per bet” signal by itself. |
| `betsie_share` | A share **completed** via `navigator.share` or fallback **clipboard** copy. `share_method`: `native` or `clipboard`; `share_context` when provided. |
| `betsie_share_intent` | User took a direct share path that records intent before/without a full handoff. |
| `betsie_share_flow` | Handoff modal path (`flow`: e.g. `creator_handoff_modal`, `challenger_handoff_modal`). |
| `betsie_share_handoff` | Handoff UI actions, e.g. `primary_share`, `copy_link`, `auto_open`; `role` can be `creator` or `challenger`. |
| `betsie_creator_step` / `betsie_challenger_step` | Breadcrumb navigation (supplementary; not a substitute for `form_submit`). |
| `betsie_accept_position` | Agree vs custom on accept screen (UX detail). |
| `betsie_preview`, `betsie_calendar_*`, `betsie_outbound_*`, `betsie_start_fresh`, `betsie_header_logo` | Supporting and hygiene events; not core funnel counts unless you explicitly want them. |

### Implemented stage language reference

- **Creator stages:** `Create -> Confirm -> Invite` (tracked with `betsie_creator_step` and URL state).
- **Challenger stages:** `Accept -> Confirm -> Game On` (tracked with `betsie_challenger_step` and `challenger_responded` state).
- **CTA labels in-product** (for dashboard annotation consistency): "Start a quick bet", "Next", "Invite challenger", "Send a reminder", "Confirm and send", "Call the bet early", "Share result", "Start new bet".

## Recommended definitions for reporting

### Users (creators and challengers)

| Question | Suggested approach |
|----------|-------------------|
| “How many users behaved like **creators**?” | **Segment** or **audience:** at least one `betsie_form_submit` with `form_id` = `create_bet` **or** (broader) `betsie_surface_view` with `surface` = `create`. Prefer **form submit** for “serious” creators. |
| “How many users behaved like **challengers**?” | **Segment** / **audience:** at least one `betsie_form_submit` with `form_id` = `accept_bet` **or** (broader) `betsie_surface_view` with `surface` = `accept`. |

**Overlap:** a single device can complete both in different sessions. Report **both segment sizes**; do not assume a partition of “all users” unless you define mutual exclusion rules.

### Bet “started”

| Definition | Event(s) | Notes |
|------------|-----------|--------|
| **A — Landed in create** | `betsie_surface_view` + `surface` = `create` | Includes any entry to create (e.g. `?mode=create`, bookmarks). **Broadest.** |
| **B — Clicked the main landing CTA** | `betsie_cta` + `cta_id` = `start_first_bet` + `location` = `landing` | **Narrow;** only from the home “Start your first bet” path. |

Pick **one** as the official “started” metric. Do not sum A and B for a single bet without **deduplication** logic, because B is usually followed by A on the same navigation.

### Bet “created”

- **Count:** `betsie_form_submit` with `form_id` = `create_bet`.
- **Interpretation:** creator has submitted the create form and the bet state advances in the URL. This is the clearest **“bet exists in the flow”** event.

### Bet “completed” (outcome chosen and revealed)

| Path | Event(s) |
|------|----------|
| **Primary** | `betsie_result_revealed` |
| **Supporting gate checks** | `betsie_vote_waiting` and `betsie_vote_all_submitted` |

Interpretation for same-position bets should come from the final `outcome` value on `betsie_result_revealed` (for example, `both_right` or `both_wrong`) rather than inferring from raw vote choices alone.

**Avoid** using only `betsie_surface_view` settle visits or celebration events as sole completion metrics, since revisits can inflate counts.

### Share button usage

| Question | Suggested event(s) |
|----------|----------------------|
| “**Completed** share (OS share or copy)” | `betsie_share` (break down by `share_method`, `share_context`) — **strongest** for “message actually left the UI.” |
| “Touched **share** UI broadly” | Combine in **Explore** with care: `betsie_share_intent`, `betsie_share_flow`, `betsie_share_handoff` — can **double-count** a single user action across steps; label dashboards clearly. |

**Recommendation for leadership metrics:** use **`betsie_share` event count** (and optional breakdown) as the default “shares that completed.”
If you want receipt-specific sharing, filter `betsie_share_intent` by `share_context = settle_result` and pair with `betsie_share` completion totals.

## GA4 admin checklist

1. **Property:** confirm traffic appears under measurement ID `G-3X6CJW5LPY`.
2. **Custom dimensions (event-scoped):** in **Admin → Data display → Custom definitions**, register parameters you filter on often, e.g. `bet_id`, `player_id` (or anonymous surrogate), `role_track`, `surface`, `form_id`, `cta_id`, `location`, `phase`, `choice`, `outcome`, `share_method`, `share_context`, `flow`, `action`, `source_action_type`. New definitions apply **going forward**; allow **24–48 hours** for stable reporting.
3. **Key events (optional):** mark milestones like `betsie_form_submit` and `betsie_share` if the team wants them in standard conversion-style reports.
4. **Explorations:** use **Funnel** or **Free form** with the definitions above; **Real-time** helps validate right after a code deploy.

## Gaps and optional product follow-ups

- Ensure all voting implementations emit explicit waiting and completion gate events so settlement timing is auditable.
- Ensure modal notification lifecycle is consistently instrumented for both role tracks.
- “Started” may still be split between **`betsie_cta` and `betsie_surface_view`**; align definitions to avoid double-counting.

## Related

- `MD/README.md` — product and technical context for Betsie Lite
- `MD/PRD.md` — product requirements
- `MD/DESIGN.md` — visual design
- `MD/SERVER_SETUP.md` — Cloudflare Worker setup and operations
- `MD/DATABASE_SCHEMA.md` — backend data model and constraints
