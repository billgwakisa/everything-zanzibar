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
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let revealed = false;
    const reveal = () => {
      if (revealed) return;
      revealed = true;
      if (rootRef.current) rootRef.current.style.opacity = '1';
    };

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
        if (i >= scripts.length) {
          // All page scripts have run — including the Tailwind Play CDN, whose
          // utility classes only exist after it executes. Reveal on the next
          // paint so the page is already fully styled (no giant-logo / FOUC flash).
          requestAnimationFrame(() => requestAnimationFrame(reveal));
          return;
        }
        const el = document.createElement('script');
        el.src = scripts[i++];
        el.async = false;
        el.dataset.legacy = '';
        el.onload = next;
        el.onerror = next; // a failed CDN (e.g. offline) must not stall the chain
        document.body.appendChild(el);
      };
      next();
    } else {
      reveal();
    }

    // Safety nets: never leave content hidden if a script hangs or fails.
    const onLoad = () => reveal();
    window.addEventListener('load', onLoad);
    const cap = window.setTimeout(reveal, 2000);

    return () => {
      window.removeEventListener('load', onLoad);
      window.clearTimeout(cap);
      for (const c of added) document.body.classList.remove(c);
    };
  }, [scripts, bodyClass]);

  return (
    <>
      {/* React 19 only hoists a stylesheet into <head> (render-blocking, deduped)
          when it declares a precedence — without this the link stays in <body>
          and the page paints unstyled first before the CSS applies. */}
      <link rel="stylesheet" href={cssHref} precedence="high" />
      {/* If JS is disabled the reveal never runs, so force the content visible. */}
      <noscript>
        <style>{`.ez-legacy-root{opacity:1 !important}`}</style>
      </noscript>
      {/* Held hidden until scripts + Tailwind CDN have styled the page, then
          faded in — this is what removes the "big logo then page" flash on the
          Tailwind-CDN pages (activities, booking, events, admin). */}
      <div
        ref={rootRef}
        className="ez-legacy-root"
        style={{ opacity: 0, transition: 'opacity .22s ease' }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </>
  );
}
