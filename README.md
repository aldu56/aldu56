# ÉLORIA SKIN • HAIR

*Your beauty, understood.*

A production-ready web platform for two independent smart beauty devices, sharing one account system:

- **ÉLORIA Smart Mirror**: skin analysis (hydration, oil balance, pores, fine lines, redness, even tone, elasticity)
- **ÉLORIA Smart Comb**: scalp analysis (hydration, oil balance, flaking, sensitivity, density, follicle vitality)

Customers can own **only the mirror, only the comb, or both**. Each device unlocks its own complete experience. Ownership is enforced on the server and in the database, not just in the UI.

## Stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui-style components (Radix) · Supabase (PostgreSQL, Auth, Storage, RLS) · Recharts · React Hook Form · Zod · sharp · optional Claude vision (Anthropic SDK) · Vitest · Playwright

## Features

**Public site:** home, Smart Mirror, Smart Comb, Technology, Maison, FAQ, Concierge (contact form), shop with category filters, product pages, cart (persisted locally), checkout, privacy/terms, newsletter sign-up.

**Accounts:** sign-up and sign-in, email confirmation, password reset, protected routes (middleware), profile with skin/hair type and beauty concerns.

**Devices:** pair a device by serial (`ELM-XXXX-XXXX` for the mirror, `ELC-XXXX-XXXX` for the comb). The device type is detected live as you type. A serial can belong to only one account. Customers can rename a device, or remove it to resell or gift it; analysis history is kept.

**Analysis:**
- Capture with the device camera (an oval guide for faces, a circle guide for the scalp), or upload a photo.
- A server-side quality gate rejects images that are too dark, overexposed, lack detail, or show no face.
- Each scan produces a score, metric health bars, a radar profile compared with the previous scan, written observations, and prioritized recommendations linked to products.
- The history page has interactive trend charts.
- Customers can delete an analysis together with its image.

**Ritual:** an AM/PM/weekly routine is regenerated after each analysis. It includes a daily checklist with optimistic updates, a streak counter and a 7-day completion chart.

**Dashboard:** adapts to the devices the customer owns. Features for a device they don't own show a locked state with "pair it" and "discover" actions.

**Orders:** totals are always recomputed on the server from the catalog, so prices sent by the client are ignored. Orders are created as `pending`, and customers can see their order history.

## Architecture

```
src/
  app/
    (site)/            public website + shop + checkout
    (auth)/            login, signup, forgot/reset password
    dashboard/         customer area ([kind] = skin | scalp)
    api/analyses/[kind]  image upload → analysis → persistence (Node runtime)
    actions/           server actions (auth, devices, account, commerce)
    auth/callback      email-link/OAuth code exchange
  components/{ui,site,app,charts}
  lib/
    analysis/engine.ts           pure photometric engine (unit-tested)
    analysis/recommendations.ts  recommendations + routines (unit-tested)
    analysis/service.ts          sharp decode → quality gate → AI or engine
    analysis/ai.ts               optional Claude vision (structured output)
    supabase/                    browser / server / middleware clients
    catalog.ts                   products & prices (server source of truth)
    validation.ts                Zod schemas shared by client & server
supabase/
  migrations/…_init.sql          schema, RLS policies, RPCs, storage bucket
  seed.sql                       demo serials ELM-DEMO-0001…0050 / ELC-DEMO-0001…0050
scripts/register-serials.mjs     import manufactured serials (service role)
```

### Security model
- **Row Level Security** is enabled on every table, and users can only read their own rows.
- Skin analyses can only be inserted by a user who owns a mirror, and scalp analyses only by a user who owns a comb. RLS enforces this, and the API route checks it again.
- `device_registry` (all manufactured serials) has no client access. Devices are claimed and released only through the `SECURITY DEFINER` functions `claim_device` and `release_device`.
- Orders can only be inserted as `pending`. Payment status changes must come from a trusted backend, such as a payment-provider webhook.
- Scan images live in a private `scans` bucket under `<user_id>/…` and are served through short-lived signed URLs.
- The service role key and the Anthropic key are server-only. Nothing secret uses the `NEXT_PUBLIC_` prefix.

### Analysis pipeline
1. The upload is validated (type ≤ 8 MB), then sharp corrects its orientation and normalizes it.
2. Photometric features are extracted on a 192×192 grid: luminance, contrast, Laplacian texture, YCbCr skin ratio, chromatic redness, specular highlights, local dark spots, and the ratio of dark pixels (hair).
3. The quality gate runs.
4. If `ANTHROPIC_API_KEY` is set, Claude reviews the image plus those measurements and returns validated JSON: metrics, type, summary and observations. If the call fails or is refused, the built-in engine is used instead.
5. The scores, recommendations and a new routine are saved.

Results are cosmetic assessments, not medical diagnoses. The UI says so.

## Getting started

```bash
npm install
cp .env.example .env.local      # fill in your Supabase URL + anon key
```

**Supabase (local):** requires Docker.
```bash
npx supabase start               # prints the API URL and anon key → .env.local
npx supabase db reset            # applies migrations + seed
npm run dev
```

**Supabase (cloud):** create a project, then run `supabase link` followed by `supabase db push`, or paste the migration SQL into the SQL editor. Then:
- Under **Authentication → URL configuration**, set the Site URL and add `https://your-domain/auth/callback` to the redirect URLs.
- Register real serials with `node scripts/register-serials.mjs serials.csv`.

Try it: sign up, then pair `ELM-DEMO-0001` (mirror) and/or `ELC-DEMO-0001` (comb).

## Scripts
| Command | Purpose |
| --- | --- |
| `npm run dev` / `build` / `start` | Next.js |
| `npm test` | Vitest unit tests (engine, recommendations, catalog, validation) |
| `npm run typecheck` / `lint` | TypeScript / ESLint |
| `tests/sql/rls.test.sql` | RLS & business-rule test; run with `psql` against a database that has the migration applied |

## Deployment
Deploy to Vercel or any Node host. Set the variables from `.env.example`, keeping `SUPABASE_SERVICE_ROLE_KEY` and `ANTHROPIC_API_KEY` server-side. The analysis route uses the Node runtime (sharp) and runs for up to 60 s.

## Product imagery
Brand-palette SVG placeholders live in `public/images/products/`. To use the official ÉLORIA photographs, see `public/images/README.md`.

## Roadmap / integration points
- **Payments:** add Stripe Checkout in `placeOrder`, and set orders to `paid` from a webhook using the service role.
- **Device firmware upload:** physical devices can post captures to `/api/analyses/[kind]` with a per-device token. The ownership checks are already in place.
- **Transactional email** (order confirmation) via Supabase hooks or Resend.
