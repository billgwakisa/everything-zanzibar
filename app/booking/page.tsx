import type { Metadata } from 'next';
import LegacyPage from '@/components/LegacyPage';
import { getPage } from '@/lib/legacy';
import { pageMetadata } from '@/lib/seo';

const SLUG = 'booking';

export function generateMetadata(): Metadata {
  return pageMetadata(SLUG);
}

export default function Page() {
  return <LegacyPage {...getPage(SLUG)} />;
}
