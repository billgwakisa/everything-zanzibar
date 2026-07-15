/* ============================================================================
   EVERYTHING ZANZIBAR — API client (Supabase)
   Drop-in replacement for the admin/public localStorage store. Load BEFORE
   your page script:
     <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
     <script src="backend/ez-api.js"></script>
   Then use the async window.EZ.* methods (see backend/README.md for the
   localStorage -> EZ swap in the admin).
   ============================================================================ */
(function () {
  "use strict";

  // ---- CONFIG: paste these from Supabase → Project Settings → API ----
  var SUPABASE_URL = "https://gmunqhrgsdfqingfexgl.supabase.co";
  var SUPABASE_ANON_KEY = "sb_publishable_01KSnXYhfia8cIrf2vdByA_wDCaeMMu";

  // Only activate once real keys are pasted in (and supabase-js is loaded).
  var configured = SUPABASE_URL.indexOf("YOUR-PROJECT") === -1 && SUPABASE_ANON_KEY.indexOf("YOUR-") === -1;
  if (!configured || !window.supabase) { window.EZ_READY = false; return; }
  var sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  window.EZ_READY = true;

  // helper: throw on error so callers can try/catch
  function ok(res) { if (res.error) throw res.error; return res.data; }

  var EZ = {
    client: sb,

    /* ---------------- AUTH + RBAC ---------------- */
    auth: {
      async signIn(email, password) {
        ok(await sb.auth.signInWithPassword({ email: email, password: password }));
        return EZ.auth.role();
      },
      async signOut() { await sb.auth.signOut(); },
      async session() { return (await sb.auth.getSession()).data.session; },
      // returns 'admin' | 'manager' | 'media' | null
      // Prefers the role in the signed-in user's auth metadata (user_metadata.role),
      // normalised to lower-case ('Admin'→'admin'); falls back to the profiles table.
      async role() {
        var s = await EZ.auth.session(); if (!s) return null;
        var meta = s.user.user_metadata && (s.user.user_metadata.role || s.user.user_metadata.Role);
        if (meta) return String(meta).toLowerCase();
        try { var data = ok(await sb.from("profiles").select("role").eq("id", s.user.id).single()); return data ? data.role : null; }
        catch (e) { return null; }
      }
    },

    /* ---------------- ACTIVITIES ---------------- */
    activities: {
      async list() { return ok(await sb.from("activities").select("*").eq("is_active", true)); },
      // a = {name, category, location, duration, visualPrompt|image, prices:{single,double,triple,group}}
      async upsert(a) {
        var row = {
          name: a.name, category: a.category, location: a.location, duration: a.duration,
          visual_prompt: a.visualPrompt || null, image_url: a.image || null,
          price_single: a.prices && a.prices.single, price_double: a.prices && a.prices.double,
          price_triple: a.prices && a.prices.triple, price_group: a.prices && a.prices.group,
          is_active: true, updated_at: new Date().toISOString()
        };
        return ok(await sb.from("activities").upsert(row, { onConflict: "name" }));
      },
      async remove(name) { return ok(await sb.from("activities").update({ is_active: false }).eq("name", name)); }
    },

    /* ---------------- HOTELS ---------------- */
    hotels: {
      async list() { return ok(await sb.from("hotels").select("*").order("sort")); },
      async upsert(h) { return ok(await sb.from("hotels").upsert({ id: h.id, name: h.name, area: h.area, image_url: h.image, highlights: h.highlights || [], sort: h.sort || 0 })); },
      async remove(id) { return ok(await sb.from("hotels").delete().eq("id", id)); }
    },

    /* ---------------- YACHTS / THE FLEET EXPERIENCE ---------------- */
    yachts: {
      async list() { return ok(await sb.from("yachts").select("*").order("sort")); },
      // y = {id, name, cap, from, image, desc, amenities[]}
      async upsert(y) {
        return ok(await sb.from("yachts").upsert({
          id: y.id, name: y.name, capacity: y.cap, price_label: y.from,
          image_url: y.image, description: y.desc, amenities: y.amenities || [], sort: y.sort || 0
        }));
      },
      async remove(id) { return ok(await sb.from("yachts").delete().eq("id", id)); }
    },

    /* ---------------- TRANSIT (singleton) ---------------- */
    transit: {
      async get() { var r = ok(await sb.from("transit").select("*").eq("id", 1).maybeSingle()); return r || {}; },
      async save(t) { return ok(await sb.from("transit").upsert({ id: 1, intro: t.intro, throughout: t.throughout, departure: t.departure })); }
    },

    /* ---------------- EVENTS ---------------- */
    events: {
      async list() { return ok(await sb.from("events").select("*").order("starts_at")); },
      async upsert(e) { return ok(await sb.from("events").upsert({ id: e.id || undefined, name: e.name, location: e.loc, starts_at: e.date, price_tiers: e.price, flyer_url: e.flyer, description: e.desc })); },
      async remove(id) { return ok(await sb.from("events").delete().eq("id", id)); }
    },

    /* ---------------- JOURNAL / POSTS ---------------- */
    posts: {
      async list() { return ok(await sb.from("posts").select("*").order("created_at", { ascending: false })); },
      async upsert(p) { return ok(await sb.from("posts").upsert({ id: p.id || undefined, title: p.title, category: p.cat, published: p.date || null, image_url: p.img, excerpt: p.excerpt, body: p.body })); },
      async remove(id) { return ok(await sb.from("posts").delete().eq("id", id)); }
    },

    /* ---------------- BOOKING VAULT ---------------- */
    bookings: {
      // PUBLIC pages call create() with the anon key (RLS allows insert only)
      async create(rec) {
        rec.id = rec.id || ("EZ-" + Math.random().toString(36).slice(2, 8).toUpperCase());
        return ok(await sb.from("bookings").insert({
          id: rec.id, name: rec.name, contact: rec.contact, travel_date: rec.date || null,
          assets: rec.assets, total: rec.total, type: rec.type, status: "Pending WhatsApp Escrow Verification"
        }));
      },
      async list() { return ok(await sb.from("bookings").select("*").order("created_at", { ascending: false })); }, // admin only (RLS)
      async setStatus(id, status) { return ok(await sb.from("bookings").update({ status: status }).eq("id", id)); },
      async remove(id) { return ok(await sb.from("bookings").delete().eq("id", id)); }
    },

    /* ---------------- RESERVATIONS (private activity bookings — ADMIN-only read) ---------------- */
    reservations: {
      // PUBLIC activity modal calls create() with the anon key (RLS allows insert only)
      async create(rec) {
        rec.id = rec.id || ("EZ-" + Math.random().toString(36).slice(2, 8).toUpperCase());
        return ok(await sb.from("reservations").insert({
          id: rec.id, name: rec.name, phone: rec.contact, activity: rec.activity || rec.assets,
          travel_date: rec.date || null, pax: rec.pax || null, total: rec.total,
          status: "Pending WhatsApp Escrow Verification"
        }));
      },
      async list() { return ok(await sb.from("reservations").select("*").order("created_at", { ascending: false })); }, // admin only (RLS)
      async setStatus(id, status) { return ok(await sb.from("reservations").update({ status: status }).eq("id", id)); },
      async remove(id) { return ok(await sb.from("reservations").delete().eq("id", id)); }
    },

    /* ---------------- SETTINGS ---------------- */
    settings: {
      async get() { var r = ok(await sb.from("settings").select("value").eq("key", "site").maybeSingle()); return (r && r.value) || {}; },
      async save(v) { return ok(await sb.from("settings").upsert({ key: "site", value: v })); }
    },

    /* ---------------- MEDIA STORAGE ---------------- */
    media: {
      // uploads a File/Blob to the 'media' bucket and returns a public URL
      async upload(file, slot) {
        var ext = (file.name || "img.jpg").split(".").pop();
        var path = slot + "-" + Date.now() + "." + ext;
        ok(await sb.storage.from("media").upload(path, file, { upsert: true }));
        return sb.storage.from("media").getPublicUrl(path).data.publicUrl;
      }
    }
  };

  window.EZ = EZ;
})();
