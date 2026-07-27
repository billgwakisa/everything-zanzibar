/* ============================================================================
   Tanzania Event Marketplace — reads the LIVE Supabase `events` table (public
   read) and renders the tile gallery, region filter tabs and a sponsored
   marquee. "Secure Tickets" -> quick modal -> saves to the Booking Vault
   (type 'Event Tickets') FIRST -> then hands off to the WhatsApp concierge.
   ============================================================================ */
(function () {
  'use strict';
  var WA = '255764317595';
  var FP = 'https://commons.wikimedia.org/wiki/Special:FilePath/';
  var yEl = document.getElementById('evtYear'); if (yEl) yEl.textContent = new Date().getFullYear();

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function openWA(t) { window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(t), '_blank', 'noopener'); }
  function genId() { return 'EZ-' + Math.random().toString(36).slice(2, 8).toUpperCase(); }

  function evImg(e) { var u = e.flyer || ''; if (!u) return FP + 'Sunset_with_palm_trees_%2830737629082%29.jpg?width=800'; return /^(https?:|data:|\/)/.test(u) ? u : FP + u + '?width=800'; }
  function minPrice(e) { var t = (e.tiers || []).map(function (x) { return Number(x.price); }).filter(function (n) { return !isNaN(n); }); return t.length ? Math.min.apply(null, t) : null; }
  function regionLabel(r) { return r === 'mainland' ? 'Mainland' : 'Zanzibar'; }
  function fmtDate(d) {
    if (!d) return { day: '', mon: '', full: 'Date TBA' };
    var x = new Date(d); if (isNaN(x)) return { day: '', mon: '', full: String(d) };
    return { day: x.getDate(), mon: x.toLocaleString('en', { month: 'short' }),
      full: x.toLocaleString('en', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) };
  }

  var EVENTS = [], activeRegion = '';

  function card(e) {
    var d = fmtDate(e.date), mp = minPrice(e);
    return '<article class="group bg-white rounded-3xl overflow-hidden shadow-lg shadow-ocean/10 border border-ocean/5 flex flex-col">'
      + '<div class="relative h-48 overflow-hidden">'
      +   '<div class="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-105" style="background-image:url(\'' + evImg(e) + '\')"></div>'
      +   '<div class="absolute inset-0 bg-gradient-to-t from-ocean/70 to-transparent"></div>'
      +   (d.day ? '<div class="absolute top-3 left-3 bg-white/95 rounded-xl px-3 py-1.5 text-center leading-none shadow"><div class="font-serif text-lg text-ocean">' + d.day + '</div><div class="text-[10px] uppercase tracking-wide text-teal">' + esc(d.mon) + '</div></div>' : '')
      +   '<span class="absolute top-3 right-3 text-[10px] uppercase tracking-wide bg-ocean/80 text-white px-2.5 py-1 rounded-full">' + esc(regionLabel(e.region)) + '</span>'
      +   (e.sponsored ? '<span class="absolute bottom-3 left-3 text-[10px] uppercase tracking-wide bg-gold text-ocean px-2.5 py-1 rounded-full font-medium">&#9733; Featured</span>' : '')
      + '</div>'
      + '<div class="p-5 flex flex-col flex-1">'
      +   '<h3 class="font-serif text-lg leading-tight">' + esc(e.name) + '</h3>'
      +   '<div class="text-xs text-ocean/60 mt-1">' + esc(e.loc || '') + (e.organizer ? ' &middot; by ' + esc(e.organizer) : '') + '</div>'
      +   (e.desc ? '<p class="text-sm text-ocean/65 font-light mt-2 flex-1 line-clamp-2">' + esc(e.desc) + '</p>' : '<div class="flex-1"></div>')
      +   '<div class="flex items-center justify-between mt-4 pt-3 border-t border-ocean/10">'
      +     '<span class="font-serif text-lg text-ocean">' + (mp != null ? 'Tickets from $' + mp : 'Free / TBA') + '</span>'
      +   '</div>'
      +   '<button type="button" data-tix="' + esc(e.id) + '" class="mt-3 w-full py-2.5 rounded-full bg-teal hover:bg-tealb text-white text-sm font-medium transition">Secure Tickets &rarr;</button>'
      + '</div></article>';
  }

  function render() {
    var grid = document.getElementById('evtGrid'), empty = document.getElementById('evtEmpty');
    var list = EVENTS.filter(function (e) { return !activeRegion || e.region === activeRegion; });
    grid.innerHTML = list.map(card).join('');
    if (empty) empty.classList.toggle('hidden', list.length > 0);

    // sponsored marquee (top of feed)
    var feat = EVENTS.filter(function (e) { return e.sponsored; });
    var band = document.getElementById('evtFeatured'), track = document.getElementById('evtMarquee');
    if (feat.length && band && track) {
      band.classList.remove('hidden');
      var chips = feat.map(function (e) {
        var mp = minPrice(e);
        return '<button type="button" data-tix="' + esc(e.id) + '" class="shrink-0 w-64 text-left bg-white/10 hover:bg-white/15 rounded-2xl overflow-hidden border border-white/10 transition">'
          + '<div class="h-24 bg-cover bg-center" style="background-image:url(\'' + evImg(e) + '\')"></div>'
          + '<div class="p-3"><div class="font-serif text-sm truncate">' + esc(e.name) + '</div>'
          + '<div class="text-white/60 text-xs">' + esc(regionLabel(e.region)) + (mp != null ? ' &middot; from $' + mp : '') + '</div></div></button>';
      });
      track.innerHTML = chips.join('') + chips.join('');   // duplicate for a seamless loop
    } else if (band) { band.classList.add('hidden'); }
  }

  // region filter tabs
  var tabs = document.getElementById('evtTabs');
  if (tabs) tabs.addEventListener('click', function (e) {
    var b = e.target.closest('[data-region]'); if (!b) return;
    activeRegion = b.getAttribute('data-region') || '';
    tabs.querySelectorAll('.tab').forEach(function (x) { x.classList.toggle('on', x === b); });
    render();
  });

  /* ---- Secure Tickets modal ---- */
  var evSel = null;
  function openTix(id) {
    evSel = EVENTS.filter(function (x) { return String(x.id) === String(id); })[0]; if (!evSel) return;
    document.getElementById('tx-event').textContent = evSel.name;
    document.getElementById('tx-when').textContent = fmtDate(evSel.date).full + (evSel.venue ? ' · ' + evSel.venue : '');
    var sel = document.getElementById('tx-tier'), tiers = evSel.tiers || [];
    sel.innerHTML = tiers.length
      ? tiers.map(function (t, i) { return '<option value="' + i + '">' + esc(t.name) + ' — $' + esc(t.price) + '</option>'; }).join('')
      : '<option value="-1">General entry</option>';
    document.getElementById('tx-name').value = ''; document.getElementById('tx-phone').value = ''; document.getElementById('tx-qty').value = 1;
    ['tx-name', 'tx-phone'].forEach(function (i) { document.getElementById(i).style.borderColor = ''; });
    txTotal();
    var m = document.getElementById('mTix'); m.classList.remove('hidden'); m.classList.add('flex');
  }
  function closeTix() { var m = document.getElementById('mTix'); m.classList.add('hidden'); m.classList.remove('flex'); }
  function currentTier() { var i = parseInt(document.getElementById('tx-tier').value, 10); return (evSel && evSel.tiers && evSel.tiers[i]) || null; }
  function txTotal() {
    var t = currentTier(), q = Math.max(1, parseInt(document.getElementById('tx-qty').value, 10) || 1);
    var tot = t ? Number(t.price) * q : null;
    document.getElementById('tx-total').textContent = tot != null ? '$' + tot : 'On request';
    return tot;
  }
  window.openTix = openTix; window.closeTix = closeTix; window.txTotal = txTotal;

  // delegated: cards + marquee chips both use [data-tix]
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-tix]'); if (b) { e.preventDefault(); openTix(b.getAttribute('data-tix')); }
  });

  var confirmBtn = document.getElementById('tx-confirm');
  if (confirmBtn) confirmBtn.addEventListener('click', function () {
    if (!evSel) return;
    var nm = (document.getElementById('tx-name').value || '').trim();
    var ph = (document.getElementById('tx-phone').value || '').trim();
    var q = Math.max(1, parseInt(document.getElementById('tx-qty').value, 10) || 1);
    var tier = currentTier(), tierName = tier ? tier.name : 'General', total = txTotal();
    function bad(id) { var el = document.getElementById(id); el.style.borderColor = '#f25a5a'; el.focus(); }
    if (!nm) { bad('tx-name'); return; }
    if (ph.replace(/[^0-9]/g, '').length < 8) { bad('tx-phone'); alert('Please add a valid contact number with country code (e.g. +255…).'); return; }

    // STEP 1 — save to the Booking Vault FIRST
    var id = genId();
    var rec = {
      id: id, name: nm, contact: ph, date: (evSel.date || '').slice(0, 10),
      assets: 'Event Tickets: ' + q + ' × ' + tierName + ' — ' + evSel.name,
      total: total, type: 'Event Tickets',
      status: 'Pending WhatsApp Escrow Verification', createdAt: Date.now()
    };
    try {
      if (window.EZ && window.EZ_READY) { EZ.bookings.create(rec).catch(function (e) { console.error(e); }); }
      var all = JSON.parse(localStorage.getItem('ez_bookings') || '[]'); all.push(rec);
      localStorage.setItem('ez_bookings', JSON.stringify(all));
    } catch (e) { console.error(e); alert('We could not save your request — please try again.'); return; }

    // STEP 2 — WhatsApp concierge dispatch (exact format requested)
    closeTix();
    var dateStr = fmtDate(evSel.date).full;
    openWA('Hi Everything Zanzibar! I just requested ' + q + ' ' + tierName + ' ticket' + (q > 1 ? 's' : '') +
      ' for ' + evSel.name + ' on ' + dateStr + '. My Booking ID is ' + id + '. Please confirm payment details.');
  });

  /* ---- load the live marketplace ---- */
  function boot() {
    if (window.EZ && window.EZ_READY && EZ.events) {
      EZ.events.list().then(function (rows) {
        EVENTS = (rows || []).filter(function (e) { return e.is_active !== false; }).map(function (e) {
          return { id: e.id, name: e.name, loc: e.location, date: e.starts_at, flyer: e.flyer_url,
            desc: e.description, organizer: e.organizer, region: e.region || 'zanzibar',
            venue: e.venue, tiers: e.ticket_tiers || [], sponsored: !!e.sponsored };
        });
        EVENTS.sort(function (a, b) { if (a.sponsored !== b.sponsored) return a.sponsored ? -1 : 1; return new Date(a.date || 0) - new Date(b.date || 0); });
        render();
      }).catch(function (e) { console.error('events load failed', e); render(); });
    } else { render(); }
  }
  boot();
})();
