# Everything Zanzibar — Next.js (parity port)

The hand-built static site converted to Next.js (App Router, TypeScript) **at parity**:
every page looks and behaves exactly as the originals. Nothing about the design, copy,
animations, or booking flow was rewritten — the markup, CSS and JS are lifted byte-for-byte.

## How the parity port works (Stage 1)

Rather than risk visual drift by hand-rewriting ~3,600 lines of HTML into JSX, each legacy
page is split deterministically and re-served:

| Original | Becomes | Notes |
|---|---|---|
| `<style>` block(s) | `public/legacy/<slug>.css` | verbatim, hoisted into `<head>` |
| `<body>` markup | `legacy/<slug>.body.html` | verbatim, injected via `dangerouslySetInnerHTML` |
| `<script>` tags | `public/legacy/<slug>.sN.js` + kept CDNs | run **in original order** after mount |

- `scripts/extract-legacy.mjs` — regenerates all of the above from the source HTML.
- `lib/legacy.ts` — server helper: reads the manifest + body HTML per route.
- `components/LegacyPage.tsx` — client component: injects markup, loads CSS, runs scripts
  in order (Tailwind CDN → config → Supabase → `ez-api.js` → page script), and applies the
  original `<body>` utility classes to the real `<body>`.

### Route map

| Route | Source file |
|---|---|
| `/` | `everything-zanzibar.html` |
| `/booking` | `everything-zanzibar-booking.html` |
| `/activities` | `everything-zanzibar-activities.html` |
| `/blog` | `everything-zanzibar-blog.html` |
| `/founders` | `everything-zanzibar-founders.html` |
| `/admin` | `everything-zanzibar-admin.html` |

Old `.html` URLs (and `x.html`) 308-redirect to the clean routes (`next.config.mjs`) so no
existing link or bookmark breaks.

## Run

```bash
npm install
npm run extract   # regenerate legacy/ + public/legacy/ from the source HTML (already run)
npm run dev       # http://localhost:3000
npm run build && npm start
```

Data still comes from `localStorage` + the live Supabase `ez-api.js` exactly as before — no
behaviour changed.

## Stage 2 — idiomatic refactor (not done yet)

With parity locked in, refactor one page at a time behind this baseline:
1. Convert vanilla-JS features (cursor, modals, reveals, pax calculator, weather) to React components/hooks.
2. Replace `scripts/build-ssg.mjs` with async Server Components + `generateStaticParams` + ISR for the `yachts/hotels/experiences` catalogue (finishes the original "Phase 2/3" plan).
3. Move SEO/JSON-LD/OG into the Metadata API; swap the hand-rolled `picture()` for `next/image`.
4. Add `[locale]` i18n for `en/it/de` (replaces the duplicated `it/` `de/` trees).
5. Migrate the admin CMS from `localStorage` to Supabase Auth + the RLS already in `backend/schema.sql`.
