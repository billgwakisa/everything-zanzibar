import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  metadataBase: new URL('https://everything-zanzibar.com'),
  icons: { icon: '/1.jpg' },
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
      </head>
      <body>{children}</body>
    </html>
  );
}
