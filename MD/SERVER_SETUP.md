# Server Setup (Cloudflare Workers)

## 1. Overview
This project runs backend logic on Cloudflare Workers. The Worker handles API endpoints, role-track progression, modal notification triggers, vote synchronization, and settlement computation.

## 2. Environments
- **Local:** Developer machine using Wrangler local runtime.
- **Preview/Staging:** Optional pre-production environment for QA.
- **Production:** Public Worker used by the live PWA.

Recommended environment model:
- Keep separate bindings/secrets for each environment.
- Avoid sharing production database credentials with local or preview.

## 3. Prerequisites
- Node.js (LTS recommended)
- Cloudflare account with Workers enabled
- Wrangler CLI installed and authenticated

## 4. Configuration
Store runtime configuration in Worker environment variables and secrets.

Typical variables:
- `APP_ENV`
- `API_BASE_URL`
- `DB_*` credentials or binding names
- `GA4_MEASUREMENT_ID` (if sent server-side)
- Feature flags for modal notification behavior (optional)

**Public bet feed (`feed.html`):** `GET /api/bets?limit=` returns a **redacted** JSON array (bet text, deadline, outcome, and timestamps only — **no** creator/challenger names or vote/handoff fields). To turn the list endpoint off entirely in an environment, set **`PUBLIC_BET_LIST_DISABLED`** to `1`, `true`, `yes`, or `on`. Single-bet `GET/PATCH /api/bets/:id` behavior is unchanged for the main app.

Typical commands:
- `wrangler login`
- `wrangler dev`
- `wrangler deploy`

## 5. Local Development
1. Install dependencies.
2. Configure local environment values and secrets.
3. Run Worker locally.
4. Point frontend dev environment to local Worker API.
5. Validate end-to-end flows:
   - Creator track create/confirm/invite
   - Challenger track accept/confirm/game on
   - Opponent action modal notifications
   - Vote waiting state and final settlement reveal

## 6. Deployment
1. Merge validated changes to deployment branch.
2. Deploy Worker with target environment.
3. Run post-deploy smoke tests against live API endpoints.
4. Confirm analytics and logs are receiving expected events.

## 7. Operational Expectations
- **Idempotency:** Endpoint handlers must tolerate retries and refreshes.
- **Validation:** All state transitions validated server-side.
- **Observability:** Log state transitions and errors with request context.
- **Safety:** Avoid exposing secrets in frontend bundles or logs.

## 8. Troubleshooting Checklist
- Worker deploy fails: validate `wrangler.toml` and required bindings.
- API returns unauthorized/forbidden: verify env secrets and token config.
- Modal notifications missing: verify backend action event was persisted and notification trigger executed.
- Result not appearing: verify all required votes were persisted before settlement computation step.
