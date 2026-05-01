# Betsie Lite (PWA + Worker Backend)

Betsie Lite is a lightweight chat-native betting experience that now runs on a database-backed architecture deployed on Cloudflare Workers. It helps users compose, share, and settle quick 1-on-1 bets between a Creator and Challenger without forcing account-heavy onboarding.

## Technical Philosophy
- **Database-Driven Core:** Bet state is persisted in the backend database, not URL query parameters.
- **Cloudflare Worker Runtime:** Server logic is deployed on Cloudflare Workers for API handling, orchestration, and real-time gameplay transitions.
- **Chat-Native Head Unit:** The web app remains the control panel; iMessage, SMS, and WhatsApp remain the social transport layer.
- **PWA First:** Built for mobile, installable, and optimized for quick in-and-out usage from chat.
- **Split Gameplay Tracks:** Creator and Challenger move through separate but synchronized stages.
- **Action-Aware UX:** Opponent actions trigger push-to-modal notifications to keep both players synchronized.
- **Consensus Settlement:** Voting waits for all required players before result calculation and reveal.

## Docs
- **[PRD.md](PRD.md)** — product requirements and end-to-end user journeys.
- **[DESIGN.md](DESIGN.md)** — visual, interaction, and language system.
- **[MEASUREMENT.md](MEASUREMENT.md)** — GA4 events, milestones, and reporting patterns.
- **[LOCAL_DEV.md](LOCAL_DEV.md)** — Cursor-first local development and preview workflow.
- **[COMMANDS.md](COMMANDS.md)** — quick command reference for development, migrations, and deploy.
- **[SERVER_SETUP.md](SERVER_SETUP.md)** — Cloudflare Worker setup, environments, deployment, and operations.
- **[DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)** — canonical data model, constraints, indexes, and lifecycle rules.
- **[TODO.md](TODO.md)** — implementation roadmap and follow-up work.

## Tech Stack
- Frontend: HTML5, CSS3, Vanilla JavaScript (ES6+)
- Runtime: Cloudflare Workers
- Storage: Database-backed bet and vote lifecycle
- PWA: Web Manifest + Service Worker