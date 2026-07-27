import type { NextRequest } from 'next/server';

// Runs on Vercel's edge network, where each request carries the visitor's
// coarse geo in x-vercel-ip-* headers. We store country/region/city only -
// never the IP address itself.
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

// Publishable (anon) key + URL - same public values the browser already ships.
// Inserts are allowed by the "public log view" RLS policy on page_views.
const SUPABASE_URL = 'https://cniqmwphzjhxrqyvcpjk.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNuaXFtd3BoempoeHJxeXZjcGprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQxNTc0MTEsImV4cCI6MjA5OTczMzQxMX0.VnBTbqaPBBQuEqyXmpe9zaT328xuIkGVRBxIdGgEaWQ';

export async function POST(req: NextRequest) {
  try {
    const body: Record<string, unknown> = await req.json().catch(() => ({}));
    const h = req.headers;
    const dec = (v: string | null) => {
      if (!v) return null;
      try { return decodeURIComponent(v); } catch { return v; }
    };
    const str = (v: unknown, max: number) =>
      typeof v === 'string' && v ? v.slice(0, max) : null;

    const row = {
      path:       str(body.path, 300),
      country:    h.get('x-vercel-ip-country') || null,
      region:     h.get('x-vercel-ip-country-region') || null,
      city:       dec(h.get('x-vercel-ip-city')),
      referrer:   str(body.r, 300),
      visitor_id: str(body.v, 64),
    };

    await fetch(`${SUPABASE_URL}/rest/v1/page_views`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(row),
    });

    return new Response(null, { status: 204 });
  } catch {
    // Analytics must never surface an error to the visitor's page.
    return new Response(null, { status: 204 });
  }
}
