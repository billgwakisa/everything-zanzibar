import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { SITE_URL, SITE_NAME } from '@/lib/seo';

const DESCRIPTION =
  'Everything Zanzibar - insider island guides, tours and activities, luxury yacht and jet-ski charters, partner hotels, transfers and the Tanzania event marketplace. Serving travelers across Africa and Europe.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Everything Zanzibar — Tours, Events & Luxury Charters',
    template: '%s', // pages already carry the brand; pass their title through
  },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    'Zanzibar tours',
    'things to do in Zanzibar',
    'Zanzibar activities',
    'Zanzibar yacht charter',
    'Zanzibar events',
    'Zanzibar festivals',
    'Stone Town',
    'Nungwi',
    'Mnemba',
    'Tanzania travel',
    'Zanzibar holiday',
    'Zanzibar excursions',
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  icons: { icon: '/1.jpg', apple: '/1.jpg' },
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    url: SITE_URL,
    locale: 'en_TZ',
    alternateLocale: ['en_GB', 'en_KE', 'en_IE'],
    images: [{ url: '/1.jpg', alt: SITE_NAME }],
  },
  twitter: { card: 'summary_large_image', images: ['/1.jpg'] },
  formatDetection: { telephone: false },
  verification: { google: 'm7n5u0IqzV6N1h-4MB6Pymc_JIVy8DO16ZyRclJFt5k' },
};

// Site-wide structured data. areaServed + contactPoint declare that the brand
// serves BOTH Africa and Europe (the two visitor markets).
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'TravelAgency',
      '@id': `${SITE_URL}/#org`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/1.jpg`,
      image: `${SITE_URL}/1.jpg`,
      description: DESCRIPTION,
      telephone: '+255764317595',
      priceRange: '$$-$$$',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Zanzibar',
        addressRegion: 'Zanzibar',
        addressCountry: 'TZ',
      },
      areaServed: [
        { '@type': 'Continent', name: 'Africa' },
        { '@type': 'Continent', name: 'Europe' },
        { '@type': 'Country', name: 'Tanzania' },
        { '@type': 'Country', name: 'Kenya' },
        { '@type': 'Country', name: 'South Africa' },
        { '@type': 'Country', name: 'United Kingdom' },
        { '@type': 'Country', name: 'Ireland' },
        { '@type': 'Country', name: 'Germany' },
        { '@type': 'Country', name: 'Italy' },
        { '@type': 'Country', name: 'France' },
      ],
      sameAs: [
        'https://instagram.com/everythingzanzibar',
        'https://www.tiktok.com/@everythingzanzibar',
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+255764317595',
        contactType: 'customer service',
        availableLanguage: ['en', 'sw'],
        areaServed: ['TZ', 'KE', 'ZA', 'GB', 'IE', 'DE', 'IT', 'FR'],
      },
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      inLanguage: 'en',
      publisher: { '@id': `${SITE_URL}/#org` },
    },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Same web fonts every legacy page used — loaded once, globally. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..600;1,9..144,400&family=Inter:wght@300;400;500;600&family=Open+Sans:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        {/* Brand navy as the base canvas so pages that theme via the Tailwind
            CDN (JS) never flash a white background before that script loads. */}
        <style>{`html{background:#0A2540}`}</style>
        {/* Organization + website structured data for Google (Africa + Europe). */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
