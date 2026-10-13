# LIGHTECHOES — Windows / VS Code startup

## Update your existing project

1. Stop the running website with Ctrl+C.
2. Extract this ZIP into a temporary folder. Copy its files into your existing LIGHTECHOES project and replace matching source files.
3. Keep your existing `.env.local`, `.dev.vars`, `.wrangler` folder and `node_modules`. These contain your local configuration and data; they are not included in this ZIP. Do not delete your database.
4. Open the project folder in VS Code. Run these commands one at a time in the PowerShell terminal:

```powershell
pnpm.cmd install --frozen-lockfile
pnpm.cmd local:setup
pnpm.cmd dev
```

Open http://localhost:5173. If the terminal selects another port, stop it, free port 5173 or update `APP_URL` in `.dev.vars` to the displayed address.

`local:setup` creates a private development password secret only when none exists, repairs the placeholder development URL and applies missing database tables/columns to the shared `.wrangler/state` location. Re-running it keeps existing accounts and a configured password secret. `pnpm dev` also performs this setup automatically on a normal local checkout. Production still requires separately configured secrets.

## New installation

Install Node.js 22.13 or newer, extract the ZIP, open its folder, then run:

```powershell
npm.cmd install -g pnpm@11.25.0
pnpm.cmd install --frozen-lockfile
pnpm.cmd local:setup
pnpm.cmd dev
```

The `.cmd` commands avoid PowerShell's script execution restriction. No execution-policy change is required.

## Create your local administrator

Register through the website with your real email. Confirm the success dialog, then stop the development server with Ctrl+C and run:

```powershell
pnpm.cmd local:admin your-registered-email@example.com
pnpm.cmd dev
```

Use your actual registration email. Sign out and back in, then open http://localhost:5173/admin. The administrator helper changes only a matching, already registered local account; it does not create an account or change the hosted database.

## Forms and dialogs

- Empty or invalid fields display a centered error dialog and individual field hints.
- Registration and password reset require a matching confirm password.
- Each password field has its own Show/Hide button.
- Incorrect login credentials show an error dialog.
- Successful registration/login show a success dialog before continuing to the catalogue.
- The favicon and header share the site's book brand mark.

## Payment and reset email configuration

Add Paystack test credentials and verified email service settings to `.dev.vars`, then restart the development server. Never use live payment credentials for local tests. Leave checkout off until the complete payment flow passes.

## Troubleshooting

If registration says account setup is incomplete, stop the website, run `pnpm.cmd local:setup` and restart `pnpm.cmd dev`. Check that `.dev.vars` in the project root has a nonempty `PASSWORD_PEPPER`; do not share its value. If you changed an existing secret manually, restore the original secret so previous passwords remain valid.

If you see “no such table”, use `local:setup` rather than running migration commands against `dist/server/.wrangler/state`. All new local commands and the development server explicitly share the project-root `.wrangler/state` database.

For favicon changes, refresh with Ctrl+F5; browsers can cache old tab icons. Report any remaining error text without sending secrets or your database files.

## New email verification feature

See DEPLOYMENT-READY.md for email sender setup and hosting instructions. Existing accounts must verify their email before another purchase. Existing active paid book licences remain readable. New registrations receive an email if Resend is configured; otherwise sign in and use My Account to resend after configuration is complete. Local setup applies migration 0002 automatically. No verification bypass is enabled.
