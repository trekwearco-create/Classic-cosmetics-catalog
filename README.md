# Classic Cosmetics

A small, fast catalog website for a cosmetics shop. Customers browse products,
search, pick a shade and order with one tap on WhatsApp. There is **no cart,
no checkout, no payment and no customer accounts**. The owner manages
categories, products, photos and shades from a private admin panel.

Tech: Next.js (App Router, Turbopack) + TypeScript + Tailwind + Supabase (Auth,
Storage) + Vercel.

## Quick start

```bash
npm ci
cp .env.example .env.local        # then fill in the values (see below)
npm run dev                       # http://localhost:3000
```

## Environment variables

`.env.example` contains only names. Copy it to `.env.local` and add:

| Variable | Purpose |
|---|---|
| `SUPABASE_URL` | Supabase project URL (no key) |
| `SUPABASE_ANON_KEY` | Supabase anon key |
| `SITE_URL` | Public URL, e.g. `https://classic-cosmetics.vercel.app` |
| `WHATSAPP_NUMBER` | Default `923222495034` (international form of 03222495034) |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | **Only** public variable; the Turnstile site key for `/admin/login` |
| `TURNSTILE_SECRET_KEY` | Turnstile secret key (server only) - used to verify the widget on the server |
| `UPSTASH_REDIS_REST_URL` | Free Upstash Redis URL for login/upload rate limits (optional) |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis token (optional) |

Nothing is printed here — set each value in `.env.local` and in the Vercel
project settings yourself. The repository contains no keys.

## Supabase setup

1. Create a project in the Supabase dashboard.
2. Run `sql/001_tables.sql`, `sql/002_rls_and_policies.sql`,
   `sql/003_search_function.sql`, `sql/004_storage_and_admin.sql` in the SQL
   editor, in that order.
3. **Storage**: create a **public** bucket named `product-images`
   (Dashboard → Storage → New bucket). It is public read; writes are admin-only.
4. **Authentication**: disable public sign-ups; turn on email confirmation.
5. **Admin**: create the owner account in Authentication, then run the insert in
   the SQL editor with the real email:

   ```sql
   insert into public.admin_users (user_id)
   select id from auth.users where email = 'OWNER_EMAIL_HERE';
   ```

   No password is stored anywhere — Supabase signs in with the account password.
6. **Rate limiting** (optional, if `UPSTASH_REDIS_REST_URL`/`_TOKEN` are set):
   the login action is limited to 5 failed logins per 10 minutes per email, and
   uploads to 30 requests per minute per admin.

## First admin

There is no seeded account. Add the owner after the SQL is applied:
Dashboard → Authentication → your user → send a password reset from the dashboard
(or set one in Settings → Database). That owner email is the `OWNER_EMAIL_HERE`
used in step 5 of the setup above.

## Admin panel

- `/admin/login` — email + password, protected by a server-side Turnstile check
  and rate limits.
- `/admin` — dashboard with product/category/hidden counts.
- `/admin/categories` — list, add, edit, delete.
- `/admin/products` — list, search, filter, add, edit, duplicate, delete.
- `/admin/products/new` and `/admin/products/[id]` — product form with photo
  upload (browser compression, server re-encode), cover selection, reorder,
  shades, and bulk paste of shades.

Admin routes send `Cache-Control: no-store` and `robots: noindex`.

## Checks

```bash
npm run build            # production build, no type errors
npx tsc --noEmit         # typecheck
npx eslint .             # lint
npm run security:check   # leak checks + npm audit
bash scripts/security-audit.sh BASE_URL=<site>   # live checks
```

`scripts/rls-smoke.ts` runs the RLS smoke test against an anon-key connection
when the database is ready (run `npx tsx scripts/rls-smoke.ts`).

## Production:deploy

1. `npm run build` (verify locally first).
2. Push to a private GitHub repository and create it on Vercel.
3. Add the environment variables above in Vercel Settings → Environment
   Variables. Mark `SUPABASE_ANON_KEY`, `TURNSTILE_SECRET_KEY` and
   `UPSTASH_REDIS_REST_TOKEN` as **Secure**.
4. Deploy; preview and production share the OIDC client with exact callbacks.

## Key rotation & incidents

1. In Supabase, rotate the API keys in Project settings → API.
2. Update the new values in `.env.local` and Vercel, then redeploy.
3. Check Supabase logs and the admin product list for changes the owner did not
   make.
4. Remove the key from git history if it was ever committed (and still rotate it).

Also enable two-factor login for your GitHub, Vercel and Supabase accounts.

## Design

Pink (`#F8D5E0`), blush (`#FCE9F0`), rose (`#C8326B`), white, black — light
theme only. Body font Figtree, headings Bodoni Moda. Logo from
`public/logo.png`; favicon is a rose crop from the same asset. See the UI/UX
spec for the full token set.
