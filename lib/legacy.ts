import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export type ScriptStep = { type: 'src'; src: string };
export type LegacyEntry = {
  file: string;
  route: string;
  slug: string;
  lang: string;
  title: string;
  desc: string;
  bodyAttrs: string;
  scripts: ScriptStep[];
};

const LEGACY_DIR = join(process.cwd(), 'legacy');

let cache: LegacyEntry[] | null = null;
function manifest(): LegacyEntry[] {
  if (!cache) cache = JSON.parse(readFileSync(join(LEGACY_DIR, 'manifest.json'), 'utf8'));
  return cache!;
}

/** Pull the `class="…"` value out of the captured <body …> attribute string. */
function bodyClass(bodyAttrs: string): string {
  const m = bodyAttrs.match(/class="([^"]*)"/i);
  return m ? m[1] : '';
}

export type LegacyPageData = {
  slug: string;
  lang: string;
  title: string;
  desc: string;
  html: string;
  cssHref: string;
  bodyClass: string;
  scripts: string[];
};

/** Everything a route needs to render one legacy page at parity. */
export function getPage(slug: string): LegacyPageData {
  const entry = manifest().find((p) => p.slug === slug);
  if (!entry) throw new Error(`Unknown legacy page: ${slug}`);
  const html = readFileSync(join(LEGACY_DIR, `${slug}.body.html`), 'utf8');
  return {
    slug,
    lang: entry.lang,
    title: entry.title,
    desc: entry.desc,
    html,
    cssHref: `/legacy/${slug}.css`,
    bodyClass: bodyClass(entry.bodyAttrs),
    scripts: entry.scripts.map((s) => s.src),
  };
}
