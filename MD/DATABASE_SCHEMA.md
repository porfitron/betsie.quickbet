# Database Schema

## 1. Purpose
This document defines the canonical database model for Betsie Lite after migration from URL-encoded state. The database is the source of truth for bets, players, actions, votes, and settlement outcomes.

## 2. Core Entities

### bets
Represents the root game object.

Suggested fields:
- `id` (primary key)
- `status` (`draft`, `invited`, `active`, `voting`, `settled`, `cancelled`)
- `claim_text`
- `deadline_at`
- `created_at`
- `updated_at`
- `settled_at` (nullable)
- `created_by_player_id` (foreign key to players)

### players
Represents participants tied to a bet.

Suggested fields:
- `id` (primary key)
- `bet_id` (foreign key to bets)
- `role` (`creator`, `challenger`)
- `display_name`
- `position_text`
- `trash_talk_text` (nullable)
- `joined_at`
- `last_seen_at` (nullable)

Constraints:
- Unique (`bet_id`, `role`) so each role has exactly one slot.

### actions
Event log for gameplay actions and track synchronization.

Suggested fields:
- `id` (primary key)
- `bet_id` (foreign key)
- `actor_player_id` (foreign key to players)
- `action_type` (for example: `creator_invited`, `challenger_accepted`, `vote_submitted`)
- `payload_json` (nullable)
- `created_at`

Purpose:
- Powers audit history and push-to-modal triggers.
- Enables deterministic replay/debugging of state transitions.

### notifications
Tracks modal notifications generated for opponent action updates.

Suggested fields:
- `id` (primary key)
- `bet_id` (foreign key)
- `recipient_player_id` (foreign key)
- `source_action_id` (foreign key to actions)
- `notification_type` (`opponent_action_modal`)
- `status` (`pending`, `delivered`, `dismissed`)
- `created_at`
- `delivered_at` (nullable)
- `dismissed_at` (nullable)

### votes
Stores each required settlement vote.

Suggested fields:
- `id` (primary key)
- `bet_id` (foreign key)
- `player_id` (foreign key)
- `vote_choice` (`creator`, `challenger`, `no_contest`)
- `submitted_at`

Constraints:
- Unique (`bet_id`, `player_id`) to prevent duplicate votes.

### settlements
Final computed result record written once all required votes exist.

Suggested fields:
- `id` (primary key)
- `bet_id` (foreign key, unique)
- `outcome` (`creator_won`, `challenger_won`, `both_right`, `both_wrong`, `no_contest`)
- `computed_at`
- `computed_from_vote_count`
- `metadata_json` (nullable)

## 3. State and Lifecycle Rules
- A bet cannot become `active` until both `creator` and `challenger` records exist with required fields.
- A bet cannot become `settled` until all required votes have been submitted.
- Settlement computation runs server-side and should be idempotent.
- Re-submissions should not create duplicate rows in `votes`, `settlements`, or role slots in `players`.

## 4. Index Recommendations
- `bets(status, deadline_at)`
- `players(bet_id, role)` unique
- `actions(bet_id, created_at desc)`
- `notifications(recipient_player_id, status, created_at desc)`
- `votes(bet_id, player_id)` unique
- `settlements(bet_id)` unique

## 5. Migration and Change Management
- Use versioned migrations for schema updates.
- Backfill scripts should be idempotent and logged.
- Any schema change affecting gameplay transitions must update:
  - API contract
  - PRD state assumptions
  - Measurement event parameter definitions
