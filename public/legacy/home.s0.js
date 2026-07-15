
(function(){
  "use strict";
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var WA_NUMBER = '255764317595'; /* +255 764 317 595 */
  var FP = 'https://commons.wikimedia.org/wiki/Special:FilePath/';

  /* ---------- shared region data (real Zanzibar imagery) ---------- */
  var REGIONS = {
    'stone-town':{name:'Stone Town',kicker:'Culture & history',
      desc:"A UNESCO-listed maze of coral-stone alleys, carved doors and spice markets. Freddie Mercury's birthplace, the Forodhani night market, and the beating heart of the island.",
      tags:['Culture','Food','History'], img:FP+'Beit_al_Ajaib%2C_2010.jpg?width=1400'},
    'nungwi':{name:'Nungwi & Kendwa',kicker:'Beaches & nightlife',
      desc:"The north tip — postcard sand that stays swimmable at every tide, sunset dhow cruises, fresh seafood, and the island's best beach nightlife after dark.",
      tags:['Beaches','Sunset','Nightlife'], img:FP+'Nungwi_%282010-011-1318-T%29.jpg?width=1400'},
    'paje':{name:'Paje',kicker:'Kitesurf & vibes',
      desc:"An east-coast lagoon with shallow turquoise water and steady wind — the kitesurfing capital of Zanzibar, plus laid-back beach bars and barefoot cafés.",
      tags:['Kitesurf','Lagoon','Chill'], img:FP+'PAJE%2C_Zanzibar.jpg?width=1400'},
    'jozani':{name:'Jozani Forest',kicker:'Nature & wildlife',
      desc:"The island's last patch of ancient forest — home to the rare Zanzibar red colobus monkey found nowhere else on earth, plus a mangrove boardwalk through the canopy.",
      tags:['Nature','Wildlife','Eco'], img:FP+'Zanzibar_Red_Colobus_at_Jozani_Chwaka_Bay_National_Park%2C_Kusini_DC%2C_South_Zanzibar%2C_Tanzania.jpg?width=1400'},
    'mnemba':{name:'Mnemba Atoll',kicker:'Diving & snorkeling',
      desc:"A private coral atoll off the northeast coast — the clearest water on the island, with turtles, dolphins and Zanzibar's finest diving and snorkeling.",
      tags:['Diving','Reef','Dolphins'], img:FP+'Zanzibar-Mnemba-Island-aerial-view_%282%29-Website-1920x1080-fill-gravity%3Dauto-Q_Auto%3DBest.jpg?width=1400'}
  };
  var ORDER = ['stone-town','nungwi','paje','jozani','mnemba'];

  document.getElementById('year').textContent = new Date().getFullYear();

  /* nav scroll state */
  var nav = document.getElementById('nav');
  window.addEventListener('scroll', function(){ nav.classList.toggle('scrolled', window.scrollY > 40); }, {passive:true});

  /* mobile menu */
  document.getElementById('burger').addEventListener('click', function(){ document.body.classList.toggle('menu-open'); });
  document.querySelectorAll('#navLinks a').forEach(function(a){
    a.addEventListener('click', function(){ document.body.classList.remove('menu-open'); });
  });

  /* ---------- generic modals ---------- */
  function openModal(id){ var m = document.getElementById(id); if(!m) return; m.classList.add('open'); document.body.classList.add('modal-lock'); }
  function closeModal(m){ m.classList.remove('open'); if(!document.querySelector('.modal.open')) document.body.classList.remove('modal-lock'); }
  document.querySelectorAll('[data-open]').forEach(function(b){
    b.addEventListener('click', function(e){ e.preventDefault(); openModal(b.getAttribute('data-open')); });
  });
  document.querySelectorAll('.modal').forEach(function(m){
    m.addEventListener('click', function(e){ if(e.target === m) closeModal(m); });
    m.querySelectorAll('[data-close-modal]').forEach(function(c){ c.addEventListener('click', function(){ closeModal(m); }); });
  });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape'){ document.querySelectorAll('.modal.open').forEach(closeModal); } });

  /* ---------- forms → WhatsApp ---------- */
  function buildWhatsApp(form){
    var intro = form.getAttribute('data-wa') || 'New enquiry';
    var lines = ['*Everything Zanzibar — ' + intro + '*', ''];
    form.querySelectorAll('input, select').forEach(function(field){
      if(field.type === 'checkbox') return;
      var val = (field.value || '').trim();
      if(!val) return;
      var label = field.tagName === 'SELECT' ? (field.getAttribute('aria-label') || 'Choice') : (field.getAttribute('placeholder') || 'Field');
      label = label.replace(/\s*\(optional\)/i, '');
      lines.push(label + ': ' + val);
    });
    var checked = Array.prototype.slice.call(form.querySelectorAll('input[name="interest"]:checked')).map(function(c){ return c.value; });
    if(checked.length) lines.push('Interested in: ' + checked.join(', '));
    return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(lines.join('\n'));
  }
  document.querySelectorAll('[data-success-form]').forEach(function(form){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var url = buildWhatsApp(form);
      var box = form.closest('.modal-box');
      var link = box.querySelector('[data-wa-link]');
      if(link) link.setAttribute('href', url);
      window.open(url, '_blank', 'noopener');
      box.querySelector('[data-modal-form]').style.display = 'none';
      box.querySelector('[data-modal-success]').style.display = 'block';
    });
  });

  /* newsletter → WhatsApp */
  document.getElementById('newsForm').addEventListener('submit', function(e){
    e.preventDefault();
    var email = document.getElementById('newsEmail').value.trim();
    var url = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent('*Everything Zanzibar — The Dispatch signup*\nEmail: ' + email);
    window.open(url, '_blank', 'noopener');
    document.getElementById('newsNote').textContent = "Opening WhatsApp — just hit send to confirm. Karibu!";
    document.getElementById('newsEmail').value = '';
  });

  /* ---------- countdowns ---------- */
  function pad(n){ return (n < 10 ? '0' : '') + n; }
  function startCountdown(targetStr, ids){
    var target = new Date(targetStr).getTime();
    var d = document.getElementById(ids[0]), h = document.getElementById(ids[1]), m = document.getElementById(ids[2]), s = document.getElementById(ids[3]);
    if(!d) return;
    function tick(){
      var diff = target - Date.now(); if(diff < 0) diff = 0;
      d.textContent = pad(Math.floor(diff / 86400000));
      h.textContent = pad(Math.floor((diff % 86400000) / 3600000));
      m.textContent = pad(Math.floor((diff % 3600000) / 60000));
      s.textContent = pad(Math.floor((diff % 60000) / 1000));
    }
    tick(); /* auto-tick removed for a frozen, production-stable UI — computed once at load. Re-enable a 1-second timer to make it live again. */
  }
  startCountdown('2026-09-19T18:00:00', ['cd-days','cd-hours','cd-mins','cd-secs']);
  startCountdown('2026-08-14T16:00:00', ['fcd-days','fcd-hours','fcd-mins','fcd-secs']);

  /* ---------- hero: FROZEN for production — first slide shown statically, auto-rotation removed ----------
     (the auto-rotation timer was removed so the interface is stable for screenshots & live publishing) */

  /* ---------- scroll reveal ---------- */
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  }, {threshold:0.15});
  document.querySelectorAll('.reveal').forEach(function(el){ io.observe(el); });

  /* ---------- count-up stats ---------- */
  function countUp(el){
    var goal = +el.getAttribute('data-count'), dur = 1700, start = null;
    function frame(t){
      if(!start) start = t;
      var p = Math.min((t - start) / dur, 1); p = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(goal * p).toLocaleString();
      if(p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  var statIO = new IntersectionObserver(function(entries){
    entries.forEach(function(e){ if(e.isIntersecting){ countUp(e.target); statIO.unobserve(e.target); } });
  }, {threshold:0.6});
  document.querySelectorAll('[data-count]').forEach(function(el){ statIO.observe(el); });

  /* ---------- island explorer ---------- */
  var list = document.getElementById('regionList');
  ORDER.forEach(function(id, i){
    var r = REGIONS[id];
    var btn = document.createElement('button');
    btn.className = 'region-btn' + (i === 0 ? ' active' : '');
    btn.setAttribute('data-region', id);
    btn.innerHTML = '<span class="num">0' + (i + 1) + '</span><span class="rb-text"><b>' + r.name + '</b><small>' + r.kicker + '</small></span>';
    btn.addEventListener('click', function(){ setRegion(id); });
    list.appendChild(btn);
  });
  var expMedia = document.getElementById('expMedia'), expBody = document.getElementById('expBody'),
      expKicker = document.getElementById('expKicker'), expName = document.getElementById('expName'),
      expDesc = document.getElementById('expDesc'), expTags = document.getElementById('expTags');
  function renderTags(el, tags){ el.innerHTML = tags.map(function(t){ return '<span class="tagchip">' + t + '</span>'; }).join(''); }
  function setRegion(id){
    var r = REGIONS[id];
    document.querySelectorAll('.region-btn').forEach(function(b){ b.classList.toggle('active', b.getAttribute('data-region') === id); });
    expMedia.style.opacity = 0; expBody.style.opacity = 0;
    setTimeout(function(){
      expMedia.style.backgroundImage = "linear-gradient(180deg,rgba(10,37,64,.1),rgba(8,24,44,.9)),url('" + r.img + "')";
      expKicker.textContent = r.kicker; expName.textContent = r.name; expDesc.textContent = r.desc;
      renderTags(expTags, r.tags);
      expMedia.style.opacity = 1; expBody.style.opacity = 1;
    }, reduce ? 0 : 220);
  }
  renderTags(expTags, REGIONS['stone-town'].tags);

  document.getElementById('exploreBtn').addEventListener('click', function(e){
    e.preventDefault();
    var sec = document.getElementById('explore');
    sec.scrollIntoView({behavior: reduce ? 'auto' : 'smooth'});
    sec.classList.add('flash');
    setTimeout(function(){ sec.classList.remove('flash'); }, 1300);
  });

  /* ---------- interactive map ---------- */
  var mapInfo = document.getElementById('mapInfo');
  function setMapRegion(id){
    var r = REGIONS[id];
    document.querySelectorAll('.iso-pin').forEach(function(p){ p.classList.toggle('active', p.getAttribute('data-region') === id); });
    mapInfo.innerHTML =
      '<span class="eyebrow" style="color:var(--gold)">' + r.kicker + '</span>' +
      '<h3>' + r.name + '</h3><p>' + r.desc + '</p>' +
      '<div class="tagrow">' + r.tags.map(function(t){ return '<span class="tagchip">' + t + '</span>'; }).join('') + '</div>';
  }
  document.querySelectorAll('.iso-pin').forEach(function(p){
    p.addEventListener('click', function(){ setMapRegion(p.getAttribute('data-region')); });
  });

  /* ---------- 3D island parallax ---------- */
  var isoScene = document.getElementById('isoScene'), isoCard = document.getElementById('isoCard');
  if(isoScene && isoCard && !reduce){
    isoScene.addEventListener('mousemove', function(e){
      var b = isoScene.getBoundingClientRect();
      var px = (e.clientX - b.left) / b.width - 0.5;
      var py = (e.clientY - b.top) / b.height - 0.5;
      isoCard.style.transform = 'rotateX(' + (14 - py * 26).toFixed(1) + 'deg) rotateY(' + (-12 + px * 32).toFixed(1) + 'deg)';
    });
    isoScene.addEventListener('mouseleave', function(){ isoCard.style.transform = 'rotateX(14deg) rotateY(-12deg)'; });
  }

  /* ---------- custom cursor ---------- */
  var fine = window.matchMedia('(pointer:fine)').matches;
  if(fine && !reduce){
    document.body.classList.add('has-cursor');
    var dot = document.getElementById('cursorDot'), ring = document.getElementById('cursorRing');
    var mx = innerWidth/2, my = innerHeight/2, rx = mx, ry = my;
    window.addEventListener('mousemove', function(ev){
      mx = ev.clientX; my = ev.clientY;
      dot.style.transform = 'translate(' + mx + 'px,' + my + 'px) translate(-50%,-50%)';
    });
    (function loop(){
      rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16;
      ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px) translate(-50%,-50%)';
      requestAnimationFrame(loop);
    })();
    document.addEventListener('mouseover', function(e){ if(e.target.closest('a,button,[data-cursor],.region-btn,.iso-pin,.tier')) ring.classList.add('grow'); });
    document.addEventListener('mouseout', function(e){ if(e.target.closest('a,button,[data-cursor],.region-btn,.iso-pin,.tier')) ring.classList.remove('grow'); });
  }
})();
