# LIGHTECHOES — Next.js application

The frontend and all application backend logic are TypeScript in one Next.js App Router project. Accounts, memberships, publication licences, payment verification, admin tools and reading sessions are handled by application routes. Cloudflare D1 stores relational data; private R2 stores publication bytes.

## Included

- Public home, catalogue, publication details, about, how it works, pricing and contact.
- Registration, login, logout, email verification/resend, email password reset and personal account editing.
- HttpOnly account sessions and server-enforced administrator roles.
- Reading interests at signup, account-only previews and individual book prices and access periods (four months by default).
- Paystack checkout, server verification and signed webhook handling, with atomic replay-safe book licence credit.
- Page-image reader: navigation, zoom, personal watermark, heartbeat, expiry and saved reading position.
- Integrated administrator dashboard, publication and cover uploads, scheduled publishing, account status and per-book expiry controls, licence controls, activity, watermarks, audit history and settings.
- Database migration, ten-page dummy book, meaningful backend regression tests and deployment guide.

## Project

`app/` — Next.js pages, React interfaces and API Route Handler.

`lib/application-api.ts` — server application services and authorization.

`lib/security.ts` — password derivation, token hashing and webhook signatures.

`lib/storage.ts` — private server-side D1/R2 bindings.

`db/schema.ts`, `drizzle/` — database schema and generated migration.

`tests/backend.test.mjs` — simulated-provider integration and authorization checks.

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) and [docs/VALIDATION.md](docs/VALIDATION.md).

## Development

Install with the retained pnpm lockfile. Run `node tests/backend.test.mjs` and `node node_modules/typescript/bin/tsc --noEmit`. Managed preview/build uses the configured Sites workflow. The Next.js application is packaged with Vinext, the host's Next-compatible Cloudflare Worker runtime; this checkout is not configured as a stock Vercel/Node deployment. Changing hosts requires a database/storage adapter and supported deployment packaging, not another backend application.

Keep secret values in runtime environment settings. `.env.example` lists the required keys. Publication uploads remain private; public catalogue responses exclude storage object paths. No original books or production secrets are included.

Admin PDF uploads automatically prepare private page images using PDF.js. The reader endpoint does not deliver original PDFs. No download or print controls are provided, and the reader is hidden in print styles. Visible watermarks deter sharing; browser page assets, screenshots, screen recording and photography cannot be made impossible.

## Windows startup and local updates

Read [START-HERE-WINDOWS.md](START-HERE-WINDOWS.md). Use `pnpm.cmd local:setup` to initialize or repair local development, then `pnpm.cmd dev`. Local setup preserves existing accounts and a nonempty password secret. Local-only administration uses `pnpm.cmd local:admin <registered-email>`. These commands never modify hosted production data. Authentication forms include explicit field validation, password visibility controls, confirmation, centered success/error dialogs and accessible field hints.

## Deployment package 0.2.0

Start with [DEPLOYMENT-READY.md](DEPLOYMENT-READY.md). Email verification is now required before payment for every account, including existing accounts; existing paid access remains available. A 24-hour hashed token is consumed once, resends are limited to one per minute and delivery failures can be retried. Production readiness checks, scoped expired-token cleanup and Cloudflare deployment/admin preparation commands are included. Browser visual QA and real service delivery remain hosted acceptance steps.
