# NairaLife experience template

Developer starter for **third-party experiences** on NairaLife: host your UI, call Core with a **server-only** DEA key, and charge NL via Commerce after the player grants consent.

This repo is **not** a second wallet, Corporate Registry, or social product. Money, geography, moderation, and the official social graph live in the **NairaLife** platform monorepo (open it as a sibling workspace root).

## Prerequisites

- Node 20+, pnpm (or npm)
- Local **NairaLife Core** at `http://localhost:8080` (platform `README.md` — `pnpm dev:core`, `DATABASE_URL`, migrations)
- A **registered business**, **DEA sandbox key**, and a published experience slug (see checklist below)

## Quick start

```bash
cp .env.example .env
# Set DEA_API_KEY from Core DEA sandbox (never NEXT_PUBLIC_*)

pnpm install
pnpm dev
# Default: http://localhost:3001/x/my-experience
```

## Environment

| Variable | Where | Purpose |
| -------- | ----- | ------- |
| `CORE_URL` | Server | Core API base (default `http://localhost:8080`) |
| `DEA_API_KEY` | **Server only** | Bearer token for DEA-scoped routes (`nl_dea_sbx_…`) |
| `EXPERIENCE_BASE_PATH` | Build | Next `basePath`, e.g. `/x/my-experience` |
| `PORT` | Dev | Dev server port (default `3001`) |

Never prefix DEA material with `NEXT_PUBLIC_`. Run `pnpm check:dea-leak` before shipping.

## Architecture

```
Browser (player access token in sessionStorage from NairaLife web)
  → POST /api/charge  (this app, server route)
      → GET /v1/me  (player bearer)
      → POST /v1/commerce/charge  (DEA bearer + Idempotency-Key)
```

OpenAPI reference (platform repo): `docs/api/openapi-commerce.yaml`, `docs/api/openapi-player-grants.yaml`.

## Test against local Core

1. **Platform web**: sign up / sign in at `http://localhost:3000`; note access token flow (`sessionStorage` key `nl_access_token` when using same-origin or embedded flows).
2. **Registry**: register and activate a business (`POST /v1/registry/businesses`, lifecycle activate).
3. **DEA**: apply for permit, obtain sandbox key (`POST /v1/dea/applications`, sandbox endpoint on your business).
4. **Consent**: as the player, approve **COMMERCE_CHARGE** for your experience at `/permissions` on platform web.
5. **Experience**: register and publish (`POST /v1/experiences`, `POST /v1/experiences/{id}/publish`) with slug matching `EXPERIENCE_BASE_PATH` (e.g. slug `my-experience`, `runtime_url` `/x/my-experience`).
6. **Charge**: open this app, click **Buy with NL** — server route charges via `POST /v1/commerce/charge`.

Deploy and threat model (platform): `docs/experiences/DEPLOY.md`, `docs/experiences/THREAT-MODEL.md`.

## Boundaries (required)

- User-facing copy says **NairaLife**; do not ship **World** / **WorldSims** branding (platform `docs/design/product-naming.md`).
- Show **NL** vs **NGN** separately — never mix ledgers in one balance field (platform `docs/design/currency-and-tokens.md`).
- Do not build a competing global feed or follow graph via DEA (platform `MVP-SPEC.md` social rules).

## Same-origin vs standalone

- **Standalone** (this template): run on port 3001; player must pass `X-Player-Authorization` from a token obtained on platform web (cross-origin token handoff is your integration concern).
- **Same-origin** (recommended for MVP): mount routes under platform `apps/web` `/x/{slug}` with a BFF like `apps/web/src/app/api/pilot/purchase/route.ts` — see platform `experiences/pilot`.

## Platform reference implementation

The in-monorepo pilot shop (`experiences/pilot`, slug `pilot-nl-shop`) mirrors this template. When Core APIs change, update **platform first**, then align this repo.

## Cursor workspace

Open **NairaLife** and **NairaLifeTemplate** in one workspace and use the copy-paste prompt in platform `docs/onboarding/workspace-template-prompt.md`.
