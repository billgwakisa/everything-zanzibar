import type { Metadata } from 'next';
import { getEntry } from './legacy';

export const SITE_URL = 'https://everything-zanzibar.com';
export const SITE_NAME = 'Everything Zanzibar';

const DEFAULT_DESC =
  'Everything Zanzibar - insider island guides, tours and activities, luxury yacht and jet-ski charters, partner hotels, transfers and the Tanzania event marketplace. Serving travelers across Africa and Europe.';

/** Manifest titles/descs carry HTML entities (extracted from HTML); decode them
 *  so <title>/<meta> render the real characters, not literal "&amp;". */
function decode(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–');
}

/** Same English content, region-signalled to Google for BOTH Africa
 *  (Tanzania / East Africa) and Europe (UK, Ireland, Germany). */
function regionAlternates(route: string): Record<string, string> {
  return {
    en: route,
    'en-TZ': route, // Africa - Tanzania (home market)
    'en-KE': route, // Africa - Kenya / East Africa
    'en-ZA': route, // Africa - South Africa
    'en-GB': route, // Europe - United Kingdom
    'en-IE': route, // Europe - Ireland
    'en-DE': route, // Europe - Germany
    'x-default': route,
  };
}

/** Full per-page SEO metadata: title, description, canonical, Africa+Europe
 *  hreflang, Open Graph and Twitter cards. The admin console is noindex. */
export function pageMetadata(slug: string): Metadata {
  const entry = getEntry(slug);
  const route = entry.route;
  const isAdmin = slug === 'admin';
  const title = decode(entry.title);
  const description = decode(entry.desc) || DEFAULT_DESC;

  return {
    title,
    description,
    alternates: {
      canonical: route,
      languages: isAdmin ? undefined : regionAlternates(route),
    },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      url: route,
      title,
      description,
      locale: 'en_TZ',
      alternateLocale: ['en_GB', 'en_KE', 'en_IE'],
      images: [{ url: '/1.jpg', alt: SITE_NAME }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/1.jpg'],
    },
    robots: isAdmin
      ? { index: false, follow: false, nocache: true }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-image-preview': 'large',
            'max-snippet': -1,
            'max-video-preview': -1,
          },
        },
  };
}
