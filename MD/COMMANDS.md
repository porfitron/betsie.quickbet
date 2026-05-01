# Command Cheat Sheet

## Development
- Start local dev server:
  - `npm run dev`
- Start remote-edge dev session:
  - `npm run dev:remote`

## Database (D1)
- Apply migrations locally:
  - `npm run db:migrate:local`
- Apply migrations remotely:
  - `npm run db:migrate:remote`

## Deploy
- Deploy Worker + static assets:
  - `npm run deploy`

## Setup
- Install dependencies:
  - `npm install`
- Authenticate Cloudflare CLI:
  - `npx wrangler login`

## Recommended daily loop
1. `npm run dev`
2. Preview in Cursor browser
3. Make changes and re-test
4. Commit in GitHub Desktop when satisfied
