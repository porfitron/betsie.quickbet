# Measurement strategy (GA4)

Betsie Lite sends a **small set of named events** so you can read the product funnel like a story: **landing → create → invite → accept → live bet → vote → outcome → receipt**. **Funnel milestones** use the prefix **`betsie_funnel_`**; supplementary taps use **`betsie_cta_clicked`** (and everything stays under the Betsie namespace).

Events go through one helper that merges **`role`** (`creator` or `challenger`, from the viewer’s link) and **`bet_id`** when the URL has `bid`.

**Local development:** The Google tag is **not** loaded on `localhost`, `127.0.0.1`, `*.localhost`, `file:` URLs, so no hits are sent from typical Cursor/local setups. To test GA against the real property from a dev URL, open the page with **`?betsie_ga=1`** (e.g. `http://localhost:8787/?betsie_ga=1`).

## Funnel in plain language

1. **Landing** — Marketing home (`step` = `landing`).
2. **Creator** — Build-flow screens (`step` = `creator`).
3. **Invite** — Creator/challenger completes a share (`betsie_funnel_link_shared`, `kind` = `invite`).
4. **Accept** — Challenger on the accept screen (`step` = `accept`).
5. **Live** — Active bet / countdown (`step` = `live`).
6. **Vote** — A vote or dispute transition is recorded (`betsie_funnel_vote_submitted`).
7. **Outcome** — Final result is shown once per bet (`betsie_funnel_outcome_revealed`, deduped in-session).
8. **Receipt** — Receipt/settle screen (`step` = `receipt`), optional export/share.

## Event reference

### Funnel milestones (`betsie_funnel_*`)

| Event | When it fires | Main parameters |
|--------|----------------|------------------|
| `betsie_funnel_step_viewed` | Each full-page navigation / boot | `step`: `landing` \| `creator` \| `accept` \| `live` \| `receipt` |
| `betsie_funnel_creator_bet_saved` | Creator submits the create form | `has_trash_talk` |
| `betsie_funnel_challenger_joined` | Challenger submits the accept form | `position_mode`, `has_trash_talk` |
| `betsie_funnel_link_shared` | Share sheet finished or link copied | `share_method`: `native` \| `clipboard`, `kind`: `invite` \| `vote_reminder` \| `receipt` |
| `betsie_funnel_vote_submitted` | Vote saved, early call, or dispute automation | `choice`, `phase`, optional `round` |
| `betsie_funnel_outcome_revealed` | First time this browser shows a final outcome for `bet_id` | `outcome` (readable), `outcome_code` |
| `betsie_funnel_receipt_exported` | Receipt image flow | `export_type`, `result`: `start` \| `success` \| `error` |

### Supplementary

| Event | When it fires | Main parameters |
|--------|----------------|------------------|
| `betsie_cta_clicked` | Any tracked button / primary control tap | `cta` (stable id), `label` (visible copy), `value`: **1** (numeric engagement unit for GA4); optional context e.g. **`from_screen`** (`receipt` for **Start new bet** on the settle/receipt screen) |

### Common parameters (merged automatically)

| Parameter | Meaning |
|-----------|---------|
| `role` | Who this browser is acting as: `creator` or `challenger`. |
| `bet_id` | Present when the bet exists in the URL/API (`bid`). |

### Outcome codes (`outcome_code`)

| Code | Typical meaning |
|------|-------------------|
| `no_contest` | No contest |
| `draw_disagreement` | Draw / disagreement |
| `both_right` | Same-side bet, both correct |
| `both_wrong` | Same-side bet, both wrong |
| `creator_wins` | Creator wins |
| `challenger_wins` | Challenger wins |
| `unknown` | Fallback |

### Vote `choice` values (representative)

`creator`, `challenger`, `no_contest`, `call_early`, `reset_due_disagreement`, `draw_due_disagreement`, plus historical choices from the confirmation flow.

## Reporting tips

- **Start new bet from receipt:** Event `betsie_cta_clicked` where `cta` = `start_new_bet` and **`from_screen`** = `receipt` (only control wired today; register `from_screen` as a custom dimension).
- **Simple funnel (Explorations):** `betsie_funnel_step_viewed` broken down by `step`, then add milestone steps: `betsie_funnel_creator_bet_saved` → `betsie_funnel_link_shared` (`kind` = `invite`) → `betsie_funnel_challenger_joined` → `betsie_funnel_vote_submitted` → `betsie_funnel_outcome_revealed` → `betsie_funnel_step_viewed` (`step` = `receipt`).
- **Per-bet correlation:** Register **`bet_id`** as an event-scoped custom dimension and use it in Explorations (not all GA4 views support joining arbitrary IDs across devices).
- **Key events:** In GA4 Admin, mark milestones you care about (for example `betsie_funnel_creator_bet_saved`, `betsie_funnel_outcome_revealed`, `betsie_funnel_link_shared`).

## GA4 admin checklist

1. **Property:** measurement ID `G-P2NCT6LW4D`.
2. **Custom dimensions (event-scoped):** register `step`, `cta`, `label`, `from_screen`, `kind`, `share_method`, `choice`, `phase`, `outcome`, `outcome_code`, `bet_id`, `role`, `has_trash_talk`, `position_mode`, `export_type`, `result`, `round` as needed for your dashboards. Register **`value`** only if you use GA’s metric-on-parameter mapping for `betsie_cta_clicked`.
3. **Real-time:** After deploy, confirm events appear while walking through creator → challenger → settle.

## Representative `cta` ids (`betsie_cta_clicked`)

`start_bet`, `preview_start_bet`, `start_new_bet`, `open_menu`, `fresh_confirm`, `fresh_cancel`, `calendar_google`, `calendar_icloud`, `calendar_ics_download`, `calendar_cancel`, `creator_nav_create`, `creator_nav_confirm`, `creator_nav_invite`, `challenger_nav_confirm`, `create_form_next`, `accept_form_next`, `accept_position_agree`, `accept_position_custom`, `share_bet_link`, `share_handoff_send`, `share_handoff_copy`, `share_handoff_edit`, `send_vote_reminder`, `preview_accept_screen`, `call_bet_early`, `add_to_calendar`, `vote_pick_creator`, `vote_pick_challenger`, `vote_pick_no_contest`, `vote_confirm_send`, `vote_confirm_cancel`, `vote_confirm_switch_role`, `vote_confirm_edit`, `early_end_confirm`, `early_end_cancel`, `challenge_accept_game_on`, `early_call_vote_now`, `celebration_share_results`, `receipt_share`, `receipt_download`, `app_promo_download`.

## Related

- `MD/README.md` — product context  
- `MD/DATABASE_SCHEMA.md` — persisted bet model  
