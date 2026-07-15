import type { Metadata } from 'next';
import LegacyPage from '@/components/LegacyPage';
import { getPage } from '@/lib/legacy';

const SLUG = 'founders';

export async function generateMetadata(): Promise<Metadata> {
  const p = getPage(SLUG);
  return { title: p.title, description: p.desc };
}

export default function Page() {
  return <LegacyPage {...getPage(SLUG)} />;
}
