
/* ============================================================================
   EVERYTHING ZANZIBAR — OPERATIONS CONSOLE
   Vanilla store mirrors a React context/reducer: get()/set() = useState+persist.
   Persisted localStorage keys: ez_role, ez_bookings, ez_events, ez_activities,
   ez_hotels, ez_transit, ez_media, ez_blog. (Production: swap store fns for API.)
   ============================================================================ */
(function(){
  "use strict";
  var $=function(s,r){return (r||document).querySelector(s);};
  var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));};
  function get(k,d){ try{ var v=JSON.parse(localStorage.getItem(k)); return v==null?d:v; }catch(e){ return d; } }
  function set(k,v){ localStorage.setItem(k,JSON.stringify(v)); if(!window._ezHydrating && /^ez_(bookings|events|activities|hotels|yachts|transit|blog)$/.test(k)) window._ezSkipHydrate=true; }
  function toast(m){ var t=$('#toast'); $('#toastMsg').textContent=m; t.classList.remove('hidden'); clearTimeout(t._t); t._t=setTimeout(function(){t.classList.add('hidden');},2300); }
  function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }

  /* ===== backend bridge — active ONLY when backend/ez-api.js holds real Supabase keys.
     Until then BACKEND=false and everything runs on the localStorage mock (unchanged). ===== */
  var BACKEND = !!(window.EZ && window.EZ_READY);
  async function hydrate(sec){
    if(!BACKEND) return;
    if(window._ezSkipHydrate){ window._ezSkipHydrate=false; return; }   // a local write just happened — keep the optimistic UI, don't clobber it with a stale re-fetch
    window._ezHydrating=true;
    try{
      if(sec==='bookings'||sec==='overview') set('ez_bookings',(await EZ.bookings.list()).map(function(r){return {id:r.id,name:r.name,contact:r.contact,date:r.travel_date,assets:r.assets,total:r.total,type:r.type,status:r.status,createdAt:+new Date(r.created_at)};}));
      if(sec==='events'||sec==='overview') set('ez_events',(await EZ.events.list()).map(function(e){return {id:e.id,name:e.name,loc:e.location,date:e.starts_at,price:e.price_tiers,flyer:e.flyer_url,desc:e.description};}));
      if(sec==='hotels') set('ez_hotels',(await EZ.hotels.list()).map(function(h){return {id:h.id,name:h.name,area:h.area,image:h.image_url,highlights:h.highlights};}));
      if(sec==='transit'){ var t=await EZ.transit.get(); set('ez_transit',{intro:t.intro,throughout:t.throughout,departure:t.departure}); }
      if(sec==='journal') set('ez_blog',(await EZ.posts.list()).map(function(p){return {id:p.id,title:p.title,cat:p.category,date:p.published,img:p.image_url,excerpt:p.excerpt,body:p.body};}));
      if(sec==='activities') window._bkActs=(await EZ.activities.list()).map(function(a){return {name:a.name,cat:a.category,location:a.location,duration:a.duration,visualPrompt:a.visual_prompt,image:a.image_url,prices:{single:a.price_single,double:a.price_double,triple:a.price_triple,group:a.price_group}};});
      if(sec==='yachts') set('ez_yachts',(await EZ.yachts.list()).map(function(y){return {id:y.id,name:y.name,cap:y.capacity,from:y.price_label,image:y.image_url,desc:y.description,amenities:y.amenities};}));
    }catch(e){ console.error(e); toast('Could not load from backend — see console.'); }
    finally{ window._ezHydrating=false; }
  }
  function fileURL(file,cb){ var r=new FileReader(); r.onload=function(){cb(r.result);}; r.readAsDataURL(file); }
  // ---- Unified upload + Google Drive helpers (shared by Journal, Events, Media) ----
  // Turn a Google Drive share/file link into a direct-view URL (large-file friendly).
  function normalizeDriveUrl(url){ if(!url) return url; url=String(url).trim(); if(!/drive\.google\.com|docs\.google\.com/.test(url)) return url; var m=url.match(/\/file\/d\/([^\/?]+)/)||url.match(/[?&]id=([^&]+)/)||url.match(/\/d\/([^\/?]+)/); return m?('https://drive.google.com/uc?export=view&id='+m[1]):url; }
  function isVideo(url){ return /\.(mp4|webm|mov|m4v|ogg)(\?|$)/i.test(url||'') || /drive\.google\.com.*(export=download|\/preview)/.test(url||''); }
  function showPrev(prevId,url){ var p=$('#'+prevId); if(!p) return; if(url){ p.style.backgroundImage='url('+JSON.stringify(url)+')'; p.classList.remove('hidden'); } else { p.style.backgroundImage=''; p.classList.add('hidden'); } }
  // Wire an image-URL input + an Upload button (file→storage/base64) + Drive-link normalisation + live preview.
  function wireImg(btnId,inputId,prevId,slot){
    var inp=$('#'+inputId), btn=$('#'+btnId); if(!inp) return;
    function sync(){ inp.value=normalizeDriveUrl(inp.value); showPrev(prevId, inp.value); }
    inp.addEventListener('change',sync); inp.addEventListener('blur',sync);
    if(btn) btn.addEventListener('click',function(){ var i=document.createElement('input'); i.type='file'; i.accept='image/*'; i.onchange=function(){ var f=i.files[0]; if(!f) return; if(BACKEND){ EZ.media.upload(f,slot).then(function(u){ inp.value=u; showPrev(prevId,u); toast('Uploaded to storage.'); }).catch(function(e){console.error(e); toast('Backend write failed — '+(e.message||e));}); } else fileURL(f,function(u){ inp.value=u; showPrev(prevId,u); toast('Image attached.'); }); }; i.click(); });
  }
  $$('[data-x]').forEach(function(b){ b.addEventListener('click',function(){ b.closest('.modal').classList.remove('open'); }); });
  $$('.modal').forEach(function(m){ m.addEventListener('click',function(e){ if(e.target===m) m.classList.remove('open'); }); });

  /* ---------- RBAC ---------- */
  // Role usernames + TEMPORARY default passwords. First login with a default forces a reset.
  var ROLES = { admin:'admin', manager:'manager', media:'media' };
  var DEFAULT_PW = { admin:'ZanzAdmin2026!', manager:'ZanzManager2026!', media:'ZanzMedia2026!' };
  function creds(){ var c=get('ez_creds',null); if(!c){ c={}; Object.keys(DEFAULT_PW).forEach(function(u){ c[u]={pass:DEFAULT_PW[u],mustReset:true}; }); set('ez_creds',c); } return c; }
  var pendingUser=null;
  var SECTIONS = [
    {id:'overview',  label:'Overview',                  roles:['admin']},
    {id:'bookings',  label:'Booking & Payments Vault',  roles:['admin']},
    {id:'events',    label:'Event Registry',            roles:['admin','manager']},
    {id:'activities',label:'Activities & Tours',        roles:['admin','manager']},
    {id:'hotels',    label:'Partner Hotels',            roles:['admin','manager']},
    {id:'yachts',    label:'The Fleet Experience',      roles:['admin','manager']},
    {id:'transit',   label:'Ground Transit',            roles:['admin','manager']},
    {id:'media',     label:'Media & Logos',             roles:['admin','media']},
    {id:'journal',   label:'Journal & News',            roles:['admin','media']},
    {id:'users',     label:'Users & Settings',          roles:['admin']}
  ];
  var role = get('ez_role','admin'), section=null;
  function can(sec){ var s=SECTIONS.filter(function(x){return x.id===sec;})[0]; return s && s.roles.indexOf(role)>-1; }
  function allowed(){ return SECTIONS.filter(function(s){ return s.roles.indexOf(role)>-1; }); }

  function showApp(on){ $('#loginView').style.display=on?'none':'flex'; $('#appView').classList.toggle('hidden',!on); if(on) boot(); }
  function grantAccess(u){ role=ROLES[u]||'admin'; set('ez_role',role); $('#roleBadge').textContent=u+' · '+role; sessionStorage.setItem('ez_auth','1'); showApp(true); }
  $('#loginForm').addEventListener('submit',function(e){ e.preventDefault();
    var u=$('#lg-user').value.trim().toLowerCase(), p=$('#lg-pass').value; $('#lg-err').textContent='';
    if(BACKEND){
      EZ.auth.signIn(u,p).then(function(r){ if(r){ role=r; set('ez_role',role); $('#roleBadge').textContent=u+' · '+role; sessionStorage.setItem('ez_auth','1'); showApp(true); } else $('#lg-err').textContent='No staff role assigned to this account.'; })
        .catch(function(){ $('#lg-err').textContent='Incorrect email or password.'; });
      return;
    }
    var c=creds(), acc=c[u];
    if(!acc || acc.pass!==p){ $('#lg-err').textContent='Incorrect username or password.'; return; }
    if(acc.mustReset){ pendingUser=u; $('#rs-err').textContent=''; $('#rs-p1').value=''; $('#rs-p2').value=''; $('#mReset').classList.add('open'); setTimeout(function(){ $('#rs-p1').focus(); },50); return; }
    grantAccess(u);
  });
  /* enforced first-login password reset */
  $('#rs-save').addEventListener('click',function(){
    var a=$('#rs-p1').value, b=$('#rs-p2').value, e=$('#rs-err');
    if(!a || a.length<8){ e.textContent='Use at least 8 characters.'; return; }
    if(!/[A-Z]/.test(a) || !/[0-9]/.test(a)){ e.textContent='Include at least one capital letter and one number.'; return; }
    if(a!==b){ e.textContent='Passwords do not match.'; return; }
    if(pendingUser && a===DEFAULT_PW[pendingUser]){ e.textContent='Choose a password different from the temporary default.'; return; }
    var c=creds(); c[pendingUser].pass=a; c[pendingUser].mustReset=false; set('ez_creds',c);
    $('#mReset').classList.remove('open'); grantAccess(pendingUser); toast('Password updated — welcome aboard.');
  });
  $('#logoutBtn').addEventListener('click',function(){ sessionStorage.removeItem('ez_auth'); if(BACKEND){ try{ EZ.auth.signOut(); }catch(e){} } showApp(false); });
  $$('.roleBtn').forEach(function(b){ b.addEventListener('click',function(){ role=b.getAttribute('data-role'); set('ez_role',role); $('#roleBadge').textContent='simulating · '+role; renderRole(); }); });

  function renderRole(){
    $$('.roleBtn').forEach(function(b){ var on=b.getAttribute('data-role')===role; b.className='roleBtn px-3 py-1 rounded-full transition '+(on?'bg-azure text-ocean font-medium':'text-white/70 hover:text-white'); });
    var sb=$('#sidebar'); sb.innerHTML='';
    allowed().forEach(function(s){
      var a=document.createElement('a'); a.className='whitespace-nowrap px-3.5 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition flex items-center gap-2 '+(s.id===section?'bg-azure/15 text-white border border-azure/35':'text-white/65 hover:bg-white/5 hover:text-white');
      a.textContent=s.label; a.onclick=function(){ go(s.id); }; sb.appendChild(a);
    });
    if(!can(section)) section = allowed()[0] ? allowed()[0].id : null;
    paint();
  }
  function go(id){ section=id; renderRole(); }

  /* ============================ SEED ============================ */
  // Demo dataset — version-gated so it (re)loads comprehensive screenshot-ready
  // sample data once. Skipped entirely when a real backend is connected.
  var DEMO_V = 'ez-demo-2026-06-26c';
  var FP = 'https://commons.wikimedia.org/wiki/Special:FilePath/';
  function seed(){
    if(BACKEND) return;                          // live DB is the source of truth
    if(get('ez_demo_v','') === DEMO_V) return;   // this demo set already loaded
    var d = Date.now();
    set('ez_bookings',[
      {id:'EZ-7F3A91', name:'Amara Okello',    contact:'+255 712 110 234', date:'2026-07-18', assets:'Yacht — Luxury Catamaran + Jet ski add-on', total:980, type:'Yacht',    status:'Paid & Locked', createdAt:d-86400000*6},
      {id:'EZ-2B8C04', name:'Lukas Meyer',     contact:'lukas.meyer@mail.com', date:'2026-07-22', assets:'Activity — Mnemba Island Dolphin Discovery (x2)', total:120, type:'Activity', status:'Pending WhatsApp Escrow Verification', createdAt:d-86400000*5},
      {id:'EZ-9D5E27', name:'Priya Nair',      contact:'+255 778 552 119', date:'2026-08-02', assets:'Transfer — Airport → Paje Lagoon Villas', total:60, type:'Transfer', status:'Paid & Locked', createdAt:d-86400000*5},
      {id:'EZ-4A1F66', name:'Sofia Rossi',     contact:'sofia.r@mail.com', date:'2026-08-09', assets:'Activity — Safari Blue (Private)', total:450, type:'Activity', status:'Paid & Locked', createdAt:d-86400000*4},
      {id:'EZ-6C2D18', name:'James Carter',    contact:'+44 7700 900123', date:'2026-08-11', assets:'Hotel — Matemwe Boutique Lodge (5 nights)', total:null, type:'Hotel', status:'Pending WhatsApp Escrow Verification', createdAt:d-86400000*4},
      {id:'EZ-8E7B52', name:'Fatma Said',      contact:'+255 715 884 002', date:'2026-08-15', assets:'Activity — Stone Town Tour (x4)', total:80, type:'Activity', status:'Paid & Locked', createdAt:d-86400000*3},
      {id:'EZ-3B9A07', name:'Daniel Kim',      contact:'dan.kim@mail.com', date:'2026-08-18', assets:'Yacht — Sunset Cruiser (traditional dhow)', total:480, type:'Yacht', status:'Cancelled', createdAt:d-86400000*3},
      {id:'EZ-1F4E83', name:'Aisha Mohammed',  contact:'+255 762 220 781', date:'2026-08-21', assets:'Activity — Spice Tour + Cooking Class (x2)', total:80, type:'Activity', status:'Paid & Locked', createdAt:d-86400000*2},
      {id:'EZ-5D8C39', name:'Noah Williams',   contact:'+1 415 555 0199', date:'2026-08-25', assets:'Transfer — Ferry Terminal → Nungwi Beach Resort', total:55, type:'Transfer', status:'Pending WhatsApp Escrow Verification', createdAt:d-86400000},
      {id:'EZ-0A6B14', name:'Lena Hoffmann',   contact:'lena.h@mail.com', date:'2026-09-01', assets:'Activity — Sky Diving + Drone Video', total:500, type:'Activity', status:'Pending WhatsApp Escrow Verification', createdAt:d-3600000*3}
    ]);
    set('ez_events',[
      {id:'ev1', name:'Spice Coast Festival',            loc:'Kendwa',     date:'2026-08-14T16:00', price:'Early Bird $45 · GA $70 · VIP Cabana $640', flyer:'festival.jpg.jpg', desc:'Two beach stages, a Taarab orchestra and Afrobeats & house headliners on Kendwa beach.'},
      {id:'ev2', name:'Sauti za Busara',                 loc:'Stone Town', date:'2027-02-12T18:00', price:'Day pass $40 · Festival pass $140', flyer:'', desc:'East Africa’s landmark live-music festival at the Old Fort, Stone Town.'},
      {id:'ev3', name:'Kendwa Rocks Full Moon',          loc:'Kendwa',     date:'2026-07-29T21:00', price:'Entry $15', flyer:'', desc:'The island’s legendary monthly full-moon beach party.'},
      {id:'ev4', name:'Forodhani Night Market Sessions', loc:'Stone Town', date:'2026-08-03T19:00', price:'Free entry', flyer:'', desc:'Live Taarab & street-food nights at Forodhani Gardens on the waterfront.'},
      {id:'ev5', name:'Paje Kite & Beats',               loc:'Paje',       date:'2026-09-06T15:00', price:'GA $25 · Sundowner $60', flyer:'', desc:'Kite-beach day party with house DJs as the trade winds drop at sunset.'}
    ]);
    set('ez_hotels',[
      {name:'Nungwi Beach Resort',    area:'Nungwi · North coast',      image:FP+'Paradise_at_Nungwi%2C_Kaskazini_A%2C_Unguja_North%2C_Zanzibar.jpg?width=700', highlights:['Beachfront','Infinity pool','All-inclusive']},
      {name:'Matemwe Boutique Lodge', area:'Matemwe · North-east',       image:FP+'Beach_at_Matemwe.jpg?width=700', highlights:['Reef access','Spa','Adults-friendly']},
      {name:'Stone Town Palace Hotel',area:'Stone Town · UNESCO quarter',image:FP+'Old_Fort_of_Zanzibar.jpg?width=700', highlights:['Boutique','Rooftop bar','Heritage']},
      {name:'Paje Lagoon Villas',     area:'Paje · East coast',          image:FP+'PAJE%2C_Zanzibar.jpg?width=700', highlights:['Lagoon','Kitesurf','Private villa']},
      {name:'Kendwa Dreams Retreat',  area:'Kendwa · North-west',        image:FP+'Sunset_with_palm_trees_%2830737629082%29.jpg?width=700', highlights:['Sunset beach','Beach club','Swim-up bar']},
      {name:'Mnemba Atoll Lodge',     area:'Mnemba · Private atoll',     image:FP+'Zanzibar-Mnemba-Island-aerial-view_%282%29-Website-1920x1080-fill-gravity%3Dauto-Q_Auto%3DBest.jpg?width=700', highlights:['Private island','World-class diving','Barefoot luxury']}
    ]);
    set('ez_yachts',[
      {id:'y1', name:'Luxury Catamaran', cap:'Up to 12 guests', from:'from $850 / day', image:FP+'Approaching_Zanzibar.jpg?width=900', desc:'Twin-hull stability and a wide shade deck — the all-day island cruiser.', amenities:['Twin hulls & shade deck','Snorkel gear & paddleboards','Captain, crew & chef','Sound system & cooler bar']},
      {id:'y2', name:'Luxury Motor Yacht', cap:'Up to 8 guests', from:'from $1,200 / day', image:FP+'Zanzibar-Mnemba-Island-aerial-view_%282%29-Website-1920x1080-fill-gravity%3Dauto-Q_Auto%3DBest.jpg?width=900', desc:'Air-conditioned speed to Mnemba and back before lunch.', amenities:['Air-con cabin & sun pads','Pro skipper & deckhand','Premium bar & catering','Dive to Mnemba on request']},
      {id:'y3', name:'Sunset Cruiser (traditional dhow)', cap:'Up to 20 guests', from:'from $480 / cruise', image:FP+'Sunset_with_palm_trees_%2830737629082%29.jpg?width=900', desc:'A hand-built Zanzibari dhow timed to golden hour.', amenities:['Hand-built Zanzibari dhow','Golden-hour timing','Champagne & canapés','Live acoustic Taarab option']}
    ]);
    set('ez_blog',[
      {id:'b1', title:'Spice Coast Festival 2026 — first names confirmed', cat:'Events', date:'2026-06-20', img:'festival.jpg.jpg', excerpt:'Two beach stages, a Taarab orchestra and a surprise b2b sunset set.', body:''},
      {id:'b2', title:'Introducing sunset yacht sailings to Mnemba', cat:'Experiences', date:'2026-06-14', img:'yacht.jpg.jpg', excerpt:'A private vessel and the clearest water on the island, every Saturday.', body:''},
      {id:'b3', title:'7 hidden beaches the crowds always miss', cat:'Guides', date:'2026-06-08', img:'', excerpt:'Past the resorts and the day-trip buses — the shorelines locals keep quiet.', body:''}
    ]);
    set('ez_demo_v', DEMO_V);
  }
  seed();

  /* ============================ PANELS ============================ */
  async function paint(){
    if(BACKEND) await hydrate(section);
    var p=$('#panels'), d=$('#denied');
    if(!section || !can(section)){ d.classList.remove('hidden'); p.innerHTML=''; return; }
    d.classList.add('hidden');
    ({overview:pOverview,bookings:pBookings,events:pEvents,activities:pActs,hotels:pHotels,yachts:pYachts,transit:pTransit,media:pMedia,journal:pJournal,users:pUsers}[section]||function(){})();
  }
  function head(title,sub,actions){ return '<div class="flex items-end justify-between flex-wrap gap-3 mb-5"><div><h2 class="font-serif text-2xl">'+title+'</h2><p class="text-white/55 text-sm mt-0.5 font-light">'+sub+'</p></div><div class="flex gap-2 flex-wrap">'+(actions||'')+'</div></div>'; }

  /* ---------- OVERVIEW (admin: revenue) ---------- */
  function pOverview(){
    var b=get('ez_bookings',[]);
    var rev=b.filter(function(x){return x.status==='Paid & Locked';}).reduce(function(s,x){return s+(typeof x.total==='number'?x.total:0);},0);
    var pend=b.filter(function(x){return x.status.indexOf('Pending')===0;}).length;
    var ev=get('ez_events',[]).length;
    function card(l,v,c){ return '<div class="glass rounded-2xl p-5"><div class="text-white/50 text-xs uppercase tracking-wider">'+l+'</div><div class="font-serif text-3xl mt-1 '+(c||'')+'">'+v+'</div></div>'; }
    $('#panels').innerHTML=head('Overview','Live operational snapshot — admin only.')+
      '<div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">'+
      card('Confirmed revenue','$'+rev.toLocaleString(),'text-emerald')+
      card('Bookings logged',b.length,'text-azure')+
      card('Pending escrow',pend,'text-sunset')+
      card('Events tracked',ev,'text-gold')+'</div>'+
      '<div class="glass rounded-2xl p-5 mt-4 text-sm text-white/70 leading-relaxed">Revenue counts only bookings marked <b class="text-emerald">Paid &amp; Locked</b> in the Vault. Manager and Media roles never see this panel.</div>';
  }

  /* ---------- BOOKING & PAYMENTS VAULT ---------- */
  var STATUSES=['Pending WhatsApp Escrow Verification','Paid & Locked','Cancelled'];
  function pBookings(){
    $('#panels').innerHTML=head('Visitor Booking &amp; Payments Vault','Every frontend enquiry is shadow-logged here before the WhatsApp handoff.',
      '<button id="bkExport" class="px-3 py-1.5 rounded-full border border-white/15 text-sm hover:bg-white/10">Export CSV</button>')+
      '<div class="flex flex-wrap gap-2 mb-3"><input id="bkSearch" class="fld max-w-xs" placeholder="Search traveller name…"><input id="bkDate" type="date" class="fld max-w-[180px]"><button id="bkClear" class="px-3 py-1.5 rounded-full border border-white/15 text-sm">Clear</button><span id="bkCount" class="text-white/50 text-sm self-center"></span></div>'+
      '<div class="glass rounded-2xl overflow-x-auto"><table class="w-full text-sm"><thead><tr class="text-azure text-[.66rem] uppercase tracking-wider">'+
      ['Res ID','Traveller','Contact','Travel date','Assets ledger','Total','Payment status',''].map(function(h){return '<th class="text-left p-3 font-medium">'+h+'</th>';}).join('')+
      '</tr></thead><tbody id="bkBody"></tbody></table></div>';
    function render(){
      var q=($('#bkSearch').value||'').toLowerCase(), dt=$('#bkDate').value;
      var rows=get('ez_bookings',[]).slice().sort(function(a,b){return b.createdAt-a.createdAt;}).filter(function(r){
        return (!q||(r.name||'').toLowerCase().indexOf(q)>-1) && (!dt||r.date===dt);
      });
      $('#bkCount').textContent=rows.length+' record'+(rows.length===1?'':'s');
      $('#bkBody').innerHTML=rows.map(function(r){
        var col=r.status.indexOf('Paid')===0?'text-emerald':r.status.indexOf('Cancel')===0?'text-danger':'text-sunset';
        return '<tr class="border-t border-white/8 hover:bg-white/3">'+
          '<td class="p-3 font-mono text-azure">'+esc(r.id)+'</td><td class="p-3">'+esc(r.name||'—')+'</td><td class="p-3 text-white/70">'+esc(r.contact||'—')+'</td>'+
          '<td class="p-3">'+esc(r.date||'—')+'</td><td class="p-3 max-w-[240px]">'+esc(r.assets||'—')+'</td>'+
          '<td class="p-3 font-serif">'+(typeof r.total==='number'?'$'+r.total:'<span class="text-white/40">Quote</span>')+'</td>'+
          '<td class="p-3"><select data-st="'+esc(r.id)+'" class="fld text-xs py-1 '+col+'">'+STATUSES.map(function(s){return '<option'+(s===r.status?' selected':'')+'>'+s+'</option>';}).join('')+'</select></td>'+
          '<td class="p-3 text-right"><button data-bkdel="'+esc(r.id)+'" class="text-danger/80 hover:text-danger text-xs">Delete</button></td></tr>';
      }).join('')||'<tr><td colspan="8" class="p-8 text-center text-white/45">No bookings logged yet — submit a form on the live site to populate the Vault.</td></tr>';
      $$('[data-st]').forEach(function(s){ s.addEventListener('change',function(){ var all=get('ez_bookings',[]); var r=all.filter(function(x){return x.id===s.getAttribute('data-st');})[0]; if(r){ r.status=s.value; set('ez_bookings',all); if(BACKEND) EZ.bookings.setStatus(r.id,s.value).catch(function(e){console.error(e); toast('Backend write failed — '+(e.message||e));}); render(); toast('Payment status updated.'); } }); });
      $$('[data-bkdel]').forEach(function(b){ b.addEventListener('click',function(){ if(!confirm('Delete this booking record?'))return; if(BACKEND) EZ.bookings.remove(b.getAttribute('data-bkdel')).catch(function(e){console.error(e); toast('Backend write failed — '+(e.message||e));}); set('ez_bookings',get('ez_bookings',[]).filter(function(x){return x.id!==b.getAttribute('data-bkdel');})); render(); toast('Record deleted.'); }); });
    }
    $('#bkSearch').oninput=render; $('#bkDate').onchange=render; $('#bkClear').onclick=function(){ $('#bkSearch').value=''; $('#bkDate').value=''; render(); };
    $('#bkExport').onclick=function(){ var rows=get('ez_bookings',[]); var csv='ResID,Name,Contact,Date,Assets,Total,Status\n'+rows.map(function(r){return [r.id,r.name,r.contact,r.date,'"'+(r.assets||'')+'"',r.total,r.status].join(',');}).join('\n'); var a=document.createElement('a'); a.href='data:text/csv;charset=utf-8,'+encodeURIComponent(csv); a.download='ez-bookings.csv'; a.click(); };
    render();
  }

  /* ---------- EVENT REGISTRY ---------- */
  var evEdit=null;
  function pEvents(){
    $('#panels').innerHTML=head('Global Zanzibar Event Registry','Catalogue festivals, beach parties & cultural nights for fast travel-planning lookups.',
      '<button id="evAdd" class="px-3 py-1.5 rounded-full bg-azure text-ocean text-sm font-medium">+ Add event</button>')+
      '<input id="evSearch" class="fld max-w-sm mb-4" placeholder="Search by location or date (e.g. Kendwa, 2026-08)…">'+
      '<div id="evGrid" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"></div>';
    function render(){
      var q=($('#evSearch').value||'').toLowerCase();
      var list=get('ez_events',[]).filter(function(e){ return !q||((e.loc+' '+e.date+' '+e.name).toLowerCase().indexOf(q)>-1); })
        .sort(function(a,b){return (a.date||'').localeCompare(b.date||'');});
      $('#evGrid').innerHTML=list.map(function(e){
        var when=e.date?new Date(e.date).toLocaleString([], {dateStyle:'medium',timeStyle:'short'}):'TBA';
        return '<article class="glass rounded-2xl overflow-hidden flex flex-col">'+
          '<div class="h-32 bg-ocean2 bg-cover bg-center" style="background-image:linear-gradient(180deg,rgba(10,37,64,.1),rgba(10,37,64,.55)),url('+JSON.stringify(e.flyer||'')+')"></div>'+
          '<div class="p-4 flex flex-col flex-1"><div class="flex items-center gap-2 text-xs text-white/55"><span class="px-2 py-0.5 rounded-full bg-azure/15 text-azure">'+esc(e.loc)+'</span><span>'+esc(when)+'</span></div>'+
          '<h3 class="font-serif text-lg mt-2">'+esc(e.name)+'</h3><p class="text-white/65 text-sm mt-1 flex-1 font-light">'+esc(e.desc)+'</p>'+
          '<div class="text-gold text-sm mt-2">'+esc(e.price||'')+'</div>'+
          '<button data-eved="'+e.id+'" class="mt-3 w-full py-2 rounded-full border border-white/15 text-sm hover:bg-white/10">Edit</button></div></article>';
      }).join('')||'<p class="text-white/45 col-span-full py-8 text-center">No events match.</p>';
      $$('[data-eved]').forEach(function(b){ b.addEventListener('click',function(){ openEvent(b.getAttribute('data-eved')); }); });
    }
    $('#evSearch').oninput=render; $('#evAdd').onclick=function(){ openEvent(null); }; render();
  }
  function openEvent(id){
    var e=id?get('ez_events',[]).filter(function(x){return x.id===id;})[0]:{id:null,name:'',loc:'',date:'',price:'',flyer:'',desc:''};
    evEdit=Object.assign({},e); $('#me-title').textContent=id?'Edit event':'Add event';
    $('#me-name').value=e.name||''; $('#me-loc').value=e.loc||''; $('#me-date').value=(e.date||'').slice(0,16); $('#me-price').value=e.price||''; $('#me-desc').value=e.desc||'';
    $('#me-drop').innerHTML=e.flyer?'<img src="'+e.flyer+'" class="w-full h-full object-cover">':'<span>Drop or click to upload flyer</span>';
    $('#me-flyer-url').value=(e.flyer && e.flyer.indexOf('data:')!==0)?e.flyer:'';
    $('#me-del').style.display=id?'inline-flex':'none';
    $('#mEvent').classList.add('open');
  }
  (function wireEventDrop(){
    var d=$('#me-drop');
    function setFlyer(u){ evEdit.flyer=u; d.innerHTML='<img src="'+u+'" class="w-full h-full object-cover">'; }
    function take(f){ if(!f||f.type.indexOf('image')!==0) return; if(BACKEND){ EZ.media.upload(f,'event-flyer').then(function(u){ setFlyer(u); toast('Uploaded to storage.'); }).catch(function(e){console.error(e); toast('Backend write failed — '+(e.message||e));}); } else fileURL(f,setFlyer); }
    d.addEventListener('click',function(){ var i=document.createElement('input'); i.type='file'; i.accept='image/*'; i.onchange=function(){take(i.files[0]);}; i.click(); });
    ['dragover','dragenter'].forEach(function(ev){ d.addEventListener(ev,function(e){e.preventDefault();d.classList.add('border-azure');}); });
    ['dragleave','drop'].forEach(function(ev){ d.addEventListener(ev,function(e){e.preventDefault();d.classList.remove('border-azure');}); });
    d.addEventListener('drop',function(e){ take(e.dataTransfer.files[0]); });
    var fu=$('#me-flyer-url'); if(fu) fu.addEventListener('change',function(){ var u=normalizeDriveUrl(fu.value.trim()); if(u){ fu.value=u; setFlyer(u); } });
  })();
  $('#me-save').addEventListener('click',function(){
    evEdit.name=$('#me-name').value.trim(); evEdit.loc=$('#me-loc').value.trim(); evEdit.date=$('#me-date').value; evEdit.price=$('#me-price').value.trim(); evEdit.desc=$('#me-desc').value.trim();
    if(!evEdit.name){ toast('Event name required.'); return; }
    var all=get('ez_events',[]);
    if(evEdit.id){ all=all.map(function(x){return x.id===evEdit.id?evEdit:x;}); } else { evEdit.id='ev'+Date.now(); all.push(evEdit); }
    if(BACKEND) EZ.events.upsert(Object.assign({},evEdit,{id:(evEdit.id&&/-/.test(evEdit.id))?evEdit.id:undefined})).catch(function(e){console.error(e); toast('Backend write failed — '+(e.message||e));});
    set('ez_events',all); $('#mEvent').classList.remove('open'); paint(); toast('Event saved.');
  });
  $('#me-del').addEventListener('click',function(){ if(evEdit.id&&confirm('Delete this event?')){ if(BACKEND) EZ.events.remove(evEdit.id).catch(function(e){console.error(e); toast('Backend write failed — '+(e.message||e));}); set('ez_events',get('ez_events',[]).filter(function(x){return x.id!==evEdit.id;})); $('#mEvent').classList.remove('open'); paint(); toast('Event deleted.'); } });

  /* ---------- ACTIVITIES (CRUD) ---------- */
  var DEFAULTS=[
   {cat:"Culture, Heritage & Wildlife",name:"Baraka Aquarium",location:"Nungwi",duration:"2 Hours",prices:{single:20,double:20,triple:20,group:15},visualPrompt:"Lagoon cave with green sea turtles."},
   {cat:"Culture, Heritage & Wildlife",name:"Cheetah's Rock Great Wildlife Tour",location:"Chuini",duration:"4 Hours",prices:{single:160,double:160,triple:160,group:160},visualPrompt:"Sanctuary with cheetahs and white lions."},
   {cat:"Culture, Heritage & Wildlife",name:"Cheetah's Rock VIP Otter Experience",location:"Chuini",duration:"2 Hours",prices:{single:150,double:150,triple:150,group:150},visualPrompt:"Private pool with playful otters."},
   {cat:"Culture, Heritage & Wildlife",name:"Cheetah's Rock VIP Otter + Great Wildlife Tour",location:"Chuini",duration:"6 Hours",prices:{single:280,double:280,triple:280,group:280},visualPrompt:"Full sanctuary day experience."},
   {cat:"Culture, Heritage & Wildlife",name:"Jozani Forest Tour",location:"Jozani",duration:"2 Hours",prices:{single:30,double:25,triple:25,group:20},visualPrompt:"Red Colobus monkeys in mahogany jungle."},
   {cat:"Culture, Heritage & Wildlife",name:"Spice Tour",location:"Kijichi (Kizimbani)",duration:"2 Hours",prices:{single:30,double:25,triple:20,group:15},visualPrompt:"Vanilla, cinnamon and clove spice farm."},
   {cat:"Culture, Heritage & Wildlife",name:"Spice Tour + Cooking Class",location:"Kijichi (Kizimbani)",duration:"4 Hours",prices:{single:45,double:40,triple:35,group:30},visualPrompt:"Tropical kitchen cooking class."},
   {cat:"Culture, Heritage & Wildlife",name:"Stone Town Tour",location:"Stone Town",duration:"2 Hours",prices:{single:30,double:25,triple:20,group:20},visualPrompt:"Carved doors and coral-stone alleys."},
   {cat:"Culture, Heritage & Wildlife",name:"Swahili Culinary Workshop",location:"Kijichi (Kizimbani)",duration:"3 Hours",prices:{single:40,double:35,triple:30,group:25},visualPrompt:"Swahili masterclass with clay pots."},
   {cat:"Culture, Heritage & Wildlife",name:"The Prison Island Changuu",location:"Stone Town / Off-Coast",duration:"3 Hours",prices:{single:80,double:70,triple:60,group:50},visualPrompt:"Giant Aldabra tortoises by stone ruins."},
   {cat:"Ocean Sandbanks & Marine Safaris",name:"Blue Lagoon Star Fish Snorkelling",location:"Pongwe",duration:"3 Hours",prices:{single:70,double:60,triple:50,group:40},visualPrompt:"Lagoon with red starfish."},
   {cat:"Ocean Sandbanks & Marine Safaris",name:"Mnemba Island Dolphin Discovery",location:"Matemwe / Mnemba Atoll",duration:"4 Hours",prices:{single:70,double:60,triple:50,group:40},visualPrompt:"Wild dolphins at Mnemba reef."},
   {cat:"Ocean Sandbanks & Marine Safaris",name:"Nakupenda Sandbank",location:"Stone Town / Off-Coast",duration:"4 Hours",prices:{single:80,double:60,triple:50,group:40},visualPrompt:"White sandbank in turquoise water."},
   {cat:"Ocean Sandbanks & Marine Safaris",name:"Safari Blue (Private)",location:"Fumba / Menai Bay",duration:"6 Hours",prices:{single:450,double:250,triple:200,group:150},visualPrompt:"Private dhow with lobster lunch."},
   {cat:"Ocean Sandbanks & Marine Safaris",name:"Safari Blue (Sharing)",location:"Fumba / Menai Bay",duration:"6 Hours",prices:{single:60,double:60,triple:60,group:50},visualPrompt:"Eco boat cruise through lagoons."},
   {cat:"Ocean Sandbanks & Marine Safaris",name:"Sunset Cruise (Private)",location:"Stone Town",duration:"2 Hours",prices:{single:250,double:200,triple:150,group:120},visualPrompt:"Private dhow into ocean sunset."},
   {cat:"Ocean Sandbanks & Marine Safaris",name:"Sunset Cruise (Sharing)",location:"Stone Town",duration:"2 Hours",prices:{single:40,double:30,triple:30,group:30},visualPrompt:"Twilight boat party at golden hour."},
   {cat:"Mystical Caves & Horse Riding Adventures",name:"East Coast Horse Riding",location:"Michamvi",duration:"30 Mins",prices:{single:70,double:70,triple:70,group:70},visualPrompt:"Horses in shallow ocean at Michamvi."},
   {cat:"Mystical Caves & Horse Riding Adventures",name:"Maalum Natural Cave",location:"Paje",duration:"2 Hours",prices:{single:20,double:20,triple:20,group:20},visualPrompt:"Emerald limestone pool cave."},
   {cat:"Mystical Caves & Horse Riding Adventures",name:"North Coast Beach Horse Riding",location:"Nungwi",duration:"30 Mins",prices:{single:70,double:70,triple:70,group:70},visualPrompt:"Beach horseback ride on Nungwi sand."},
   {cat:"Mystical Caves & Horse Riding Adventures",name:"Salaam Cave",location:"Kizimkazi",duration:"2 Hours",prices:{single:20,double:20,triple:20,group:20},visualPrompt:"Underground water cave in jungle."},
   {cat:"Adrenaline & Active Water Sports",name:"Jetski Rental",location:"Stone Town",duration:"30 Mins",prices:{single:50,double:40,triple:40,group:40},visualPrompt:"Jet ski over turquoise water."},
   {cat:"Adrenaline & Active Water Sports",name:"Kayak Rentals",location:"Flexible / Island Wide",duration:"20 Mins",prices:{single:30,double:50,triple:30,group:null},visualPrompt:"Clear kayak over coral reefs."},
   {cat:"Adrenaline & Active Water Sports",name:"Kite Surfing",location:"Flexible / Paje Beach",duration:"Per Hour",prices:{single:70,double:70,triple:70,group:70},visualPrompt:"Kite surfer over Paje lagoon."},
   {cat:"Adrenaline & Active Water Sports",name:"Parasailing Experience",location:"Flexible / Northern Coast",duration:"10 Mins",prices:{single:120,double:140,triple:null,group:null},visualPrompt:"Parasail above blue reefs."},
   {cat:"Adrenaline & Active Water Sports",name:"Scuba Diver Course (3 Days)",location:"Flexible / Marine Parks",duration:"3 Days",prices:{single:430,double:430,triple:430,group:430},visualPrompt:"Scuba training in resort pool."},
   {cat:"Adrenaline & Active Water Sports",name:"Scuba Diver PADI Open Water Course",location:"Flexible / Open Ocean",duration:"4 Days",prices:{single:600,double:600,triple:600,group:600},visualPrompt:"Divers exploring coral walls."},
   {cat:"Adrenaline & Active Water Sports",name:"Scuba Diving Beginner (2 Dives)",location:"Flexible / Shallow Reefs",duration:"3 Hours",prices:{single:120,double:120,triple:120,group:120},visualPrompt:"First dive with sea turtles."},
   {cat:"Adrenaline & Active Water Sports",name:"Sky Diving",location:"Nungwi Dropzone",duration:"3 Hours",prices:{single:450,double:450,triple:450,group:450},visualPrompt:"Tandem skydive over coastline."},
   {cat:"Adrenaline & Active Water Sports",name:"Sport Fishing (4 Hours)",location:"Flexible / Deep Sea",duration:"4 Hours",prices:{single:500,double:250,triple:200,group:150},visualPrompt:"Deep-sea sportfishing yacht."},
   {cat:"Adrenaline & Active Water Sports",name:"Sport Fishing (7 Hours Deep Sea)",location:"Flexible / Deep Sea",duration:"7 Hours",prices:{single:600,double:400,triple:250,group:200},visualPrompt:"Big-game marlin fishing."},
   {cat:"Adrenaline & Active Water Sports",name:"Zanzibar Quadbike Adventure",location:"Kiwengwa / Jambiani",duration:"3 Hours",prices:{single:150,double:140,triple:130,group:130},visualPrompt:"Quad bikes through palm groves."},
   {cat:"Media Production & Add-ons",name:"Drone Photography & Video",location:"Flexible / Customer Request",duration:"Flexible",prices:{single:50,double:100,triple:null,group:null},visualPrompt:"Drone over a clear beach."},
   {cat:"Getting Around Stone Town",name:"Rent a Car (Stone Town)",location:"Stone Town",duration:"Per Day",prices:{single:45,double:45,triple:45,group:40},visualPrompt:"Rental car on a Stone Town street."},
   {cat:"Getting Around Stone Town",name:"Scooter & Tuk-Tuk Hire (Stone Town)",location:"Stone Town",duration:"Per Day",prices:{single:25,double:25,triple:25,group:20},visualPrompt:"Tuk-tuk and scooter by Forodhani."}
  ];
  function actOv(){ return get('ez_activities',{}); }
  function actMerged(){
    if(BACKEND && window._bkActs) return window._bkActs;
    var ov=actOv(); var list=DEFAULTS.map(function(d){ var o=ov[d.name]||{}; return Object.assign({},d,o); });
    Object.keys(ov).forEach(function(n){ if(!DEFAULTS.some(function(d){return d.name===n;})&&!ov[n]._deleted) list.push(Object.assign({name:n},ov[n])); });
    return list.filter(function(x){ return !(ov[x.name]&&ov[x.name]._deleted); });
  }
  function fp(p){ if(!p)return null; var v=[p.single,p.double,p.triple,p.group].filter(function(x){return typeof x==='number';}); return v.length?Math.min.apply(null,v):null; }
  var maOrig=null;
  function pActs(){
    $('#panels').innerHTML=head('Activities &amp; Tours','Full catalogue, sorted by type then A–Z. Edits reflect on the live site instantly.',
      '<button id="acAdd" class="px-3 py-1.5 rounded-full bg-azure text-ocean text-sm font-medium">+ Add tour</button><button id="acExport" class="px-3 py-1.5 rounded-full border border-white/15 text-sm">Export JSON</button>')+
      '<div class="flex flex-wrap gap-2 mb-3"><input id="acSearch" class="fld max-w-xs" placeholder="Search tours or locations…"><select id="acFilter" class="fld max-w-[220px]"></select><span id="acCount" class="text-white/50 text-sm self-center"></span></div>'+
      '<div class="glass rounded-2xl overflow-x-auto"><table class="w-full text-sm"><thead><tr class="text-azure text-[.66rem] uppercase tracking-wider">'+['Tour','Location','Duration','From','Actions'].map(function(h){return '<th class="text-left p-3 font-medium'+(h==='Actions'?' text-right':'')+'">'+h+'</th>';}).join('')+'</tr></thead><tbody id="acBody"></tbody></table></div>';
    var cats={}; actMerged().forEach(function(a){cats[a.cat]=1;}); var clist=Object.keys(cats).sort();
    $('#acFilter').innerHTML='<option value="">All types</option>'+clist.map(function(c){return '<option>'+esc(c)+'</option>';}).join('');
    $('#catList').innerHTML=clist.map(function(c){return '<option value="'+esc(c)+'">';}).join('');
    function render(){
      var q=($('#acSearch').value||'').toLowerCase(), f=$('#acFilter').value;
      var rows=actMerged().filter(function(a){return (!f||a.cat===f)&&(!q||(a.name+' '+a.location+' '+a.cat).toLowerCase().indexOf(q)>-1);})
        .sort(function(a,b){return a.cat<b.cat?-1:a.cat>b.cat?1:(a.name<b.name?-1:1);});
      $('#acCount').textContent=rows.length+' tours'; var html='',last='',ov=actOv();
      rows.forEach(function(a){ if(a.cat!==last){ html+='<tr><td colspan="5" class="p-2.5 px-3 bg-white/4 font-serif text-gold">'+esc(a.cat)+'</td></tr>'; last=a.cat; }
        var pr=fp(a.prices);
        html+='<tr class="border-t border-white/8 hover:bg-white/3"><td class="p-3">'+esc(a.name)+(ov[a.name]?' <span class="text-sunset text-[.6rem] border border-sunset/40 rounded-full px-1.5">edited</span>':'')+'</td><td class="p-3 text-white/70">'+esc(a.location)+'</td><td class="p-3">'+esc(a.duration)+'</td><td class="p-3 font-serif">'+(pr===null?'—':'$'+pr)+'</td><td class="p-3 text-right whitespace-nowrap"><button data-aced="'+encodeURIComponent(a.name)+'" class="text-azure hover:underline text-xs mr-2">Edit</button><button data-acdel="'+encodeURIComponent(a.name)+'" class="text-danger/80 hover:text-danger text-xs">Delete</button></td></tr>';
      });
      $('#acBody').innerHTML=html||'<tr><td colspan="5" class="p-8 text-center text-white/45">No tours match.</td></tr>';
      $$('[data-aced]').forEach(function(b){ b.addEventListener('click',function(){ openAct(decodeURIComponent(b.getAttribute('data-aced'))); }); });
      $$('[data-acdel]').forEach(function(b){ b.addEventListener('click',function(){ var n=decodeURIComponent(b.getAttribute('data-acdel')); if(!confirm('Remove "'+n+'"?'))return; var ov=actOv(); ov[n]=Object.assign({},ov[n],{_deleted:true}); set('ez_activities',ov); if(BACKEND) EZ.activities.remove(n).catch(function(e){console.error(e); toast('Backend write failed — '+(e.message||e));}); render(); toast('Tour removed.'); }); });
    }
    $('#acSearch').oninput=render; $('#acFilter').onchange=render;
    $('#acAdd').onclick=function(){ openAct(''); };
    $('#acExport').onclick=function(){ var a=document.createElement('a'); a.href='data:application/json,'+encodeURIComponent(JSON.stringify(actMerged(),null,2)); a.download='ez-activities.json'; a.click(); };
    render(); pActs._render=render;
  }
  function openAct(name){
    var a=actMerged().filter(function(x){return x.name===name;})[0]||{name:'',cat:'',location:'',duration:'',visualPrompt:'',prices:{}};
    maOrig=name; $('#ma-title').textContent=name?'Edit tour':'Add tour';
    $('#ma-name').value=a.name||''; $('#ma-cat').value=a.cat||''; $('#ma-loc').value=a.location||''; $('#ma-dur').value=a.duration||''; $('#ma-vis').value=a.image||a.visualPrompt||'';
    var p=a.prices||{}; $('#ma-p1').value=p.single==null?'':p.single; $('#ma-p2').value=p.double==null?'':p.double; $('#ma-p3').value=p.triple==null?'':p.triple; $('#ma-p4').value=p.group==null?'':p.group;
    $('#mActivity').classList.add('open');
  }
  function numOrNull(v){ v=(v||'').trim(); return v===''?null:Number(v); }
  $('#ma-save').addEventListener('click',function(){
    var name=$('#ma-name').value.trim(); if(!name){ toast('Tour name required.'); return; }
    var vis=$('#ma-vis').value.trim(), rec={ cat:$('#ma-cat').value.trim()||'Other', location:$('#ma-loc').value.trim(), duration:$('#ma-dur').value.trim(),
      prices:{single:numOrNull($('#ma-p1').value),double:numOrNull($('#ma-p2').value),triple:numOrNull($('#ma-p3').value),group:numOrNull($('#ma-p4').value)} };
    if(/^(https?:|data:|\.|\/|[\w-]+\.(jpg|jpeg|png|webp))/i.test(vis)) rec.image=vis; else rec.visualPrompt=vis;
    var ov=actOv(); if(maOrig&&maOrig!==name) ov[maOrig]={_deleted:true}; ov[name]=Object.assign({},ov[name],rec); delete ov[name]._deleted;
    if(BACKEND) EZ.activities.upsert({name:name,category:rec.cat,location:rec.location,duration:rec.duration,visualPrompt:rec.visualPrompt,image:rec.image,prices:rec.prices}).catch(function(e){console.error(e); toast('Backend write failed — '+(e.message||e));});
    set('ez_activities',ov); $('#mActivity').classList.remove('open'); paint(); toast('Saved — live site updated.');
  });

  /* ---------- HOTELS ---------- */
  var HOTEL_DEF=[{name:'Nungwi Beach Resort',area:'Nungwi · North coast',image:'',highlights:['Beachfront','Infinity pool','All-inclusive']},{name:'Matemwe Boutique Lodge',area:'Matemwe · North-east',image:'',highlights:['Reef access','Spa','Adults-friendly']},{name:'Stone Town Palace Hotel',area:'Stone Town · UNESCO quarter',image:'',highlights:['Boutique','Rooftop bar','Heritage']},{name:'Paje Lagoon Villas',area:'Paje · East coast',image:'',highlights:['Lagoon','Kitesurf','Private villa']}];
  function hotels(){ return get('ez_hotels',null)||HOTEL_DEF.slice(); }
  var hIdx=-1;
  function pHotels(){
    $('#panels').innerHTML=head('The Zanzibar Staylist','Partner hotels — image, location and three highlights.','<button id="hoAdd" class="px-3 py-1.5 rounded-full bg-azure text-ocean text-sm font-medium">+ Add hotel</button>')+'<div id="hoGrid" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"></div>';
    function render(){ var hs=hotels(); $('#hoGrid').innerHTML=hs.map(function(h,i){ return '<article class="glass rounded-2xl overflow-hidden flex flex-col"><div class="h-28 bg-ocean2 bg-cover bg-center" style="background-image:url(\''+esc(h.image||'')+'\')"></div><div class="p-4"><h3 class="font-serif text-lg">'+esc(h.name)+'</h3><div class="text-white/55 text-xs">'+esc(h.area)+'</div><div class="flex flex-wrap gap-1.5 mt-2">'+(h.highlights||[]).map(function(t){return '<span class="text-[.66rem] px-2 py-0.5 rounded-full bg-azure/12 text-azure">'+esc(t)+'</span>';}).join('')+'</div><button data-hed="'+i+'" class="mt-3 w-full py-2 rounded-full border border-white/15 text-sm hover:bg-white/10">Edit</button></div></article>'; }).join(''); $$('[data-hed]').forEach(function(b){b.addEventListener('click',function(){openHotel(+b.getAttribute('data-hed'));});}); }
    $('#hoAdd').onclick=function(){ openHotel(-1); }; render(); pHotels._render=render;
  }
  function openHotel(i){ hIdx=i; var h=i>=0?hotels()[i]:{name:'',area:'',image:'',highlights:['','','']}; $('#mh-title').textContent=i>=0?'Edit hotel':'Add hotel'; $('#mh-name').value=h.name||''; $('#mh-area').value=h.area||''; $('#mh-img').value=h.image||''; $('#mh-h1').value=(h.highlights||[])[0]||''; $('#mh-h2').value=(h.highlights||[])[1]||''; $('#mh-h3').value=(h.highlights||[])[2]||''; $('#mh-del').style.display=i>=0?'inline-flex':'none'; $('#mHotel').classList.add('open'); }
  $('#mh-save').addEventListener('click',function(){ var rec={name:$('#mh-name').value.trim(),area:$('#mh-area').value.trim(),image:$('#mh-img').value.trim(),highlights:[$('#mh-h1').value.trim(),$('#mh-h2').value.trim(),$('#mh-h3').value.trim()].filter(Boolean)}; if(!rec.name){toast('Name required.');return;} var hs=hotels(); if(hIdx>=0){ rec.id=hs[hIdx]&&hs[hIdx].id; hs[hIdx]=rec; } else hs.push(rec); set('ez_hotels',hs); if(BACKEND) EZ.hotels.upsert(rec).catch(function(e){console.error(e); toast('Backend write failed — '+(e.message||e));}); $('#mHotel').classList.remove('open'); paint(); toast('Hotel saved.'); });
  $('#mh-del').addEventListener('click',function(){ if(hIdx>=0&&confirm('Delete hotel?')){ var hs=hotels(); if(BACKEND&&hs[hIdx]&&hs[hIdx].id) EZ.hotels.remove(hs[hIdx].id).catch(function(e){console.error(e); toast('Backend write failed — '+(e.message||e));}); hs.splice(hIdx,1); set('ez_hotels',hs); $('#mHotel').classList.remove('open'); paint(); toast('Deleted.'); } });

  /* ---------- YACHTS / THE FLEET EXPERIENCE (admin + manager) ---------- */
  var YACHT_DEF=[
    {id:'y1', name:'Luxury Catamaran', cap:'Up to 12 guests', from:'from $850 / day', image:'', desc:'', amenities:['Twin hulls & shade deck','Snorkel gear & paddleboards','Captain, crew & chef','Sound system & cooler bar']},
    {id:'y2', name:'Luxury Motor Yacht', cap:'Up to 8 guests', from:'from $1,200 / day', image:'', desc:'', amenities:['Air-con cabin & sun pads','Pro skipper & deckhand','Premium bar & catering','Dive to Mnemba on request']},
    {id:'y3', name:'Sunset Cruiser (traditional dhow)', cap:'Up to 20 guests', from:'from $480 / cruise', image:'', desc:'', amenities:['Hand-built Zanzibari dhow','Golden-hour timing','Champagne & canapés']}
  ];
  function yachts(){ return get('ez_yachts',null)||YACHT_DEF.slice(); }
  var yIdx=-1;
  function pYachts(){
    $('#panels').innerHTML=head('The Fleet Experience','Yachts &amp; cruisers shown live on the booking storefront — title, capacity, price, image and features.','<button id="yaAdd" class="px-3 py-1.5 rounded-full bg-azure text-ocean text-sm font-medium">+ Add yacht</button>')+'<div id="yaGrid" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"></div>';
    function render(){ var ys=yachts(); $('#yaGrid').innerHTML=ys.map(function(y,i){ return '<article class="glass rounded-2xl overflow-hidden flex flex-col"><div class="h-28 bg-ocean2 bg-cover bg-center" style="background-image:url(\''+esc(y.image||'')+'\')"></div><div class="p-4"><h3 class="font-serif text-lg">'+esc(y.name)+'</h3><div class="text-white/55 text-xs">'+esc(y.cap||'')+(y.from?' · '+esc(y.from):'')+'</div><div class="flex flex-wrap gap-1.5 mt-2">'+(y.amenities||[]).slice(0,3).map(function(t){return '<span class="text-[.66rem] px-2 py-0.5 rounded-full bg-azure/12 text-azure">'+esc(t)+'</span>';}).join('')+'</div><button data-yed="'+i+'" class="mt-3 w-full py-2 rounded-full border border-white/15 text-sm hover:bg-white/10">Edit</button></div></article>'; }).join(''); $$('[data-yed]').forEach(function(b){b.addEventListener('click',function(){openYacht(+b.getAttribute('data-yed'));});}); }
    $('#yaAdd').onclick=function(){ openYacht(-1); }; render(); pYachts._render=render;
  }
  function openYacht(i){ yIdx=i; var y=i>=0?yachts()[i]:{name:'',cap:'',from:'',image:'',desc:'',amenities:['','','','']}; var a=y.amenities||[]; $('#my-title').textContent=i>=0?'Edit yacht':'Add yacht'; $('#my-name').value=y.name||''; $('#my-cap').value=y.cap||''; $('#my-from').value=y.from||''; $('#my-img').value=y.image||''; $('#my-desc').value=y.desc||''; $('#my-a1').value=a[0]||''; $('#my-a2').value=a[1]||''; $('#my-a3').value=a[2]||''; $('#my-a4').value=a[3]||''; $('#my-del').style.display=i>=0?'inline-flex':'none'; $('#mYacht').classList.add('open'); }
  $('#my-save').addEventListener('click',function(){ var rec={name:$('#my-name').value.trim(),cap:$('#my-cap').value.trim(),from:$('#my-from').value.trim(),image:$('#my-img').value.trim(),desc:$('#my-desc').value.trim(),amenities:[$('#my-a1').value.trim(),$('#my-a2').value.trim(),$('#my-a3').value.trim(),$('#my-a4').value.trim()].filter(Boolean)}; if(!rec.name){toast('Title required.');return;} var ys=yachts(); if(yIdx>=0){ rec.id=ys[yIdx]&&ys[yIdx].id; ys[yIdx]=rec; } else { rec.id='y'+Date.now(); ys.push(rec); } set('ez_yachts',ys); if(BACKEND) EZ.yachts.upsert(rec).catch(function(e){console.error(e); toast('Backend write failed — '+(e.message||e));}); $('#mYacht').classList.remove('open'); paint(); toast('Yacht saved — live on the storefront.'); });
  $('#my-del').addEventListener('click',function(){ if(yIdx>=0&&confirm('Delete yacht?')){ var ys=yachts(); if(BACKEND&&ys[yIdx]&&ys[yIdx].id) EZ.yachts.remove(ys[yIdx].id).catch(function(e){console.error(e); toast('Backend write failed — '+(e.message||e));}); ys.splice(yIdx,1); set('ez_yachts',ys); $('#mYacht').classList.remove('open'); paint(); toast('Deleted.'); } });

  /* ---------- TRANSIT ---------- */
  var T_DEF={intro:'Met at arrivals, driven everywhere, dropped at departure. Total peace of mind from landing to take-off.',throughout:'Optional transport throughout your stay — beaches, Stone Town, dinners, on call.',departure:'Guaranteed final departure drop-off, timed to your flight or ferry.'};
  function pTransit(){ var t=get('ez_transit',null)||Object.assign({},T_DEF); var F=[['intro','Arrival & coverage intro'],['throughout','Transport throughout stay'],['departure','Departure drop-off']];
    $('#panels').innerHTML=head('Ground Transit Rules','Edit the pickup/drop-off scripts shown to travellers.','')+'<div class="glass rounded-2xl p-5 space-y-4">'+F.map(function(f){return '<div><label class="lab">'+f[1]+'</label><textarea class="fld" rows="2" data-tk="'+f[0]+'">'+esc(t[f[0]])+'</textarea></div>';}).join('')+'<button id="trSave" class="px-4 py-2 rounded-full bg-azure text-ocean text-sm font-medium">Save transit text</button></div>';
    $('#trSave').onclick=function(){ var o={}; $$('[data-tk]').forEach(function(x){o[x.getAttribute('data-tk')]=x.value.trim();}); set('ez_transit',o); if(BACKEND) EZ.transit.save(o).catch(function(e){console.error(e); toast('Backend write failed — '+(e.message||e));}); toast('Transit text saved.'); };
  }

  /* ---------- MEDIA ---------- */
  var SLOTS=[{id:'logo-badge',name:'Logo — badge',file:'1.jpg'},{id:'logo-navy',name:'Logo — stacked navy',file:'2.jpg'},{id:'logo-light',name:'Logo — stacked light',file:'3.jpg'},{id:'festival',name:'Event Horizon — festival',file:'festival.jpg.jpg'},{id:'yacht',name:'Event Horizon — yacht',file:'yacht.jpg.jpg'},{id:'founder',name:'Founder portrait',file:'founder-1.jpg'}];
  function pMedia(){
    var media=get('ez_media',{});
    $('#panels').innerHTML=head('Media &amp; Logo Assets','Drag-and-drop or browse to replace logos and hero graphics.','')+
      '<div class="glass rounded-2xl p-5 mb-6">'+
        '<div class="flex items-center justify-between flex-wrap gap-3 mb-3"><div><h3 class="font-serif text-lg">Media Library</h3><div class="text-white/50 text-xs max-w-md">Upload pictures &amp; videos, or link large files via Google Drive. Copy a URL to drop into any Journal post, event flyer or listing.</div></div><button id="mlUp" class="px-3 py-1.5 rounded-full bg-azure text-ocean text-sm font-medium whitespace-nowrap">+ Upload picture / video</button></div>'+
        '<div class="flex gap-2 mb-4"><input id="mlUrl" class="fld flex-1" placeholder="Paste an image / video URL or Google Drive share link"><button id="mlAddUrl" class="px-4 rounded-lg bg-azure/15 text-azure text-sm whitespace-nowrap">Link asset</button></div>'+
        '<div id="mlGrid" class="grid grid-cols-2 md:grid-cols-4 gap-3"></div>'+
      '</div>'+
      '<div class="glass rounded-2xl p-4 text-sm text-white/70 mb-4">Fixed brand slots — uploads preview instantly. To publish locally, <b>Download</b> and drop into the site folder under the listed filename; with Supabase connected they upload to storage.</div>'+
      '<div id="mdGrid" class="grid grid-cols-2 md:grid-cols-3 gap-4"></div>';
    function render(){ media=get('ez_media',{}); $('#mdGrid').innerHTML=SLOTS.map(function(s){ var cur=media[s.id]||s.file; return '<div class="glass rounded-2xl p-3"><div class="font-medium text-sm">'+s.name+'</div><div class="text-white/40 text-xs mb-2">'+s.file+'</div><div class="drop border border-dashed border-white/20 rounded-xl aspect-[16/10] overflow-hidden bg-black/20 cursor-pointer" data-slot="'+s.id+'"><img src="'+esc(cur)+'" onerror="this.style.display=\'none\'" class="w-full h-full object-cover"></div><div class="flex gap-2 mt-2"><button data-browse="'+s.id+'" class="px-3 py-1 rounded-full border border-white/15 text-xs">Browse</button>'+(media[s.id]?'<button data-dl="'+s.id+'" data-f="'+s.file+'" class="px-3 py-1 rounded-full bg-gold text-ocean text-xs">Download</button>':'')+'</div></div>'; }).join('');
      SLOTS.forEach(function(s){ var d=$('[data-slot="'+s.id+'"]'); if(!d)return; function take(f){ if(f&&f.type.indexOf('image')===0) fileURL(f,function(u){ media[s.id]=u; set('ez_media',media); render(); toast('Image updated.'); }); } d.onclick=function(){ pick(s.id); }; ['dragover','dragenter'].forEach(function(ev){d.addEventListener(ev,function(e){e.preventDefault();d.classList.add('border-azure');});}); ['dragleave','drop'].forEach(function(ev){d.addEventListener(ev,function(e){e.preventDefault();d.classList.remove('border-azure');});}); d.addEventListener('drop',function(e){take(e.dataTransfer.files[0]);}); });
      $$('[data-browse]').forEach(function(b){ b.onclick=function(){ pick(b.getAttribute('data-browse')); }; });
      $$('[data-dl]').forEach(function(b){ b.onclick=function(){ var a=document.createElement('a'); a.href=media[b.getAttribute('data-dl')]; a.download=b.getAttribute('data-f'); a.click(); }; });
    }
    function pick(id){ var i=document.createElement('input'); i.type='file'; i.accept='image/*'; i.onchange=function(){ var f=i.files[0]; if(!f)return; if(BACKEND){ EZ.media.upload(f,id).then(function(url){ media[id]=url; set('ez_media',media); render(); toast('Uploaded to storage.'); }).catch(function(e){console.error(e); toast('Backend write failed — '+(e.message||e));}); } else fileURL(f,function(u){ media[id]=u; set('ez_media',media); render(); toast('Image updated.'); }); }; i.click(); }
    /* ---- unified Media Library: pictures + videos + Google Drive links (copyable URLs) ---- */
    function lib(){ return get('ez_medialib',[]); }
    function renderLib(){
      var items=lib(), g=$('#mlGrid'); if(!g) return;
      g.innerHTML = items.length ? items.map(function(m){
        var thumb = m.kind==='video'
          ? '<video src="'+esc(m.url)+'" class="w-full h-24 object-cover bg-black" muted playsinline></video>'
          : '<div class="w-full h-24 bg-ocean2 bg-cover bg-center" style="background-image:url(\''+esc(m.url)+'\')"></div>';
        return '<div class="glass rounded-xl overflow-hidden">'+thumb+'<div class="p-2"><div class="text-[.66rem] text-white/60 truncate" title="'+esc(m.name||'')+'">'+(m.kind==='video'?'▶ ':'')+esc(m.name||m.kind)+'</div><div class="flex gap-1 mt-1"><button data-mlcopy="'+m.id+'" class="flex-1 px-2 py-1 rounded bg-azure/15 text-azure text-[.66rem]">Copy URL</button><button data-mldel="'+m.id+'" class="px-2 py-1 rounded border border-danger/40 text-danger text-[.66rem]">✕</button></div></div></div>';
      }).join('') : '<p class="text-white/40 text-sm col-span-full py-4 text-center">No media yet — upload a file or link a Google Drive asset.</p>';
      $$('[data-mlcopy]').forEach(function(b){ b.onclick=function(){ var it=lib().filter(function(x){return x.id===b.getAttribute('data-mlcopy');})[0]; if(it){ try{ navigator.clipboard.writeText(it.url); }catch(e){} toast('URL copied — paste it anywhere.'); } }; });
      $$('[data-mldel]').forEach(function(b){ b.onclick=function(){ set('ez_medialib', lib().filter(function(x){return x.id!==b.getAttribute('data-mldel');})); renderLib(); }; });
    }
    function addLib(url,kind,name){ var items=lib(); items.unshift({id:'m'+Date.now(), url:url, kind:kind||(isVideo(url)?'video':'image'), name:name||''}); set('ez_medialib', items); renderLib(); }
    $('#mlUp').onclick=function(){ var i=document.createElement('input'); i.type='file'; i.accept='image/*,video/*'; i.onchange=function(){ var f=i.files[0]; if(!f) return; var kind=f.type.indexOf('video')===0?'video':'image'; if(!BACKEND && f.size>3*1024*1024){ toast('File over 3MB — link it via Google Drive instead.'); return; } if(BACKEND){ EZ.media.upload(f,'lib').then(function(u){ addLib(u,kind,f.name); toast('Uploaded to storage.'); }).catch(function(e){console.error(e); toast('Backend write failed — '+(e.message||e));}); } else fileURL(f,function(u){ addLib(u,kind,f.name); toast('Added to library.'); }); }; i.click(); };
    $('#mlAddUrl').onclick=function(){ var u=normalizeDriveUrl(($('#mlUrl').value||'').trim()); if(!u){ toast('Paste a URL first.'); return; } addLib(u, isVideo(u)?'video':'image', 'Linked asset'); $('#mlUrl').value=''; toast('Linked.'); };
    renderLib();
    render();
  }

  /* ---------- JOURNAL / BLOG ---------- */
  var pEdit=null;
  function pJournal(){
    $('#panels').innerHTML=head('Zanzibar Journal &amp; News','Write and manage news updates &amp; blog posts.','<button id="poAdd" class="px-3 py-1.5 rounded-full bg-azure text-ocean text-sm font-medium">+ New post</button>')+'<div id="poList" class="space-y-3"></div>';
    function render(){ var posts=get('ez_blog',[]); $('#poList').innerHTML=posts.map(function(p){ return '<div class="glass rounded-2xl p-4 flex items-center gap-4"><div class="w-16 h-12 rounded-lg bg-ocean2 bg-cover bg-center shrink-0" style="background-image:url(\''+esc(p.img||'')+'\')"></div><div class="flex-1 min-w-0"><div class="text-xs text-azure">'+esc(p.cat)+' · '+esc(p.date)+'</div><div class="font-serif text-base truncate">'+esc(p.title)+'</div><div class="text-white/55 text-sm truncate">'+esc(p.excerpt)+'</div></div><button data-poed="'+p.id+'" class="px-3 py-1.5 rounded-full border border-white/15 text-sm">Edit</button></div>'; }).join('')||'<p class="text-white/45 py-6 text-center">No posts yet.</p>'; $$('[data-poed]').forEach(function(b){b.addEventListener('click',function(){openPost(b.getAttribute('data-poed'));});}); }
    $('#poAdd').onclick=function(){ openPost(null); }; render(); pJournal._render=render;
  }
  function openPost(id){ var p=id?get('ez_blog',[]).filter(function(x){return x.id===id;})[0]:{id:null,title:'',cat:'',date:'',img:'',excerpt:'',body:''}; pEdit=Object.assign({},p); $('#mp-title').textContent=id?'Edit post':'New journal post'; $('#mp-title-i').value=p.title||''; $('#mp-cat').value=p.cat||''; $('#mp-date').value=p.date||''; $('#mp-img').value=p.img||''; $('#mp-ex').value=p.excerpt||''; $('#mp-body').value=p.body||''; $('#mp-del').style.display=id?'inline-flex':'none'; showPrev('mp-prev', p.img||''); $('#mPost').classList.add('open'); }
  $('#mp-save').addEventListener('click',function(){ pEdit.title=$('#mp-title-i').value.trim(); pEdit.cat=$('#mp-cat').value.trim(); pEdit.date=$('#mp-date').value; pEdit.img=$('#mp-img').value.trim(); pEdit.excerpt=$('#mp-ex').value.trim(); pEdit.body=$('#mp-body').value.trim(); if(!pEdit.title){toast('Title required.');return;} var all=get('ez_blog',[]); if(pEdit.id)all=all.map(function(x){return x.id===pEdit.id?pEdit:x;}); else {pEdit.id='b'+Date.now(); all.unshift(pEdit);} if(BACKEND) EZ.posts.upsert(Object.assign({},pEdit,{id:(pEdit.id&&/-/.test(pEdit.id))?pEdit.id:undefined})).catch(function(e){console.error(e); toast('Backend write failed — '+(e.message||e));}); set('ez_blog',all); $('#mPost').classList.remove('open'); paint(); toast('Post saved.'); });
  $('#mp-del').addEventListener('click',function(){ if(pEdit.id&&confirm('Delete post?')){ if(BACKEND) EZ.posts.remove(pEdit.id).catch(function(e){console.error(e); toast('Backend write failed — '+(e.message||e));}); set('ez_blog',get('ez_blog',[]).filter(function(x){return x.id!==pEdit.id;})); $('#mPost').classList.remove('open'); paint(); toast('Deleted.'); } });
  wireImg('mp-up','mp-img','mp-prev','journal');   // Journal post image: upload / Drive link / preview

  /* ---------- USERS & SETTINGS (admin) ---------- */
  function pUsers(){
    var users=[{u:'admin',role:'admin'},{u:'manager',role:'manager'},{u:'media',role:'media'}];
    $('#panels').innerHTML=head('Users &amp; Settings','Manage staff roles and global site settings — admin only.','')+
      '<div class="glass rounded-2xl overflow-hidden mb-5"><table class="w-full text-sm"><thead><tr class="text-azure text-[.66rem] uppercase tracking-wider"><th class="text-left p-3">User</th><th class="text-left p-3">Role</th><th class="text-left p-3">Permissions</th></tr></thead><tbody>'+
      users.map(function(u){ var perms=u.role==='admin'?'Full access':u.role==='manager'?'Catalogue, hotels, transit, events':'Media + journal only'; return '<tr class="border-t border-white/8"><td class="p-3">'+u.u+'</td><td class="p-3"><span class="px-2 py-0.5 rounded-full bg-azure/15 text-azure text-xs">'+u.role+'</span></td><td class="p-3 text-white/65">'+perms+'</td></tr>'; }).join('')+
      '</tbody></table></div>'+
      '<div class="glass rounded-2xl p-5 max-w-md"><h3 class="font-serif text-lg mb-3">Site settings</h3>'+
      '<label class="lab">WhatsApp concierge number</label><input id="setWa" class="fld mb-3" value="'+esc(get('ez_settings',{wa:'255764317595'}).wa)+'">'+
      '<label class="lab">Instagram handle</label><input id="setIg" class="fld mb-3" value="'+esc(get('ez_settings',{ig:'everythingzanzibar'}).ig||'everythingzanzibar')+'">'+
      '<button id="setSave" class="px-4 py-2 rounded-full bg-azure text-ocean text-sm font-medium">Save settings</button></div>';
    $('#setSave').onclick=function(){ var _s={wa:$('#setWa').value.trim(),ig:$('#setIg').value.trim()}; set('ez_settings',_s); if(BACKEND) EZ.settings.save(_s).catch(function(e){console.error(e); toast('Backend write failed — '+(e.message||e));}); toast('Settings saved.'); };
  }

  /* ---------- boot ---------- */
  function boot(){ renderRole(); }
  if(BACKEND){
    // PRODUCTION: only show the console with a real Supabase session; role comes from the database.
    EZ.auth.session().then(function(s){
      if(!s){ sessionStorage.removeItem('ez_auth'); showApp(false); return; }
      EZ.auth.role().then(function(r){
        if(r){ role=r; set('ez_role',role); $('#roleBadge').textContent=((s.user&&s.user.email)||'staff')+' · '+role; sessionStorage.setItem('ez_auth','1'); showApp(true); }
        else { sessionStorage.removeItem('ez_auth'); showApp(false); $('#lg-err').textContent='No staff role assigned to this account — ask an admin to set your role.'; }
      }).catch(function(){ showApp(false); });
    }).catch(function(){ showApp(false); });
  } else if(sessionStorage.getItem('ez_auth')==='1'){ $('#roleBadge').textContent=role; showApp(true); } else { showApp(false); }
})();
