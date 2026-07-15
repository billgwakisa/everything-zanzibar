/* ============================================================================
   Everything Zanzibar → Next.js — legacy page extractor (parity port, Stage 1)
   Splits each hand-built static HTML page into:
     • <slug>.css        – every <style> block, concatenated, VERBATIM
     • <slug>.body.html  – the <body> markup with <script> tags removed, VERBATIM
     • <slug>.sN.js       – each inline <script>, in document order
   and records the ordered script list (external CDNs + local files) in
   legacy.manifest.json. Nothing about look/feel/behaviour is rewritten — the
   markup, CSS and JS are copied byte-for-byte so the pages render identically.
   ============================================================================ */
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const DEST = join(HERE, '..');
// Source static site, relative to this app inside the repo (sibling folder).
// Override with EZ_SRC=/abs/path if the sources live elsewhere.
const SRC  = process.env.EZ_SRC || join(DEST, '..', 'Everything Zanzibar', 'Everything Zanzibar');

const LEGACY_DIR = join(DEST, 'legacy');        // private: body html + manifest (read via fs on the server)
const PUB_LEGACY = join(DEST, 'public', 'legacy'); // served: css + js
mkdirSync(LEGACY_DIR, { recursive: true });
mkdirSync(PUB_LEGACY, { recursive: true });

// source file  ->  clean route + slug
const PAGES = [
  { file: 'everything-zanzibar.html',            route: '/',          slug: 'home' },
  { file: 'everything-zanzibar-booking.html',    route: '/booking',   slug: 'booking' },
  { file: 'everything-zanzibar-activities.html', route: '/activities',slug: 'activities' },
  { file: 'everything-zanzibar-blog.html',       route: '/blog',      slug: 'blog' },
  { file: 'everything-zanzibar-founders.html',   route: '/founders',  slug: 'founders' },
  { file: 'everything-zanzibar-admin.html',      route: '/admin',     slug: 'admin' },
];

const pick = (re, s) => { const m = s.match(re); return m ? m[1].trim() : ''; };

const manifest = [];

for (const p of PAGES) {
  const html = readFileSync(join(SRC, p.file), 'utf8');

  const lang  = pick(/<html[^>]*\blang="([^"]*)"/i, html) || 'en';
  const title = pick(/<title>([\s\S]*?)<\/title>/i, html);
  const desc  = pick(/<meta\s+name="description"\s+content="([^"]*)"/i, html);

  // ---- all <style> blocks (verbatim) ----
  const css = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map(m => m[1]).join('\n\n');
  writeFileSync(join(PUB_LEGACY, `${p.slug}.css`), css);

  // ---- scripts in document order (external + inline) ----
  const scripts = [];
  let inlineIdx = 0;
  const scriptRe = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = scriptRe.exec(html))) {
    const attrs = m[1] || '';
    const srcMatch = attrs.match(/\bsrc="([^"]+)"/i);
    if (srcMatch) {
      let src = srcMatch[1];
      if (src === 'backend/ez-api.js' || src.endsWith('/backend/ez-api.js')) src = '/backend/ez-api.js';
      scripts.push({ type: 'src', src });
    } else {
      const code = m[2];
      if (!code.trim()) continue;
      const fname = `${p.slug}.s${inlineIdx}.js`;
      writeFileSync(join(PUB_LEGACY, fname), code);
      scripts.push({ type: 'src', src: `/legacy/${fname}` });
      inlineIdx++;
    }
  }

  // ---- body markup, scripts stripped (verbatim otherwise) ----
  let body = pick(/<body[^>]*>([\s\S]*)<\/body>/i, html);
  body = body.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
  // preserve any data-* attributes that lived on <body> (e.g. data-wa) by lifting to a wrapper
  const bodyAttrs = pick(/<body([^>]*)>/i, html);
  writeFileSync(join(LEGACY_DIR, `${p.slug}.body.html`), body);

  manifest.push({ ...p, lang, title, desc, bodyAttrs, scripts });
  console.log(`✓ ${p.slug.padEnd(11)} css:${css.length}b  scripts:${scripts.length}  body:${body.length}b`);
}

writeFileSync(join(LEGACY_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2));

// ---- copy image + data assets into public/ (rename *.jpg.jpg -> *.jpg) ----
const PUB = join(DEST, 'public');
for (const f of readdirSync(SRC)) {
  if (/\.(jpe?g|png|webp|svg|ico|gif)(\.jpg)?$/i.test(f)) {
    // Copy VERBATIM (markup references the exact original name, incl. ".jpg.jpg")…
    copyFileSync(join(SRC, f), join(PUB, f));
    // …plus a cleaned alias so a tidy filename also resolves.
    const clean = f.replace(/\.jpg\.jpg$/i, '.jpg');
    if (clean !== f) copyFileSync(join(SRC, f), join(PUB, clean));
  }
}
// the real Supabase API client, served at /backend/ez-api.js (identical behaviour to today)
copyFileSync(join(SRC, 'backend', 'ez-api.js'), join(DEST, 'public', 'backend', 'ez-api.js'));

console.log('\n✓ manifest + assets written');
