# Validation record — Next.js edition

Validation covers strict TypeScript compilation, the production Worker build, database migration integrity and backend regression checks.

The backend harness applies the actual migration to SQLite and invokes the actual TypeScript API service. Payment provider, email service and object storage are simulated. It covers registration/login, cookie flags, administrator authorization, private file upload, unpaid reader denial, verified single-book access, incorrect payment amount/ownership/signature denial, replay-safe credit, licence grant/revocation, reading session ownership/replacement/idle expiry, page bounds/resume, book licence expiry, reset-token replay/session invalidation, cross-origin mutation denial and month-end access dates.

The Cloudflare local-runtime test also applies the migration through real local D1 bindings and verifies month-end dates, private R2 uploads, account creation, verified book access credit/replay, licence grant and an authorized R2-backed reader.

Live Paystack payments/webhooks, Resend delivery, hosted D1/R2 behavior, browser/device visual QA, load testing and backup restoration require configured staging services. Local simulated tests do not certify those external integrations. Checkout remains off until enabled explicitly through administrator settings.

The per-book regression checks include preference persistence, authenticated preview bounds, ignoring client-supplied amounts, isolation between two books, original-PDF denial and private page-image authorization. The interface adds an animated book loader (respecting reduced motion), keyboard-accessible native dialogs and canvas watermarks. Browser visual QA remains outstanding.

## Registration and Windows setup correction

Added Worker-binding-first configuration, shared local database persistence and a repeatable development setup helper. Validation covers missing/invalid form fields, password confirmation, terms acceptance, fresh migrations, repeated setup, existing account preservation and stable password secrets. The tab favicon uses the existing book brand mark. Dialog centering uses explicit fixed positioning and auto margins after the CSS reset. Full browser/device visual QA remains a separate check.

## Email verification release

Tests cover hashed verification tokens, replacement invalidating old links, expiry, resend cooldown, provider-failure recovery, replay denial, server-side unverified checkout blocking, role injection denial and admin-only token maintenance. Local D1/R2 tests also exercise actual verification schema and account status updates. No production inbox was contacted by these tests; simulated email delivery cannot certify DNS configuration or real mailbox delivery. No browser QA was performed.
