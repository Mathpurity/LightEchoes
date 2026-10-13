# LIGHTECHOES deployment package — version 0.2.0

This is a complete source package with a tested production build. Deployment still requires your hosting account, private credentials, verified sender domain and final publication/operating details. Those cannot be bundled in a public ZIP. Production credentials, customer accounts and uploaded books are excluded.

## What is included

- Account registration, login, password confirmation/show-hide controls, success/error dialogs, password reset and reading interests.
- Email verification on registration, a confirmation page, 24-hour single-use links, 60-second resend protection, My Account verification status/resend and server-enforced verification before payment.
- Per-book pricing and 1–24-month access periods, authenticated previews, Paystack checkout/verification/signed webhooks, replay-safe book licences and expiry enforcement.
- Private original PDFs, authorized page images, visible account watermarks, reading position and session management. No original-file download endpoint. Screenshots, recording and determined extraction cannot be made impossible.
- Administrator publishing, covers/PDF page preparation, scheduled release, account restrictions, licence restrictions/expiry, audit records and launch-readiness checks.
- Expired-token cleanup in Admin → Security. This does not delete accounts, payments, book licences or reading history.
- Schema migrations, Windows local setup, deployment preflight and configuration helpers, local and remote administrator helpers and regression tests.

## Update your existing Windows project

Stop the server with Ctrl+C. Extract the ZIP and copy the source files over your project. Keep `.env.local`, `.dev.vars`, `.wrangler` and `node_modules`. Back up your local project first.

Run in VS Code PowerShell:

```powershell
pnpm.cmd install --frozen-lockfile
pnpm.cmd local:setup
pnpm.cmd dev
```

Local setup applies the new verification migration without deleting existing accounts. Existing accounts become unverified for future purchases; their already purchased active book licences remain available. Administrators are not automatically email-verified.

To remove local administrator privileges, stop the server and run `pnpm.cmd local:admin YOUR_REGISTERED_EMAIL --role member`. At least one active administrator is preserved.

## Set up email delivery

Use a domain you control, verify it in Resend using the provided DNS records, and create a sending API key. Add these values to `.dev.vars` beside package.json:

```dotenv
RESEND_API_KEY=YOUR_PRIVATE_RESEND_KEY
MAIL_FROM=LIGHTECHOES <support@YOUR_VERIFIED_DOMAIN>
APP_URL=http://localhost:5173
```

Keep your existing nonempty PASSWORD_PEPPER and Paystack test key. Restart the development server. Never share the file or commit it to Git.

Register a test account, check inbox/spam, open the link and select **Verify email**. On localhost, open the link on the same computer as the running website. My Account provides resend and a status-refresh button. A newly sent link replaces earlier links. Resend's default testing sender is restricted and does not replace a verified production sender domain.

Unverified customers can preview books, but payment is blocked both in the interface and server API. Missing email configuration does not silently bypass verification. Failed delivery leaves the created account available to sign in and retry from My Account.

## Supported hosting

The application is Next.js App Router TypeScript packaged using Vinext for Cloudflare Workers, D1 and private R2. It is not configured for a stock Vercel/Node deployment or PHP/cPanel hosting. Moving to another runtime requires adapting the database/storage bindings and packaging.

### Sites hosting

The retained `.openai/hosting.json` points to the existing LIGHTECHOES Site. Deployment through Sites provisions the DB/BUCKET bindings and applies the generated migrations. Set the five private runtime settings in hosting settings before deployment, using the final Site HTTPS origin as APP_URL. Do not use the Git repository URL as APP_URL. Publish a saved source version rather than uploading the ZIP as static HTML.

A Paystack webhook must be reachable without an owner-only/ChatGPT sign-in wall. A private Site is suitable for owner testing, but does not by itself certify public webhook delivery. Arrange the intended public audience before testing external webhook delivery; keep Paystack in test mode during that stage.

### Your own Cloudflare account (Windows commands)

1. Sign in and create separate staging resources:

```powershell
pnpm.cmd exec wrangler login
pnpm.cmd exec wrangler d1 create lightechoes-db
pnpm.cmd exec wrangler r2 bucket create lightechoes-books
pnpm.cmd build
```

Keep R2 public bucket access disabled. Copy the actual database ID returned by D1 creation.

2. Prepare the deployment configuration with that ID (replace YOUR_ACTUAL_D1_ID):

```powershell
pnpm.cmd prepare:cloudflare --database-id YOUR_ACTUAL_D1_ID
pnpm.cmd exec wrangler d1 migrations apply DB --remote --config dist/server/wrangler.production.json
```

The helper targets the created lightechoes-db database and lightechoes-books bucket. Custom names can be supplied with --database-name, --bucket and --name. Re-run prepare:cloudflare after every build because dist is regenerated.

