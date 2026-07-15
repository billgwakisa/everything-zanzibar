
(function(){
  "use strict";
  var WA = '255764317595';
  /* shadow-log every enquiry to the admin Booking & Payments Vault (same-origin localStorage) */
  function genResId(){ return 'EZ-' + Math.random().toString(36).slice(2,8).toUpperCase(); }
  function logBooking(rec){ try{ if(window.EZ && window.EZ_READY){ EZ.bookings.create(rec).catch(function(e){console.error(e);}); } var all=JSON.parse(localStorage.getItem('ez_bookings')||'[]'); all.push(Object.assign({ id:genResId(), status:'Pending WhatsApp Escrow Verification', createdAt:Date.now() }, rec)); localStorage.setItem('ez_bookings', JSON.stringify(all)); return true; }catch(e){ console.error(e); return false; } }                 /* +255 764 317 595 */
  var FP = 'https://commons.wikimedia.org/wiki/Special:FilePath/';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.getElementById('year').textContent = new Date().getFullYear();

  /* ---------- data ---------- */
  var FLEET = [
    { name:'Luxury Catamaran', cap:'Up to 12 guests', from:'from $850 / day',
      img:'Approaching_Zanzibar.jpg',
      amenities:['Twin hulls & shade deck','Snorkel gear & paddleboards','Captain, crew & chef','Sound system & cooler bar'] },
    { name:'Luxury Motor Yacht', cap:'Up to 8 guests', from:'from $1,200 / day',
      img:'Zanzibar-Mnemba-Island-aerial-view_%282%29-Website-1920x1080-fill-gravity%3Dauto-Q_Auto%3DBest.jpg',
      amenities:['Air-con cabin & sun pads','Pro skipper & deckhand','Premium bar & catering','Dive to Mnemba on request'] },
    { name:'Sunset Cruiser (traditional dhow)', cap:'Up to 20 guests', from:'from $480 / cruise',
      img:'Sunset_with_palm_trees_%2830737629082%29.jpg',
      amenities:['Hand-built Zanzibari dhow','Golden-hour timing','Champagne & canapés','Live acoustic Taarab option'] }
  ];

  var HOTELS = [
    { name:'Nungwi Beach Resort', area:'Nungwi · North coast',
      img:'Paradise_at_Nungwi%2C_Kaskazini_A%2C_Unguja_North%2C_Zanzibar.jpg',
      desc:'Barefoot luxury on the island’s best swim-at-any-tide beach, with sunset front and centre.',
      tags:['Beachfront','Infinity pool','All-inclusive'] },
    { name:'Matemwe Boutique Lodge', area:'Matemwe · North-east',
      img:'Beach_at_Matemwe.jpg',
      desc:'Intimate ocean-view bandas facing Mnemba atoll — the diver’s and honeymooner’s favourite.',
      tags:['Reef access','Spa','Adults-friendly'] },
    { name:'Stone Town Palace Hotel', area:'Stone Town · UNESCO quarter',
      img:'Old_Fort_of_Zanzibar.jpg',
      desc:'A restored merchant house of carved doors and rooftop dinners, steps from Forodhani market.',
      tags:['Boutique','Rooftop bar','Heritage'] },
    { name:'Paje Lagoon Villas', area:'Paje · East coast',
      img:'PAJE%2C_Zanzibar.jpg',
      desc:'Laid-back kite-beach villas on a turquoise lagoon — wind, vibes and bonfire nights.',
      tags:['Lagoon','Kitesurf','Private villa'] }
  ];

  /* ---------- render fleet — LIVE-bound to the admin 'ez_yachts' Fleet Experience (falls back to defaults) ---------- */
  var fleetGrid = document.getElementById('fleetGrid');
  function liveFleet(){
    try{ var s=JSON.parse(localStorage.getItem('ez_yachts')||'null');
      if(s && s.length) return s.map(function(y){ return { name:y.name, cap:y.cap||'', from:y.from||'', img:y.image||y.img||'', desc:y.desc||'', amenities:y.amenities||[] }; });
    }catch(e){}
    return FLEET;
  }
  function yachtImg(y){ var u=y.img||''; if(!u) return ''; return /^(https?:|data:|\/)/.test(u) ? u : FP+u+'?width=900'; }
  function renderFleet(){
    fleetGrid.innerHTML = liveFleet().map(function(y){
      return '<article class="bg-white rounded-3xl overflow-hidden shadow-lg shadow-ocean/10 border border-ocean/5 flex flex-col">'
        + '<div class="h-52 relative" style="background:linear-gradient(180deg,rgba(10,37,64,0),rgba(10,37,64,.35)),url(\''+yachtImg(y)+'\') center/cover;background-color:#1E70B0;">'
        + (y.from ? '<span class="absolute top-3 right-3 bg-ocean/85 text-gold text-xs font-medium px-3 py-1 rounded-full">'+y.from+'</span>' : '')+'</div>'
        + '<div class="p-6 flex flex-col flex-1">'
        + '<h3 class="font-serif text-xl">'+y.name+'</h3>'
        + (y.cap ? '<p class="text-teal text-sm font-medium mt-1">'+y.cap+'</p>' : '')
        + (y.desc ? '<p class="text-ocean/60 text-sm font-light mt-1">'+y.desc+'</p>' : '')
        + '<ul class="mt-4 space-y-2 text-sm text-ocean/70 flex-1">'
        + (y.amenities||[]).map(function(a){ return '<li class="flex items-start gap-2"><span class="text-gold">✦</span>'+a+'</li>'; }).join('')
        + '</ul>'
        + '<button onclick="selectYacht(\''+String(y.name).replace(/'/g,"\\'")+'\')" class="mt-6 w-full py-3 rounded-full bg-teal hover:bg-tealb text-white font-medium transition">Book this →</button>'
        + '</div></article>';
    }).join('');
  }
  renderFleet();
  // LIVE two-way binding: re-render instantly when an Admin/Manager edits the fleet in the dashboard (another tab)
  window.addEventListener('storage', function(e){ if(e.key==='ez_yachts') renderFleet(); });

  /* ---------- render hotels — LIVE-bound to the admin 'ez_hotels' Staylist (falls back to defaults) ---------- */
  var hotelGrid = document.getElementById('hotelGrid');
  function liveHotels(){
    try{ var s=JSON.parse(localStorage.getItem('ez_hotels')||'null');
      if(s && s.length) return s.map(function(h){ return { name:h.name, area:h.area, img:h.image||h.img||'', desc:h.desc||'', tags:h.highlights||h.tags||[] }; });
    }catch(e){}
    return HOTELS;
  }
  function hotelImg(h){ var u=h.img||''; if(!u) return ''; return /^(https?:|data:|\/)/.test(u) ? u : FP+u+'?width=800'; }
  function renderHotels(){
    hotelGrid.innerHTML = liveHotels().map(function(h){
      return '<article class="bg-white text-ocean rounded-3xl overflow-hidden shadow-lg shadow-black/20 flex flex-col">'
        + '<div class="h-44" style="background:linear-gradient(180deg,rgba(10,37,64,0),rgba(10,37,64,.3)),url(\''+hotelImg(h)+'\') center/cover;background-color:#1E70B0;"></div>'
        + '<div class="p-5 flex flex-col flex-1">'
        + '<span class="text-teal text-xs font-medium tracking-wide">'+(h.area||'')+'</span>'
        + '<h3 class="font-serif text-lg mt-1">'+h.name+'</h3>'
        + (h.desc ? '<p class="text-ocean/65 text-sm mt-2 flex-1 font-light">'+h.desc+'</p>' : '<div class="flex-1"></div>')
        + '<div class="flex flex-wrap gap-1.5 mt-3">'
        + (h.tags||[]).map(function(t){ return '<span class="text-[11px] bg-teal/10 text-teal px-2.5 py-1 rounded-full">'+t+'</span>'; }).join('')
        + '</div>'
        + '<button onclick="inquireHotel(\''+String(h.name).replace(/'/g,"\\'")+'\')" class="mt-5 w-full py-2.5 rounded-full border border-teal text-teal hover:bg-teal hover:text-white font-medium transition">Inquire about stay</button>'
        + '</div></article>';
    }).join('');
  }
  renderHotels();
  // LIVE two-way binding: re-render instantly when a Manager/Admin edits the Staylist in the dashboard (another tab).
  window.addEventListener('storage', function(e){ if(e.key==='ez_hotels') renderHotels(); });

  /* ---------- Island Cruise Car & Scooter Rentals (maps into the itinerary ledger) ---------- */
  var RENTALS = [
    { id:'jeep',    name:'Compact Safari 4x4 Jeep', img:'Old_Fort_of_Zanzibar.jpg', rate:55, blurb:'Go-anywhere on dirt tracks to hidden beaches. Seats 4, full A/C.', tags:['4x4','A/C','Seats 4'] },
    { id:'suv',     name:'Luxury SUV',              img:'Beach_at_Matemwe.jpg', rate:90, blurb:'Premium comfort for families and longer island cruises. Seats 6.', tags:['Automatic','Premium','Seats 6'] },
    { id:'scooter', name:'Premium Island Scooter',  img:'PAJE%2C_Zanzibar.jpg', rate:20, blurb:'The breezy local way to weave the coast roads. 2 helmets included.', tags:['Easy park','2 helmets','Coast cruiser'] }
  ];
  var rentalGrid = document.getElementById('rentalGrid');
  if(rentalGrid){
    rentalGrid.innerHTML = RENTALS.map(function(v){
      return '<article class="bg-white rounded-3xl overflow-hidden shadow-lg shadow-ocean/10 border border-ocean/5 flex flex-col">'
        + '<div class="h-40" style="background:linear-gradient(180deg,rgba(10,37,64,0),rgba(10,37,64,.4)),url(\''+FP+v.img+'?width=800\') center/cover;background-color:#1E70B0;"></div>'
        + '<div class="p-5 flex flex-col flex-1">'
        + '<h4 class="font-serif text-lg">'+v.name+'</h4>'
        + '<div class="flex flex-wrap gap-1.5 mt-2">'+v.tags.map(function(t){return '<span class="text-[11px] bg-teal/10 text-teal px-2.5 py-1 rounded-full">'+t+'</span>';}).join('')+'</div>'
        + '<p class="text-sm text-ocean/65 font-light mt-3 flex-1">'+v.blurb+'</p>'
        + '<div class="flex items-center justify-between mt-4 pt-3 border-t border-ocean/10"><span class="font-serif text-xl text-ocean">$'+v.rate+'<span class="text-xs text-ocean/50 font-sans"> / day</span></span></div>'
        + '<button onclick="reserveRental(\''+v.id+'\')" class="mt-4 w-full py-2.5 rounded-full bg-teal hover:bg-tealb text-white text-sm font-medium transition">Reserve this cruiser →</button>'
        + '</div></article>';
    }).join('');
  }
  window.reserveRental = function(id){
    var v = RENTALS.filter(function(x){return x.id===id;})[0]; if(!v) return;
    // persistence intercept: save to ledger first, then concierge confirmation
    if(!logBooking({ name:'(rental reservation)', contact:'', date:'', assets:'Rental: '+v.name+' ($'+v.rate+'/day)', total:v.rate, type:'Rental' })){ alert('We could not save your reservation — please try again.'); return; }
    send([
      '*EVERYTHING ZANZIBAR — RENTAL RESERVATION*',
      '━━━━━━━━━━━━━━━',
      '*Vehicle:* '+v.name,
      '*Daily rate:* $'+v.rate+' / day',
      '━━━━━━━━━━━━━━━',
      'Please confirm availability, my pickup date and number of days to lock in this self-drive cruiser.'
    ].join('\n'));
  };

  /* ---------- view switching ---------- */
  function scrollTopNow(){ window.scrollTo({ top:0, behavior: reduce ? 'auto' : 'smooth' }); }
  window.showView = function(name){
    document.querySelectorAll('[data-view]').forEach(function(v){
      var on = v.getAttribute('data-view') === name;
      v.classList.toggle('hidden', !on);
      if(on){ v.classList.remove('view-anim'); void v.offsetWidth; v.classList.add('view-anim'); }
    });
    closeMenu(); scrollTopNow(); refreshReveal();
  };
  window.goHome = function(){ showView('home'); };
  window.goSection = function(id){
    showView('home');
    var el = document.getElementById(id);
    setTimeout(function(){ el.scrollIntoView({ behavior: reduce ? 'auto':'smooth' }); }, 60);
  };

  /* ---------- yacht helpers ---------- */
  window.selectYacht = function(type){
    showView('yacht');
    setTimeout(function(){
      var sel = document.getElementById('y-type');
      for(var i=0;i<sel.options.length;i++){ if(sel.options[i].value === type){ sel.selectedIndex = i; break; } }
      document.getElementById('bookform').scrollIntoView({ behavior: reduce ? 'auto':'smooth' });
      flash(document.getElementById('yachtForm'));
    }, 120);
  };
  window.addJetSki = function(){
    showView('yacht');
    setTimeout(function(){
      document.getElementById('y-jetski').checked = true;
      document.getElementById('bookform').scrollIntoView({ behavior: reduce ? 'auto':'smooth' });
      flash(document.getElementById('yachtForm'));
    }, 120);
  };
  function flash(el){ el.style.boxShadow='0 0 0 3px #2FA8E0'; setTimeout(function(){ el.style.boxShadow=''; }, 1100); }

  /* ---------- mobile menu ---------- */
  var menu = document.getElementById('mobileMenu');
  window.toggleMenu = function(){ menu.classList.toggle('hidden'); };
  function closeMenu(){ menu.classList.add('hidden'); }

  /* ---------- nav background on scroll ---------- */
  var nav = document.getElementById('nav');
  function navState(){
    if(window.scrollY > 30){ nav.classList.add('bg-ocean/85','backdrop-blur-lg','shadow-lg','shadow-black/20'); }
    else { nav.classList.remove('bg-ocean/85','backdrop-blur-lg','shadow-lg','shadow-black/20'); }
  }
  window.addEventListener('scroll', navState, {passive:true}); navState();

  /* ---------- WhatsApp builders ---------- */
  function send(msg){
    var url = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(msg);
    window.open(url, '_blank', 'noopener');
    showToast();
  }
  function showToast(){
    var t = document.getElementById('toast'); t.classList.remove('hidden');
    setTimeout(function(){ t.classList.add('hidden'); }, 3200);
  }
  function need(ids){ /* returns true if all filled, else focuses first empty */
    for(var i=0;i<ids.length;i++){ var el=document.getElementById(ids[i]); if(!el.value){ el.focus(); el.reportValidity && el.reportValidity(); return false; } }
    return true;
  }

  /* yacht booking → WhatsApp */
  document.getElementById('yachtForm').addEventListener('submit', function(e){
    e.preventDefault();
    if(!need(['y-type','y-date','y-duration','y-guests','y-name','y-contact'])) return;
    var addon = document.getElementById('y-jetski').checked;
    // PERSISTENCE INTERCEPT — commit to the Booking Vault first; only proceed to WhatsApp if it saved.
    if(!logBooking({ name:val('y-name'), contact:val('y-contact'), date:val('y-date'), assets:'Yacht: '+val('y-type')+(addon?' + Jet ski':''), total:null, type:'Yacht' })){ alert('We could not save your booking to the system — please try again.'); return; }
    var L = [
      '*EVERYTHING ZANZIBAR*',
      '_Yacht & Jet Ski booking request_',
      '━━━━━━━━━━━━━━━',
      '*Experience:* ' + val('y-type'),
      '*Date:* ' + val('y-date'),
      '*Start time:* ' + (val('y-time') || 'Flexible'),
      '*Duration:* ' + val('y-duration'),
      '*Guests:* ' + val('y-guests')
    ];
    if(addon) L.push('*Add-on:* Jet ski package');
    L.push('━━━━━━━━━━━━━━━', '*Name:* ' + val('y-name'), '*Contact:* ' + val('y-contact'), '', '_Please confirm availability & payment._');
    send(L.join('\n'));
  });

  /* transfer coordinator → WhatsApp */
  document.getElementById('transferForm').addEventListener('submit', function(e){
    e.preventDefault();
    if(!need(['t-pickup','t-date','t-time','t-flight','t-drop','t-name','t-contact'])) return;
    var tRental = val('t-rental');
    if(!logBooking({ name:val('t-name'), contact:val('t-contact'), date:val('t-date'), assets:'Transfer: '+val('t-pickup')+' → '+val('t-drop')+(tRental?'  +  Rental: '+tRental:''), total:null, type:'Transfer' })){ alert('We could not save your booking to the system — please try again.'); return; }
    var L = [
      '*EVERYTHING ZANZIBAR*',
      '_Airport / ferry transfer request_',
      '━━━━━━━━━━━━━━━',
      '*Pickup:* ' + val('t-pickup'),
      '*Arrival date:* ' + val('t-date'),
      '*Arrival time:* ' + val('t-time'),
      '*Flight / ferry:* ' + val('t-flight'),
      '*Drop-off:* ' + val('t-drop') + (tRental ? '\n*Self-drive rental:* ' + tRental : ''),
      '*Transport throughout stay:* ' + (document.getElementById('t-throughout').checked ? 'Yes' : 'No'),
      '*Departure drop-off:* ' + (document.getElementById('t-departure').checked ? 'Yes' : 'No'),
      '━━━━━━━━━━━━━━━',
      '*Name:* ' + val('t-name'),
      '*Contact:* ' + val('t-contact'),
      '', '_Please confirm my driver & timing._'
    ];
    send(L.join('\n'));
  });

  /* hotel inquiry → WhatsApp */
  window.inquireHotel = function(name){
    if(!logBooking({ name:'(hotel enquiry)', contact:'', date:'', assets:'Hotel: '+name, total:null, type:'Hotel' })){ alert('We could not save your enquiry — please try again.'); return; }
    var L = [
      '*EVERYTHING ZANZIBAR*',
      '_Partner hotel enquiry_',
      '━━━━━━━━━━━━━━━',
      '*Hotel:* ' + name,
      '',
      'Hi! I’d love details, availability and your partner rate for this stay. My rough dates and party size are:',
      '• Dates: ',
      '• Guests: '
    ];
    send(L.join('\n'));
  };

  function val(id){ return (document.getElementById(id).value || '').trim(); }

  /* ---------- scroll reveal ---------- */
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(en){ if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { threshold:0.14 });
  function refreshReveal(){ document.querySelectorAll('.reveal:not(.in)').forEach(function(el){ io.observe(el); }); }
  refreshReveal();
})();
