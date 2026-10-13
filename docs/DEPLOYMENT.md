# LIGHTECHOES Next.js deployment guide

## Architecture

One Next.js App Router codebase owns pages and API routes. All backend code is TypeScript. D1 stores accounts, sessions, memberships, licences, catalogue metadata, transactions and activity. R2 stores private PDFs and cover images. Payments use Paystack; reset emails use Resend.

This checkout uses the Sites Cloudflare Worker deployment runtime (Vinext). D1 and R2 logical bindings are `DB` and `BUCKET`. The hosting workflow creates/attaches these resources and applies generated Drizzle migrations at deployment. Local backend tests use an in-memory SQLite adapter, simulated R2 and a simulated provider. They do not create or charge a real customer account.

## Required owner inputs

- Custom domain, if desired.
- Each book’s price in naira and access period (default four months).
- Paystack account and test secret first; live secret after gateway approval.
- Verified email sender/domain and Resend API key for password reset.
- Support email, operator identity, final privacy notice and purchase/refund terms.
- First real publication PDF and cover, with title, author, category and description.

Private storage is supplied through the application’s bucket binding; no separate CMS or external user-management service is needed.

## Runtime values

Configure these server-side values in hosting settings, then deploy a saved version to apply them:

| Value | Purpose |
|---|---|
| `APP_URL` | Exact HTTPS application origin; used for origin checks, reset links and payment return URL |
| `PASSWORD_PEPPER` | At least 32 random bytes, stored as a stable secret; changing it invalidates existing password hashes |
| `PAYSTACK_SECRET_KEY` | Test secret during staging; live secret only after acceptance |
| `RESEND_API_KEY` | Email delivery secret |
| `MAIL_FROM` | Verified sender, e.g. `LIGHTECHOES <support@your-domain.com>` |

Generate a pepper with `openssl rand -hex 32`; paste it only into the hosting secret field. Secrets never enter browser code, URLs, source control or admin setting responses.

## First administrator

1. Deploy privately with `PASSWORD_PEPPER` and `APP_URL` configured.
2. Register your owner account using the normal registration page.
3. Promote only the verified owner account by running a parameterized update through the database administration tooling: `UPDATE users SET role='admin' WHERE email=?`. Supply the owner email as a bound parameter; do not promote an arbitrary first registrant or expose a public bootstrap endpoint.
4. Sign out and back in. Open `/admin`.
5. In Settings, enter support email, about text, privacy notice and purchase terms. Leave **Open book checkout** OFF until the test journey passes.
6. In Publications, upload the ten-page dummy PDF from `tests/dummy-publication.pdf`, wait for all ten reader pages to be prepared, set its price, access months and preview-page limit, then publish it. Admin upload supports PDFs up to 25 MB, and JPEG/PNG/WebP covers.
7. Configure Paystack webhook URL `https://YOUR_APP/api/library/payment/webhook`. There is no separate backend origin.
8. Set Paystack test mode and enable checkout for a private staging test. Customer redirect data never unlocks a book without server verification.
9. Register a second account, pay with a test transaction, confirm the selected book licence, and open the reader. Verify reset emails on a real inbox.
10. Perform the complete staging checks below. Replace the dummy book with real Book #1 only after they pass; add Books #2–18 through the same admin flow.
11. Switch to the approved live secret, configure production webhook, redeploy and perform a controlled pilot before public opening.

## Membership and reader policies

- Each book has its own server-side price and 1–24-month access period, defaulting to four months. Payment snapshots the price and period. Renewal extends only that book from the later of current expiry or server time; month-end dates are clamped. No automatic recurring charge is created.
- Each successful transaction reference credits the selected book licence at most once. Verification checks reference, amount, NGN currency, successful provider status and customer email.
- Payment grants a licence for its selected book only. My Library lists purchased books with active access. Revoked/suspended licences remain blocked.
- One active reading session per account. Idle deadline: two minutes without a heartbeat. Absolute session duration: thirty minutes. New sessions end earlier active sessions. Reopen a book to resume.
- The API enforces account, active book licence, publication availability, licence, session ownership and server expiry for every reader operation.
- Original PDFs remain private and are never served to customers. Admin uploads prepare private page images; each reader request checks the account, licence, session and expiry. Preview endpoints require login and enforce the configured page limit. Original object paths and credentials are excluded from public responses. Cover images have a public serving endpoint for released books.
- Watermarks identify the account, licence and session. Browser-delivered page images and visible watermarks are not DRM; screenshots and determined extraction remain possible.
- Passwords use PBKDF2-SHA256 with random salt, 100,000 iterations (Worker-compatible bound) and a required independent server pepper. Keep login rate limits/WAF enabled; evaluate stronger password hashing if moving to a runtime with a higher derivation budget.

## Acceptance checks

1. Register/login/logout and reset password via a real email; replayed reset links fail and old account sessions are invalidated.
2. Logged-out readers fail; accounts without a paid book licence fail.
3. Successful test payment unlocks only the selected book for its configured access period.
4. Wrong amount, currency, email, forged signature and another user's payment reference fail.
5. Replay webhook/verification: no extra book access credit.
6. Page-image reader opens, all ten pages navigate, watermark remains visible, zoom works and position resumes.
7. Session reuse by another account fails. Starting a new session invalidates the old one.
8. Revoked/suspended licence, expired book access, idle session and absolute expiry all fail. Changing browser time does not grant access.
9. Draft, unpublished, archived and unreleased scheduled books are inaccessible.
10. Ordinary members cannot access admin endpoints, upload files or modify settings. Cross-origin mutations are rejected.
11. Public R2 access remains disabled; guessed object paths fail.
12. Test phones, tablets, Safari/Chrome/Firefox, slow networks and 200% text zoom.
13. Confirm backup restoration, support contact, purchase terms and provider reconciliation before public launch.

## Operations

Back up the D1 database and original files independently from the production bucket. Retain the source repository. Test restoring a staged snapshot. Schedule deletion of expired auth/reset tokens and rate-limit rows; choose an agreed activity retention policy before deleting reading/audit history.

Refunds and chargebacks are reconciled in Paystack. An administrator must revoke/suspend the member in the app after refund/chargeback; automated refund/dispute handling is not implemented. Do not delete finance records during routine cleanup.

Private uploaded files are immutable object versions. Editing a book with a new upload changes its version and preserves the old object for rollback/backup. Unattached uploads need periodic review before deletion.

The application has not been opened for customer payments. Live gateway, email delivery and hosted database/bucket acceptance tests remain launch steps.

## Existing installation migration
Apply migration 0001 after 0000. Existing global membership rows are retained for review but do not unlock all books. Legacy pending payments without a book require administrator review. Re-upload existing books to prepare page images, then set each price, duration and preview limit. Do not enable checkout until this review is complete.

## Updated deployment instructions

DEPLOYMENT-READY.md supersedes the startup/verification guidance above. Apply migration 0002. All accounts must verify email before new purchases; existing paid licences are preserved. Configure Resend, then test registration verification, resending and password reset. Public webhook delivery requires an externally reachable endpoint without an owner-only sign-in wall.