3. Set the private Worker values using interactive prompts:

```powershell
pnpm.cmd exec wrangler secret put APP_URL --config dist/server/wrangler.production.json
pnpm.cmd exec wrangler secret put PASSWORD_PEPPER --config dist/server/wrangler.production.json
pnpm.cmd exec wrangler secret put PAYSTACK_SECRET_KEY --config dist/server/wrangler.production.json
pnpm.cmd exec wrangler secret put RESEND_API_KEY --config dist/server/wrangler.production.json
pnpm.cmd exec wrangler secret put MAIL_FROM --config dist/server/wrangler.production.json
```

If Wrangler needs to create the Worker before accepting secrets, complete that prompt, then continue with all five secrets and deploy. APP_URL is the final HTTPS Worker/custom-domain origin. The default Worker name is lightechoes-library. Use a new private 64-character hexadecimal pepper for a fresh hosted installation; retain the original stable pepper if migrating existing password hashes. Use Paystack TEST credentials first.

4. Deploy the built Worker:

```powershell
pnpm.cmd exec wrangler deploy --config dist/server/wrangler.production.json
```

5. Register your owner account on the hosted website and verify its email. Promote only that existing account:

```powershell
pnpm.cmd cloud:admin --email YOUR_REGISTERED_EMAIL --role admin
```

This helper explicitly operates on the configured remote database, does not create users and does not grant email verification. To remove administrator privileges, use --role member; it preserves the last active administrator. Cloudflare administrative credentials are required. Local `local:admin` does not affect the hosted database.

6. Sign out/back in, open /admin, add the real support email, final privacy notice/purchase terms and real books. Leave checkout OFF until configured test checks pass.

## Runtime values

| Setting | Required value |
| --- | --- |
| APP_URL | Exact public HTTPS origin, no extra path/query; used for origin checks, payment returns and email links |
| PASSWORD_PEPPER | Stable, random 64-character hexadecimal secret |
| PAYSTACK_SECRET_KEY | Test key for staging; approved live key only for launch |
| RESEND_API_KEY | Private Resend sending key |
| MAIL_FROM | Address on a verified sending domain |

Never put these values in NEXT_PUBLIC variables or tracked source files. Replace previously exposed credentials. Changing a pepper makes old passwords fail; plan account password recovery or a fresh hosted installation accordingly.

## Preflight command

After building, you can check a PRIVATE `.env.production` file (excluded from Git):

```powershell
pnpm.cmd check:deploy --env-file .env.production
```

Alternatively provide values through your terminal environment. The command prints readiness statuses, not secrets. It does not upload the file or prove provider delivery. Put production values into the hosting provider's secret settings separately. Never use `.dev.vars` as a production-origin file; local setup deliberately keeps its URL local.

## Hosted acceptance before live payments

- Verify registration email, resend cooldown/replacement, expired links and password reset using a real inbox.
- Test wrong-password and ordinary-member admin denial.
- Configure Paystack TEST webhook: https://YOUR_HOST/api/library/payment/webhook.
- Enable checkout for TEST payments. A verified buyer gets only the chosen book; an unverified buyer is denied.
- Confirm failed/cancelled payment, return verification, duplicate webhook handling, renewal and expired/suspended book access.
- Test phone/desktop layouts, password toggles, centered dialogs, loader, all reader pages, saved position and slow networks.
- Confirm domain/HTTPS, storage privacy and backup restoration.
- Complete Admin → Security readiness checks. Flags show configuration, not external service certification.

Only after these pass, configure approved Paystack live credentials, update its live webhook and open checkout for customers.

## Operations and backups

The ZIP contains code, not your local customer database or uploaded PDFs. Re-upload books on the hosted instance or plan a controlled database AND bucket migration, preserving the original password pepper if passwords are transferred.

Before changing a local database, stop the dev server and back up `.wrangler/state` plus the private environment file to a secure location. A hosted D1 database can be exported with `wrangler d1 export DB --remote --config dist/server/wrangler.production.json --output PRIVATE_BACKUP.sql` when using your Cloudflare account. Store backups privately; they include personal information and password hashes. Back up original book files and R2 objects separately. Test restoration into a separate staging database/bucket before relying on backups. Sites-managed resources use the provider's supported backup/access mechanisms.

Use Admin → Security → Clean expired tokens periodically. Choose and implement an agreed retention schedule before promising deletion deadlines for accounts, reading logs, finance records or backups. This release does not automatically close accounts, delete financial records or process provider refunds. Refunds/chargebacks require reconciliation in Paystack and an appropriate licence restriction in Admin. Maintain support and a breach-response process.
