'use client';

import { useEffect, useRef } from 'react';
import type { LegacyPageData } from '@/lib/legacy';

/**
 * Renders one hand-built legacy page at parity:
 *   • its markup, injected verbatim (byte-for-byte identical to the original)
 *   • its stylesheet, hoisted into <head> by Next
 *   • its scripts, run in the ORIGINAL document order once the markup is in the DOM
 *     (external CDNs → inline config → supabase → ez-api → page script)
 * Body-level utility classes (Tailwind CDN pages) are applied to the real <body>.
 */
export default function LegacyPage({ html, cssHref, scripts, bodyClass }: LegacyPageData) {
  const ran = useRef(false);

  useEffect(() => {
    // apply the original <body> classes to the real document body
    const added: string[] = [];
    if (bodyClass) {
      for (const c of bodyClass.split(/\s+/).filter(Boolean)) {
        if (!document.body.classList.contains(c)) {
          document.body.classList.add(c);
          added.push(c);
        }
      }
    }

    // inject scripts sequentially so execution order matches the original page
    if (!ran.current) {
      ran.current = true;
      let i = 0;
      const next = () => {
        if (i >= scripts.length) return;
        const el = document.createElement('script');
        el.src = scripts[i++];
        el.async = false;
        el.dataset.legacy = '';
        el.onload = next;
        el.onerror = next; // a failed CDN (e.g. offline) must not stall the chain
        document.body.appendChild(el);
      };
      next();
    }

    return () => {
      for (const c of added) document.body.classList.remove(c);
    };
  }, [scripts, bodyClass]);

  return (
    <>
      {/* Next hoists stylesheet links into <head> and dedupes them */}
      <link rel="stylesheet" href={cssHref} />
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </>
  );
}
