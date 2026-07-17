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
  var SUPABASE_URL = "https://cniqmwphzjhxrqyvcpjk.supabase.co";
  var SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNuaXFtd3BoempoeHJxeXZjcGprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQxNTc0MTEsImV4cCI6MjA5OTczMzQxMX0.VnBTbqaPBBQuEqyXmpe9zaT328xuIkGVRBxIdGgEaWQ";

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

    /* ---------------- VEHICLES — "Self-Driven Freedom" rental rides ---------------- */
    vehicles: {
      async list() { return ok(await sb.from("vehicles").select("*").eq("is_active", true).order("sort")); },
      // v = {id, name, category, rate, engine, seats, fuel, desc, image, sort}
      async upsert(v) {
        return ok(await sb.from("vehicles").upsert({
          id: v.id, name: v.name, category: v.category, daily_rate: v.rate,
          engine: v.engine, seats: v.seats, fuel: v.fuel,
          description: v.desc, image_url: v.image, sort: v.sort || 0, is_active: true
        }));
      },
      async remove(id) { return ok(await sb.from("vehicles").update({ is_active: false }).eq("id", id)); }
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

    /* ================= MEDIA STORAGE & DELIVERY PIPELINE =====================
       pick file -> convert to .webp in the browser -> upload into a mapped
       folder of the 'everything-zanzibar-media' bucket -> write the public URL
       straight back onto the DB row -> return a cache-busted URL so the new
       image appears instantly on refresh (no browser cache lag).

       AVIF NOTE: browsers DECODE avif but cannot ENCODE it (canvas.toBlob does
       not support image/avif). We standardise on WebP (universal + ~30% smaller
       than jpeg). Serve avif later via a CDN transform, not the client.
       ===================================================================== */
    media: {
      BUCKET: "everything-zanzibar-media",

      // Folder map — keeps storage predictable and tidy.
      FOLDERS: {
        banners:    "banners",     // homepage / founders / booking hero banners
        activities: "activities",  // snorkelling, caves, parasailing...
        yachts:     "yachts",      // fleet, cabin layouts, deck views
        hotels:     "hotels",      // partner hotels & villas
        rentals:    "rentals",     // cars, scooters, jet skis
        journal:    "journal",     // editorial images
        events:     "events",      // promotional flyers
        brand:      "brand",       // logos / misc
        library:    "library"      // free-form media library
      },

      slug(s) {
        return String(s || "img").toLowerCase().normalize("NFKD")
          .replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "").slice(0, 60) || "img";
      },

      // /path.webp -> /path.webp?v=1699999999   (cache-buster)
      bust(url) { return !url ? url : String(url).split("?")[0] + "?v=" + Date.now(); },

      /* Convert an image File -> WebP Blob, downscaled to maxW (default 1600). */
      async toWebp(file, maxW, quality) {
        maxW = maxW || 1600; quality = quality || 0.82;
        if (!file || !/^image\//.test(file.type)) throw new Error("That file is not an image.");
        // vectors/animations: keep original, converting would break them
        if (file.type === "image/svg+xml" || file.type === "image/gif") return null;
        var bmp = await createImageBitmap(file);
        var scale = Math.min(1, maxW / bmp.width);
        var w = Math.max(1, Math.round(bmp.width * scale));
        var h = Math.max(1, Math.round(bmp.height * scale));
        var c = document.createElement("canvas");
        c.width = w; c.height = h;
        c.getContext("2d").drawImage(bmp, 0, 0, w, h);
        var blob = await new Promise(function (r) { c.toBlob(r, "image/webp", quality); });
        if (!blob) throw new Error("WebP conversion is not supported in this browser.");
        return blob;
      },

      /* Upload a file into <folder>/<name>-<ts>.webp  ->  { path, url } */
      async put(file, folder, name, opts) {
        opts = opts || {};
        var dir  = EZ.media.FOLDERS[folder] || EZ.media.slug(folder);
        var webp = opts.raw ? null : await EZ.media.toWebp(file, opts.maxW, opts.quality);
        var body = webp || file;                                   // fall back to original
        var ext  = webp ? "webp" : ((file.name || "img.jpg").split(".").pop() || "jpg");
        var type = webp ? "image/webp" : (file.type || "application/octet-stream");
        var path = dir + "/" + EZ.media.slug(name || folder) + "-" + Date.now() + "." + ext;
        ok(await sb.storage.from(EZ.media.BUCKET).upload(path, body, {
          upsert: true, contentType: type, cacheControl: "31536000"
        }));
        var url = sb.storage.from(EZ.media.BUCKET).getPublicUrl(path).data.publicUrl;
        return { path: path, url: EZ.media.bust(url) };
      },

      /* Upload AND write the URL onto a DB row in one call.
         EZ.media.attach(file, { folder:'yachts', name:'Luxury Catamaran',
                                 table:'yachts', column:'image_url', match:{ id:'y1' } })
         -> returns the cache-busted public URL.                              */
      async attach(file, cfg) {
        cfg = cfg || {};
        var res = await EZ.media.put(file, cfg.folder, cfg.name, cfg);
        if (cfg.table && cfg.column && cfg.match) {
          var patch = {}; patch[cfg.column] = res.url;
          var q = sb.from(cfg.table).update(patch);
          Object.keys(cfg.match).forEach(function (k) { q = q.eq(k, cfg.match[k]); });
          ok(await q);                                   // RLS enforces staff-only writes
        }
        return res.url;
      },

      async remove(path) { return ok(await sb.storage.from(EZ.media.BUCKET).remove([].concat(path))); },
      async list(folder) {
        return ok(await sb.storage.from(EZ.media.BUCKET)
          .list(EZ.media.FOLDERS[folder] || folder, { limit: 100, sortBy: { column: "created_at", order: "desc" } }));
      },

      /* back-compat: existing callers do EZ.media.upload(file, 'slot') */
      async upload(file, slot) { return (await EZ.media.put(file, "brand", slot || "asset")).url; }
    }
  };

  window.EZ = EZ;
})();
