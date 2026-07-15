
(function(){
  "use strict";
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.getElementById('year').textContent = new Date().getFullYear();

  /* ---------- Journal: LIVE from the dashboard CMS (decoupled from hardcoded templates) ---------- */
  var DEFAULT_POSTS = [
    { title:'Spice Coast Festival 2026 — the first names are in', cat:'Events', date:'2026-06-20', img:'festival.jpg.jpg', excerpt:"Two beach stages, a Taarab orchestra and a b2b sunset set you'll be talking about for years. Early-bird tickets are live, and they won't last." },
    { title:'Introducing sunset yacht sailings to Mnemba', cat:'Experiences', date:'2026-06-14', img:'yacht.jpg.jpg', excerpt:'A private vessel, a curated crowd and the clearest water on the island. Our newest sailing now runs every Saturday at golden hour.' },
    { title:'7 hidden beaches the crowds always miss', cat:'Guides', date:'2026-06-08', img:'https://commons.wikimedia.org/wiki/Special:FilePath/Beach_at_Matemwe.jpg?width=900', excerpt:'Past the resorts and the day-trip buses, these are the shorelines locals keep for themselves. Tide times included.' },
    { title:'Now booking: airport transfers & full-stay transport', cat:'Updates', date:'2026-06-02', img:'https://commons.wikimedia.org/wiki/Special:FilePath/Approaching_Zanzibar.jpg?width=900', excerpt:'Met at arrivals, driven everywhere, dropped at departure. Your whole ground journey, handled by one team.' },
    { title:"A night at Forodhani: Stone Town's street-food market", cat:'Food', date:'2026-05-26', img:'https://commons.wikimedia.org/wiki/Special:FilePath/Forodhani_park_food_stand.jpg?width=900', excerpt:'Urojo, Zanzibar pizza and sugar-cane juice under the stars. What to order, and what to skip.' },
    { title:'Meet the red colobus: a morning in Jozani forest', cat:'Nature', date:'2026-05-18', img:'https://commons.wikimedia.org/wiki/Special:FilePath/Zanzibar_Red_Colobus_at_Jozani_Chwaka_Bay_National_Park%2C_Kusini_DC%2C_South_Zanzibar%2C_Tanzania.jpg?width=900', excerpt:'The rare monkey found nowhere else on earth — and how to see it the responsible way.' }
  ];
  var WARM = { Events:1, Food:1 }, bkPosts = null;
  function escp(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function fmtDate(d){ try{ var x=new Date(d); return isNaN(x)?(d||''):x.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}); }catch(e){ return d||''; } }
  function journalPosts(){ if(bkPosts && bkPosts.length) return bkPosts; try{ var s=JSON.parse(localStorage.getItem('ez_blog')||'null'); if(s && s.length) return s; }catch(e){} return DEFAULT_POSTS; }
  function renderJournal(){
    var grid=document.getElementById('postGrid'); if(!grid) return;
    grid.innerHTML = journalPosts().map(function(p,i){
      var warm = WARM[p.cat] ? ' warm' : '';
      return '<article class="post'+(i===0?' featured':'')+' reveal in">'
        + '<div class="post-img" style="background-image:url(\''+escp(p.img||'')+'\')"></div>'
        + '<div class="post-body"><div class="post-meta"><span class="cat'+warm+'">'+escp(p.cat)+'</span> <span>'+escp(fmtDate(p.date))+'</span></div>'
        + '<h3>'+escp(p.title)+'</h3><p>'+escp(p.excerpt)+'</p>'
        + '<span class="post-more">Read article →</span></div></article>';
    }).join('');
  }
  renderJournal();
  // LIVE CMS sync — re-render instantly when a Media/Admin user publishes or edits in the dashboard (another tab)
  window.addEventListener('storage', function(e){ if(e.key==='ez_blog') renderJournal(); });
  // backend mode — pull articles straight from the database for all visitors
  if(window.EZ && window.EZ_READY){ EZ.posts.list().then(function(rows){ if(rows && rows.length){ bkPosts=rows.map(function(p){return {title:p.title,cat:p.category,date:p.published,img:p.image_url,excerpt:p.excerpt};}); renderJournal(); } }).catch(function(e){ console.error(e); }); }
  var nav = document.getElementById('nav');
  window.addEventListener('scroll', function(){ nav.classList.toggle('scrolled', window.scrollY > 40); }, {passive:true});
  document.getElementById('burger').addEventListener('click', function(){ document.body.classList.toggle('menu-open'); });
  document.querySelectorAll('#navLinks a').forEach(function(a){ a.addEventListener('click', function(){ document.body.classList.remove('menu-open'); }); });
  var io = new IntersectionObserver(function(entries){ entries.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } }); }, {threshold:0.12});
  document.querySelectorAll('.reveal').forEach(function(el){ io.observe(el); });
  var fine = window.matchMedia('(pointer:fine)').matches;
  if(fine && !reduce){
    document.body.classList.add('has-cursor');
    var dot = document.getElementById('cursorDot'), ring = document.getElementById('cursorRing');
    var mx = innerWidth/2, my = innerHeight/2, rx = mx, ry = my;
    window.addEventListener('mousemove', function(ev){ mx = ev.clientX; my = ev.clientY; dot.style.transform = 'translate(' + mx + 'px,' + my + 'px) translate(-50%,-50%)'; });
    (function loop(){ rx += (mx-rx)*0.16; ry += (my-ry)*0.16; ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px) translate(-50%,-50%)'; requestAnimationFrame(loop); })();
    document.addEventListener('mouseover', function(e){ if(e.target.closest('a,button,[data-cursor],.post')) ring.classList.add('grow'); });
    document.addEventListener('mouseout', function(e){ if(e.target.closest('a,button,[data-cursor],.post')) ring.classList.remove('grow'); });
  }
})();
