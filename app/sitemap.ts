import type { MetadataRoute } from 'next';
import { publicEntries } from '@/lib/legacy';
import { SITE_URL } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const fresh = new Set(['/', '/events', '/blog']); // change more often
  return publicEntries().map((e) => ({
    url: SITE_URL + (e.route === '/' ? '' : e.route),
    lastModified: now,
    changeFrequency: fresh.has(e.route) ? 'weekly' : 'monthly',
    priority: e.route === '/' ? 1 : 0.8,
  }));
}
